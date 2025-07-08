from flask import Blueprint, request, jsonify
from livekit.plugins import assemblyai
from livekit.agents import AgentSession
import os
import tempfile

assemblyai_stt_bp = Blueprint('assemblyai_stt', __name__)

@assemblyai_stt_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
        file.save(temp_audio)
        temp_audio_path = temp_audio.name

    try:
        # Set up the session
        session = AgentSession(
            stt=assemblyai.STT(),
        )
        # Transcribe the audio file
        transcript = session.stt.transcribe(temp_audio_path)
        return jsonify({'transcript': transcript})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(temp_audio_path) 