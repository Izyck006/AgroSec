import base64
import os
import sqlite3
import threading
import time
import winsound
import cv2
import numpy as np
from flask import Flask, jsonify
from flask_cors import CORS
from ultralytics import YOLO

DB_FILENAME = "agrosec.db"
CONFIDENCE_THRESHOLD = 0.85
TARGET_CLASSES = ["person", "cow", "sheep", "dog"]
INFERENCE_INTERVAL = 0.4
COOLDOWN_PERIOD = 5.0

model = YOLO("agrosec.pt")

def init_local_db():
    try:
        conn = sqlite3.connect(DB_FILENAME)
        cursor = conn.cursor()
        cursor.execute(
            """CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                intruderType TEXT,
                confidence REAL,
                imageData TEXT,
                timestamp TEXT,
                status TEXT
            )"""
        )
        conn.commit()
        conn.close()
        print("[DB] SQLite Database initialized successfully.")
    except Exception as e:
        print(f"[DB ERROR] Could not initialize database: {e}")

init_local_db()

app = Flask(__name__)
CORS(app)

@app.route("/api/intrusions", methods=["GET"])
def get_intrusions():
    try:
        conn = sqlite3.connect(DB_FILENAME, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50")
        rows = cursor.fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def run_server():
    app.run(host="0.0.0.0", port=8080, debug=False, use_reloader=False)

def handle_detection(label, confidence, frame):
    actual_time = time.strftime("%Y-%m-%dT%H:%M:%S")
    display_time = time.strftime("%A, %b %d, %Y at %I:%M:%S %p")
    label_clean = label.lower().strip()
    
    print(f"\n[ALERT] INTRUSION DETECTED: {label_clean.upper()} ({confidence * 100:.1f}%) at {display_time}")

    status_message = "Audio Deterrence"

    if label_clean == "person":
        status_message = "Dog Bark Deterrence"
        if os.path.exists("dog_bark.wav"):
            winsound.PlaySound("dog_bark.wav", winsound.SND_FILENAME | winsound.SND_NODEFAULT)
        else:
            winsound.Beep(1000, 500)
            
    elif label_clean in ["cow", "sheep", "dog"]:
        status_message = "Predator Deterrence"
        if os.path.exists("hyena.wav"):
            winsound.PlaySound("hyena.wav", winsound.SND_FILENAME | winsound.SND_NODEFAULT)
        else:
            winsound.Beep(2000, 700)

    frame_resized = cv2.resize(frame, (320, 240))
    _, buffer = cv2.imencode(".jpg", frame_resized)
    base64_image = base64.b64encode(buffer).decode("utf-8")

    try:
        conn = sqlite3.connect(DB_FILENAME)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO alerts (intruderType, confidence, imageData, timestamp, status) VALUES (?, ?, ?, ?, ?)",
            (label_clean, float(confidence * 100), base64_image, actual_time, status_message),
        )
        conn.commit()
        conn.close()
        print(f"[DB] Alert logged: {label_clean} ({status_message})")
    except Exception as e:
        print(f"[DB ERROR] Failed to record alert: {e}")

if __name__ == "__main__":
    api_thread = threading.Thread(target=run_server, daemon=True)
    api_thread.start()

    print("[STREAM] Connecting to camera feed...")
    vs = cv2.VideoCapture(1)
    if not vs.isOpened():
        print("[STREAM] External camera unavailable")
        vs = cv2.VideoCapture(0)

    time.sleep(1.5)

    last_trigger_time = 0.0
    last_inference_time = 0.0
    active_boxes = []

    while True:
        ret, frame = vs.read()
        if not ret:
            print("[ERROR] Camera stream interrupted.")
            break

        current_time = time.time()

        original_h, original_w = frame.shape[:2]
        new_width = 640
        new_height = int((new_width / original_w) * original_h)
        frame = cv2.resize(frame, (new_width, new_height))

        if current_time - last_inference_time > INFERENCE_INTERVAL:
            last_inference_time = current_time
            active_boxes = []
            
            results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)

            best_detection = None
            highest_conf = 0.0

            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    raw_label = str(model.names[cls_id])
                    clean_label = raw_label.lower().strip()
                    confidence = float(box.conf[0])

                    if clean_label in TARGET_CLASSES:
                        startX, startY, endX, endY = map(int, box.xyxy[0])
                        active_boxes.append((startX, startY, endX, endY, clean_label, confidence))

                        # Track the most confident detection in the frame
                        if confidence > highest_conf:
                            highest_conf = confidence
                            best_detection = (clean_label, confidence, frame.copy())

            # Only trigger deterrence and DB logging for the highest confidence target
            if best_detection and (current_time - last_trigger_time > COOLDOWN_PERIOD):
                last_trigger_time = current_time
                threading.Thread(
                    target=handle_detection,
                    args=best_detection,
                    daemon=True
                ).start()

        for (sX, sY, eX, eY, lbl, conf) in active_boxes:
            box_color = (0, 0, 255) if lbl == "person" else (0, 255, 0)
            text = f"{lbl.capitalize()}: {conf * 100:.1f}%"
            cv2.rectangle(frame, (sX, sY), (eX, eY), box_color, 2)
            cv2.putText(
                frame, text, (sX, max(sY - 8, 15)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, box_color, 2
            )

        cv2.imshow("AgroSec Edge Monitor", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    vs.release()
    cv2.destroyAllWindows()