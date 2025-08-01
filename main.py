import os
import base64
from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
from elevenlabs import generate, set_api_key
import os
from dotenv import load_dotenv

load_dotenv()  # only necessary if using a local .env file

# Loading API keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(model_name="gemini-2.0-flash")
set_api_key(ELEVENLABS_API_KEY)

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    print("User input:", user_input)

    try:
        #Gemini response
        response = model.generate_content(user_input)
        ai_reply = response.text.strip()
        print("Gemini response:", ai_reply)
    except Exception as e:
        print("Gemini error:", e)
        return jsonify({
            "response": "Sorry, I couldn’t generate a reply.",
            "audio": None
        })

    audio_url = None
    try:
        #ElevenLabs audio
        audio_bytes = generate(text=ai_reply, voice="Aria")
        with open("static/response.mp3", "wb") as f:
            f.write(audio_bytes)
        audio_url = "/static/response.mp3"
    except Exception as e:
        print("ElevenLabs error:", e)

    print("Returning JSON:", {"response": ai_reply, "audio": audio_url})
    return jsonify({"response": ai_reply, "audio": audio_url})


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=8080)
