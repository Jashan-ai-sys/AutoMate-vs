import queue
import sys
import time
import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel
import websocket

WS_URL = "ws://127.0.0.1:8765"
SAMPLE_RATE = 16000
BLOCK_DURATION = 1.0  # seconds

print("⏳ Loading faster-whisper (tiny.en)…")
from faster_whisper import WhisperModel
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if device == "cuda" else "int8"

# Force CPU if you’re inside Codespaces or have GPU errors
device = "cpu"
compute_type = "int8"

print(f"⏳ Loading faster-whisper (tiny.en) on {device}…")
model = WhisperModel("tiny.en", device=device, compute_type=compute_type)
print(f"✅ Model loaded on {device}.")


audio_q = queue.Queue()

def send_text(text: str):
    """Send recognized text to VS Code."""
    if not text.strip():
        return
    try:
        ws = websocket.create_connection(WS_URL, timeout=2)
        ws.send(text)
        ws.close()
        print(f"→ sent: {text}")
    except Exception as e:
        print("⚠️ WebSocket error:", e)

def audio_callback(indata, frames, time_info, status):
    if status:
        print(status, file=sys.stderr)
    audio_q.put(indata.copy())

def listen_loop():
    print("🎤 Listening… (Ctrl+C to stop)")
    buffer = np.empty((0, 1), dtype=np.float32)
    last_ts = time.time()

    while True:
        try:
            data = audio_q.get()
            buffer = np.concatenate((buffer, data))

            if time.time() - last_ts > 2.5:  # process every ~2.5 s
                pcm = (buffer * 32767).astype(np.int16)
                segments, _ = model.transcribe(pcm, language="en")
                text = " ".join(s.text.strip() for s in segments).strip()
                if text:
                    print("🗣️ You said:", text)
                    send_text(text)
                buffer = np.empty((0, 1), dtype=np.float32)
                last_ts = time.time()
        except KeyboardInterrupt:
            print("🛑 Stopped.")
            break
        except Exception as e:
            print("Error:", e)
            time.sleep(1)

def main():
    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        blocksize=int(SAMPLE_RATE * BLOCK_DURATION),
        channels=1,
        dtype="float32",
        callback=audio_callback,
    ):
        listen_loop()

if __name__ == "__main__":
    main()
