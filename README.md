<img width="777" height="1600" alt="image" src="https://github.com/user-attachments/assets/f71f6c5f-0e91-48ee-ad72-518b8d9ef4ad" />Divido

A receipt-splitting app for group dining. Scan a receipt, join a shared session with everyone at the table, and each person claims what they had, Divido does the rest.

How it works
Scan: a receipt photo is run through on-device OCR (Google ML Kit) to extract words and their positions.
Extract: the OCR output is sent to a backend service that runs a fine-tuned LayoutLMv3 model, which identifies item names, quantities, prices, subtotal, service charge, and total from the raw text and layout.
Review:  extracted items are shown to check/edit before confirming.
Split:  everyone joins the session in real time (Firebase Firestore) and claims the items and quantities they had. Each person's total is calculated proportionally to what they actually claimed.

Stack
App: React Native (Expo), Firebase Firestore for real-time session sync, Google ML Kit for on-device OCR
Backend: Python, FastAPI, serving a fine-tuned LayoutLMv3 model (Hugging Face Transformers)
Model: LayoutLMv3, fine-tuned on the CORD receipt dataset for token-level extraction (item name, quantity, unit price, line total, discount, subtotal, service charge, total)

<table>
  <tr>
    <td><img width="200" alt="Scan receipt" src="https://github.com/user-attachments/assets/87df6ff9-02dd-4b87-aa09-b68fc6de4b51" /></td>
    <td><img width="200" alt="Session code" src="https://github.com/user-attachments/assets/b74febc4-32c8-4716-9b8b-884cbdde7387" /></td>
    <td><img width="200" alt="Claim items" src="https://github.com/user-attachments/assets/90800cf2-1206-4986-b0d9-5c5713ac6e02" /></td>
    <td><img width="200" alt="Bill summary" src="https://github.com/user-attachments/assets/40cb670c-eb56-4237-982d-6273d0f3aa01" /></td>
  </tr>
</table>

