import numpy as np
import cv2
import time
import base64
import winsound
import threading
import sqlite3
from flask import Flask, jsonify
from flask_cors import CORS

DB_FILENAME = "agrosec.db"
CONFIDENCE_THRESHOLD = 0.85
TARGET_CLASSES = ["person", "cow", "sheep"]

print("[INFO] Loading MobileNet-SSD model...")
net = cv2.dnn.readNetFromCaffe("MobileNetSSD_deploy.prototxt", "MobileNetSSD_deploy.caffemodel")

CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor"]

def init_local_db():
    try:
        conn = sqlite3.connect(DB_FILENAME)
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS alerts
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          intruderType TEXT,
                          confidence REAL,
                          imageData TEXT,
                          timestamp TEXT,
                          status TEXT)''')
        conn.commit()
        conn.close()
        print("[INFO] Primary Edge SQLite Database Initialized.")
    except Exception as e:
        print(f"[ERROR] Could not initialize SQLite database: {e}")

init_local_db()

app = Flask(__name__)
CORS(app) 

@app.route('/api/intrusions', methods=['GET'])
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
    print("[INFO] Starting Edge API on port 8080")
    app.run(host='0.0.0.0', port=8080, debug=False, use_reloader=False)

def handle_detection(label, confidence, frame):
    actual_time = time.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"\n[!!!] DETECTED A: {label.upper()} ({actual_time})")
    
    status_message = "Audio Deterrent"

    if label == "person":
        print("[ALERT] Human detected! Activating dog bark")
        status_message = "Dog Bark"
        winsound.PlaySound("dog_bark.wav", winsound.SND_FILENAME | winsound.SND_NODEFAULT)
        
    elif label in ["cow", "sheep"]:
        print(f"[ALERT] Livestock ({label}) detected! Activating predator sound...")
        status_message = "Hyena Audio"
        winsound.PlaySound("hyena.wav", winsound.SND_FILENAME | winsound.SND_NODEFAULT)

    frame_resized = cv2.resize(frame, (320, 240))
    _, buffer = cv2.imencode('.jpg', frame_resized)
    base64_image = base64.b64encode(buffer).decode('utf-8')

    print("[INFO] Committing threat directly to local database...")
    try:
        conn = sqlite3.connect(DB_FILENAME)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO alerts (intruderType, confidence, imageData, timestamp, status) VALUES (?, ?, ?, ?, ?)",
                       (str(label), float(confidence * 100), base64_image, actual_time, status_message))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Critical error writing to SQLite: {e}")

if __name__ == '__main__':
    api_thread = threading.Thread(target=run_server, daemon=True)
    api_thread.start()

    print("[INFO] Connecting to Camera Stream...")
    vs = cv2.VideoCapture(1)
    time.sleep(2.0)

    last_trigger_time = 0
    cooldown_period = 5 
    INFERENCE_INTERVAL = 0.5  
    last_inference_time = 0

 
    while True:
        ret, frame = vs.read()
        if not ret:
            print("[ERROR] Failed to grab frame. Checking connection...")
            break
        
        current_time = time.time()
    
        (original_h, original_w) = frame.shape[:2]
        new_width = 640
        new_height = int((new_width / original_w) * original_h)
        frame = cv2.resize(frame, (new_width, new_height))
        (h, w) = frame.shape[:2]
        
        if current_time - last_inference_time > INFERENCE_INTERVAL:
            last_inference_time = current_time 
            
            blob = cv2.dnn.blobFromImage(frame, 0.007843, (300, 300), 127.5)
            net.setInput(blob)
            detections = net.forward()

            for i in range(0, detections.shape[2]):
                confidence = detections[0, 0, i, 2]

                if confidence > CONFIDENCE_THRESHOLD:
                    class_id = int(detections[0, 0, i, 1])
                    label = CLASSES[class_id]
                    if label in TARGET_CLASSES:
                        box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                        (startX, startY, endX, endY) = box.astype("int")
                        text = f"{label}: {confidence * 100:.2f}%"
                        
                        cv2.rectangle(frame, (startX, startY), (endX, endY), (0, 0, 255), 2)
                        cv2.putText(frame, text, (startX, startY - 10), cv2.FONT_HERSHEY_DUPLEX, 0.5, (0, 0, 255), 2)
                        
                        if current_time - last_trigger_time > cooldown_period:
                            detect_thread = threading.Thread(target=handle_detection, args=(label, confidence, frame.copy()))
                            detect_thread.start()
                            last_trigger_time = current_time

        cv2.imshow("Farm Monitor Feed", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    vs.release()
    cv2.destroyAllWindows()