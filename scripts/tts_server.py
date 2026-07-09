"""
🔒 Lab AI Core: Local XTTS Voice Cloning Server
===============================================
This server runs locally to clone your voice for free using your downloaded voice sample.
It integrates with your portfolio website's chatbot in real-time.

Requirements:
  pip install Flask flask-cors TTS soundfile

Usage:
1. Place a 10-second high-quality audio recording of your voice (named 'my_voice_sample.wav') 
   in the same folder as this script.
2. Run this script:
   python tts_server.py
3. Set your active speech engine in your Admin Panel to 'Local XTTS Python Server'.
"""

import os
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for browser connections

# Path to your voice sample file
VOICE_SAMPLE = os.path.join(os.path.dirname(__file__), "my_voice_sample.wav")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "output.wav")

tts = None

def init_tts():
    global tts
    try:
        from TTS.api import TTS
        print("[+] Loading local XTTS voice cloning model. This may take a moment...")
        # Load the fastest multi-speaker and voice cloning model
        tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)
        print("[+] Model loaded successfully!")
    except Exception as e:
        print(f"[-] Error loading XTTS: {e}")
        print("[-] Fallback: Ensure 'my_voice_sample.wav' exists and you installed requirements.")

@app.route("/tts", methods=["POST"])
def text_to_speech():
    global tts
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"]
    print(f"[+] Synthesizing: '{text}'")

    # If XTTS isn't fully loaded, try initialization
    if tts is None:
        init_tts()

    if tts is None:
        return jsonify({"error": "TTS engine not loaded. Check server logs."}), 500

    if not os.path.exists(VOICE_SAMPLE):
        return jsonify({
            "error": f"Voice sample not found at '{VOICE_SAMPLE}'. Please place your my_voice_sample.wav file there."
        }), 400

    try:
        # Generate cloned voice audio from text and voice sample
        tts.tts_to_file(
            text=text,
            speaker_wav=VOICE_SAMPLE,
            language="en",
            file_path=OUTPUT_PATH
        )
        return send_file(OUTPUT_PATH, mimetype="audio/wav")
    except Exception as e:
        print(f"[-] Synthesis failed: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("=" * 60)
    print("          STARTING LOCAL XTTS CLONE VOICE SERVER")
    print("=" * 60)
    if not os.path.exists(VOICE_SAMPLE):
        print(f"[WARNING] Please place your cloned voice sample file at: {VOICE_SAMPLE}")
        print("Otherwise synthesis requests will return an error.")
        
    init_tts()
    app.run(host="localhost", port=5000, debug=False)
