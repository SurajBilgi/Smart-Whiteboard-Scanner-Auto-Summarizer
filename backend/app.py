from flask import Flask, request, jsonify
import os
from flask_cors import CORS  # Import CORS

import uuid

app = Flask(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes



UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['image']
    filename = f"{uuid.uuid4().hex}.jpg"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    return jsonify({"message": "Image uploaded successfully", "file": filename})

if __name__ == '__main__':
    app.run(debug=True)
