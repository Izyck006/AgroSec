import numpy as np
import cv2
import time
import requests
import base64
import winsound
import threading
import sqlite3

PRIMARY_API_URL = "http://localhost:8080/api/alerts"
#To connect to phone camera
#IP_CAMERA_URL = "http://192.168.0.154:8080/video"

DB_FILENAME = "agrosec_cache.db"
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
        cursor.execute('''CREATE TABLE IF NOT EXISTS alerts_cache
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          intruderType TEXT,
                          confidence REAL,
                          imageData TEXT,
                          timestamp TEXT)''')
        conn.commit()
        conn.close()
        print("[INFO] Local SQLite Cache Initialized.")
    except Exception as e:
        print(f"[ERROR] Could not initialize SQLite database: {e}")

init_local_db()

def save_alert_to_backup(alert_payload):
    print(f"[BACKUP] Writing alert ({alert_payload['intruderType']}) to database.")
    try:
        conn = sqlite3.connect(DB_FILENAME)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO alerts_cache (intruderType, confidence, imageData, timestamp) VALUES (?, ?, ?, ?)",
                       (alert_payload['intruderType'],
                        alert_payload['confidence'],
                        alert_payload['imageData'],
                        alert_payload['timestamp']))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Critical error writing to SQLite cache: {e}")


def sync_cached_alerts_loop():
    print("[SYNC] Starting background SQLite sync thread.")
    while True:
        time.sleep(15)
        try:
            conn = sqlite3.connect(DB_FILENAME)
            cursor = conn.cursor()
            cursor.execute("SELECT id, intruderType, confidence, imageData, timestamp FROM alerts_cache ORDER BY timestamp ASC LIMIT 5")
            rows = cursor.fetchall()

            if rows:
                print(f"[SYNC] Detected {len(rows)} alerts in offline cache. Backend may be back. Attempting sync...")
                for row in rows:
                    row_id = row[0]
                    cached_payload = {
                        "intruderType": row[1],
                        "confidence": row[2],
                        "imageData": row[3],
                        "timestamp": row[4],
                        "status": "Deterred (Synced)"
                    }

                    try:
                        response = requests.post(PRIMARY_API_URL, json=cached_payload, timeout=5)
                        if response.status_code == 200:
                            cursor.execute("DELETE FROM alerts_cache WHERE id=?", (row_id,))
                            conn.commit()
                            print(f"[SYNC] Synced alert from {cached_payload['timestamp']} successfully.")
                        else:
                            print(f"[SYNC] Backend rejected alert (Status: {response.status_code}). Stopping sync loop.")
                            print(f"[SERVER SAID]: {response.text}")
                            break
                    except requests.exceptions.RequestException:
                        print("[SYNC] Backend still unreachable. Stopping sync loop.")
                        break
            conn.close()
        except Exception as e:
            print(f"[ERROR] Sync loop exception: {e}")

sync_thread = threading.Thread(target=sync_cached_alerts_loop, daemon=True)
sync_thread.start()


def handle_detection(label, confidence, frame):
    actual_time = time.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"\n[!!!] DETECTED A: {label.upper()} ({actual_time})")
    
    status_message = "Audio Deterrent"

    if label == "person":
        print("[ALERT] Human detected! Activating dog bark...")
        status_message = "Dog Bark"
        winsound.PlaySound("dog_bark.wav", winsound.SND_FILENAME | winsound.SND_NODEFAULT)
        
    elif label in ["cow", "sheep"]:
        print(f"[ALERT] Livestock ({label}) detected! Activating predator sound...")
        status_message = "Hyena Audio"
        winsound.PlaySound("hyena.wav", winsound.SND_FILENAME | winsound.SND_NODEFAULT)


    frame_resized = cv2.resize(frame, (320, 240))
    _, buffer = cv2.imencode('.jpg', frame_resized)
    base64_image = base64.b64encode(buffer).decode('utf-8')

    alert_payload = {
        "intruderType": str(label),
        "confidence": float(confidence * 100),
        "imageData": base64_image,
        "timestamp": actual_time,
        "status": status_message
    }
   
    print("[INFO] Attempting sync with backend...")
    try:
        response = requests.post(PRIMARY_API_URL, json=alert_payload, timeout=10)
        if response.status_code == 200:
            print("[INFO] Synced to primary backend successfully.")
        else:
            print(f"[WARNING] Backend rejected send (Status: {response.status_code}). Saving to SQLite.")
            save_alert_to_backup(alert_payload)
    except requests.exceptions.Timeout:
        print("[WARNING] Connection timed out (10s limit). Saving to backup cache.")
        save_alert_to_backup(alert_payload)
    except requests.exceptions.RequestException:
        print("[WARNING] Backend unreachable. Saving to backup cache.")
        save_alert_to_backup(alert_payload)


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