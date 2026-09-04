import base64
import io
 
import torch
from fastapi import FastAPI, HTTPException
from PIL import Image
from pydantic import BaseModel
from transformers import LayoutLMv3ForTokenClassification, LayoutLMv3Processor
from typing import List, Optional
 
from Inference import (
    id2label,
    normalize_box,
    merge_entities,
    clean_entities,
    group_items,
    extract_receipt_level_fields,
)
 
CHECKPOINT = "./checkpoint-700"

processor = LayoutLMv3Processor.from_pretrained("microsoft/layoutlmv3-base", apply_ocr=False)
processor.save_pretrained("./checkpoint-700")
model = LayoutLMv3ForTokenClassification.from_pretrained(CHECKPOINT)
model.eval()
 
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
 
app = FastAPI(title="Divido OCR Backend")
 
 
# ===== REQUEST / RESPONSE SCHEMAS =====
class ScanRequest(BaseModel):
    words: List[str]
    boxes: List[List[int]]       # [x0, y0, x1, y1] per word
    image_base64: str            # the receipt photo
    image_width: int
    image_height: int
 
 
class Item(BaseModel):
    name: str
    quantity: Optional[str] = None
    unit_price: Optional[str] = None
    line_total: Optional[str] = None
    discount_price: Optional[str] = None
 
 
class ScanResponse(BaseModel):
    items: List[Item]
    subtotal: Optional[str] = None
    service_charge: Optional[str] = None
    total: Optional[str] = None
 
 

@app.get("/health")
def health():
    return {"status": "ok", "device": str(device)}
 
 

@app.post("/extract-items", response_model=ScanResponse)
def extract_items(request: ScanRequest):
    if len(request.words) != len(request.boxes):
        raise HTTPException(
            status_code=400,
            detail=f"words and boxes length mismatch: {len(request.words)} vs {len(request.boxes)}",
        )
 
    try:
        image_bytes = base64.b64decode(request.image_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"could not decode image: {e}")
 
    boxes = [
        normalize_box(box, request.image_width, request.image_height)
        for box in request.boxes
    ]
 
    encoding = processor(
        image,
        request.words,
        boxes=boxes,
        truncation=True,
        padding="max_length",
        return_tensors="pt",
    )
    word_ids = encoding.word_ids(batch_index=0)
    encoding = {k: v.to(device) for k, v in encoding.items()}
 
    with torch.no_grad():
        outputs = model(**encoding)
 
    predictions = torch.argmax(outputs.logits, dim=2)[0].tolist()
 
    word_labels = []
    seen = set()
    for token_idx, w_idx in enumerate(word_ids):
        if w_idx is None or w_idx in seen:
            continue
        seen.add(w_idx)
        word_labels.append(id2label[predictions[token_idx]])
 
    entities = merge_entities(request.words, word_labels)
    cleaned = clean_entities(entities)
    items_raw = group_items(cleaned)
    receipt_level = extract_receipt_level_fields(cleaned)
 
    return ScanResponse(
        items=[Item(**item) for item in items_raw],
        subtotal=receipt_level.get("SUBTOTAL"),
        service_charge=receipt_level.get("SERVICE_CHARGE"),
        total=receipt_level.get("TOTAL"),
    )