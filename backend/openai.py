import logging
import requests
import base64
import os

from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Fetch API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Check if the key is missing
if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API Key. Set OPENAI_API_KEY in the .env file.")


# Get the API key securely from .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API Key. Set OPENAI_API_KEY in the .env file.")

def send_image_to_openai(image_data):
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
        response = requests.post(
            openai_api_url, headers=headers, json=payload, timeout=300
        )
        response.raise_for_status()
        resp_json = response.json()
        logging.info(f"OpenAI response received: {resp_json}")
        return resp_json
    except Exception as e:
        logging.error(f"Error calling OpenAI: {e}")
        return None


# ✅ Encode the image correctly
image_path = "uploads/an-introduction-to-linear-algebra.png"
with open(image_path, "rb") as image_file:
    encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

# ✅ Send the properly formatted image data to OpenAI
response = send_image_to_openai(encoded_image)
print(response)
