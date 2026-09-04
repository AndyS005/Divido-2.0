Divido

A receipt-splitting app for group dining. Scan a receipt, join a shared session with everyone at the table, and each person claims what they had, Divido does the rest.

How it works
Scan — a receipt photo is run through on-device OCR (Google ML Kit) to extract words and their positions.
Extract — the OCR output is sent to a backend service that runs a fine-tuned LayoutLMv3 model, which identifies item names, quantities, prices, subtotal, service charge, and total from the raw text and layout.
Review — extracted items are shown to check/edit before confirming.
Split — everyone joins the session in real time (Firebase Firestore) and claims the items and quantities they had. Each person's total is calculated proportionally to what they actually claimed.

Stack
App: React Native (Expo), Firebase Firestore for real-time session sync, Google ML Kit for on-device OCR
Backend: Python, FastAPI, serving a fine-tuned LayoutLMv3 model (Hugging Face Transformers)
Model: LayoutLMv3, fine-tuned on the CORD receipt dataset for token-level extraction (item name, quantity, unit price, line total, discount, subtotal, service charge, total)
