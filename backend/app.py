import os
import logging
import base64
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

# Fetch API Key from .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API Key. Set OPENAI_API_KEY in the .env file.")

# Flask App Initialization
app = Flask(__name__)
CORS(app)

# Directory to store uploaded images
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def encode_image(image_path):
    """Encodes image to base64."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def send_image_to_openai(image_data):
    """Sends the image to OpenAI for analysis and extracts the response."""
    prompt = "Can you explain what the professor is teaching? Provide a detailed explanation related to the topic."

    openai_api_url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_data}"}},
                ],
            }
        ],
        "max_tokens": 500,
        "temperature": 0.7,
    }
    
    try:
        logging.info("Sending image and prompt to OpenAI.")
        response = requests.post(openai_api_url, headers=headers, json=payload, timeout=300)
        response.raise_for_status()
        openai_response = response.json()

        # Extract actual response text from OpenAI's response
        if "choices" in openai_response and len(openai_response["choices"]) > 0:
            explanation = openai_response["choices"][0]["message"]["content"]
        else:
            explanation = "No response received from OpenAI."

        return {"explanation": explanation, "openai_raw_response": openai_response}  # Include full response for debugging

    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling OpenAI: {e}")
        return {"error": str(e)}

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handles image uploads, processes them, and sends to OpenAI."""
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the uploaded file
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Encode the image to base64
    encoded_image = encode_image(filepath)

    # Send image to OpenAI and get response
    openai_response = send_image_to_openai(encoded_image)
    print(openai_response)
    return jsonify(openai_response)  # ✅ Send OpenAI's response directly

if __name__ == '__main__':
    app.run(debug=True)
