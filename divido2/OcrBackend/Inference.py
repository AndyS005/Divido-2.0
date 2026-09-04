import re
 
# Tag schema
label_list = ["O",
              "B-ITEM_NAME", "I-ITEM_NAME",
              "B-ITEM_QTY", "I-ITEM_QTY",
              "B-ITEM_UNIT_PRICE", "I-ITEM_UNIT_PRICE",
              "B-ITEM_LINE_TOTAL", "I-ITEM_LINE_TOTAL",
              "B-ITEM_DISCOUNT_PRICE", "I-ITEM_DISCOUNT_PRICE",
              "B-SUBTOTAL", "I-SUBTOTAL",
              "B-SERVICE_CHARGE", "I-SERVICE_CHARGE",
              "B-TOTAL", "I-TOTAL"]
label2id = {label: i for i, label in enumerate(label_list)}
id2label = {i: label for i, label in enumerate(label_list)}
 
ITEM_FIELDS = {"ITEM_NAME", "ITEM_QTY", "ITEM_UNIT_PRICE", "ITEM_LINE_TOTAL", "ITEM_DISCOUNT_PRICE"}
FIELD_MAP = {
    "ITEM_QTY": "quantity",
    "ITEM_UNIT_PRICE": "unit_price",
    "ITEM_LINE_TOTAL": "line_total",
    "ITEM_DISCOUNT_PRICE": "discount_price",
}

NUMERIC_LABELS = {"SUBTOTAL", "SERVICE_CHARGE", "TOTAL"}

def normalize_box(box, width, height):
    return [
        max(0, min(999, int(1000 * box[0] / width))),
        max(0, min(999, int(1000 * box[1] / height))),
        max(0, min(999, int(1000 * box[2] / width))),
        max(0, min(999, int(1000 * box[3] / height))),
    ]


def merge_entities(words, labels):
    entities = []
    current_words = []
    current_label = None
 
    for word, label in zip(words, labels):
        if label == "O":
            if current_words:
                entities.append({"label": current_label, "text": " ".join(current_words)})
                current_words = []
                current_label = None
            continue
 
        prefix, tag = label.split("-")
 
        if prefix == "B":
            if current_words:
                entities.append({"label": current_label, "text": " ".join(current_words)})
            current_words = [word]
            current_label = tag
        elif prefix == "I":
            current_words.append(word)
 
    if current_words:
        entities.append({"label": current_label, "text": " ".join(current_words)})
 
    return entities

#eg = subtotal £30 - 30
def extract_number(text):
    match = re.search(r"[\d,]+\.?\d*", text)
    if match:
        return match.group()
    return None
 
 
def clean_entities(entities):
    cleaned = []
    for e in entities:
        if e["label"] in NUMERIC_LABELS:
            number = extract_number(e["text"])
            cleaned.append({"label": e["label"], "text": number})
        else:
            cleaned.append(e)
    return cleaned

def group_items(entities):
    items = []
    current_item = None
    pending_fields = {}
    seen_first_item = False

    for e in entities:
        if e["label"] not in ITEM_FIELDS:
            if current_item:
                items.append(current_item)
                current_item = None
            continue

        if e["label"] == "ITEM_NAME":
            if current_item:
                items.append(current_item)
            current_item = {"name": e["text"], **pending_fields}
            pending_fields = {}
            seen_first_item = True
        else:
            field_key = FIELD_MAP[e["label"]]
            if current_item is not None and field_key not in current_item:
                current_item[field_key] = e["text"]
            elif seen_first_item:
                pending_fields[field_key] = e["text"]

    if current_item:
        items.append(current_item)

    return items

def extract_receipt_level_fields(cleaned_entities):
    receipt_level = {}
    for e in cleaned_entities:
        if e["label"] not in ITEM_FIELDS:
            receipt_level[e["label"]] = e["text"]
    return receipt_level