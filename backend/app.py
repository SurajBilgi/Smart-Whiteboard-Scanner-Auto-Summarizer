import os
import logging
import base64
import requests
import time  # ✅ Import time module for unique filenames
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Load OpenAI API Key from .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API Key. Set OPENAI_API_KEY in the .env file.")

# Flask Setup
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Dictionary to store chat history per image
chat_histories = {}

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def encode_image(image_path):
    """Encodes an image as a base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def get_image_explanation(image_data):
    """Sends the image to OpenAI and gets an explanation."""
    prompt = "Describe in detail what the professor is teaching in this image. Provide an in-depth explanation."

    openai_api_url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": "You are an expert educator. Your job is to explain images related to classroom teaching."},
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_data}"}}
            ]}
        ],
        "max_tokens": 500
    }
    
    try:
        response = requests.post(openai_api_url, headers=headers, json=payload, timeout=300)
        response.raise_for_status()
        openai_response = response.json()

        # Extract OpenAI's response
        explanation = openai_response["choices"][0]["message"]["content"]
        return explanation

    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling OpenAI: {e}")
        return None

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handles image uploads, gets explanation, and stores context."""
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Generate a unique filename using timestamp
    timestamp = str(int(time.time()))  # Current UNIX timestamp
    extension = os.path.splitext(file.filename)[1]  # Get file extension (.png, .jpg, etc.)
    new_filename = f"image_{timestamp}{extension}"  # Create new filename (e.g., image_1700001234.png)
    filepath = os.path.join(UPLOAD_FOLDER, new_filename)
    file.save(filepath)

    # Encode the image
    encoded_image = encode_image(filepath)

    # Get explanation from OpenAI
    explanation = get_image_explanation(encoded_image)
    
    if explanation is None:
        return jsonify({"error": "Failed to get explanation from OpenAI"}), 500

    # Use new_filename (without extension) as image_id
    image_id = os.path.splitext(new_filename)[0]  # e.g., "image_1700001234"

    # Store chat history for this image
    chat_histories[image_id] = [
        {"role": "system", "content": "You are a helpful AI that assists with questions based on an image and its explanation."},
        {"role": "assistant", "content": explanation}  # Explanation as initial context
    ]

    logging.info(f"✅ Chat History Initialized for {image_id}: {chat_histories[image_id]}")

    return jsonify({"image_id": image_id, "explanation": explanation})  # ✅ Returning plain text explanation

def chat_with_openai(image_id, user_message):
    """Sends user messages to OpenAI along with full conversation history."""
    if image_id not in chat_histories:
        return {"error": "No chat history found for this image."}

    # Append user message to history
    chat_histories[image_id].append({"role": "user", "content": user_message})

    openai_api_url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "gpt-4o", "messages": chat_histories[image_id], "max_tokens": 500}

    try:
        response = requests.post(openai_api_url, headers=headers, json=payload, timeout=300)
        response.raise_for_status()
        openai_response = response.json()

        # Extract OpenAI's response
        assistant_message = openai_response["choices"][0]["message"]["content"]

        # Append assistant's response to chat history
        chat_histories[image_id].append({"role": "assistant", "content": assistant_message})

        # ✅ Log the updated chat history
        logging.info(f"📝 Updated Chat History for {image_id}: {chat_histories[image_id]}")

        return {"response": assistant_message}  # ✅ Returning plain text response

    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling OpenAI: {e}")
        return {"error": str(e)}

@app.route('/chat', methods=['POST'])
def chat():
    """Handles user questions based on the image explanation."""
    data = request.get_json()
    image_id = data.get("image_id")
    user_message = data.get("message", "")

    if not image_id or not user_message:
        return jsonify({"error": "Missing image_id or message"}), 400

    response = chat_with_openai(image_id, user_message)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
