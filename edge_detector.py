import numpy as np
import cv2
import time
import winsound
import threading

from config import (
    PRIMARY_API_URL,
    CONFIDENCE_THRESHOLD,
    TARGET_CLASSES,
    CLASSES,
    MODEL_PROTOTXT,
    MODEL_CAFFEMODEL,
)
from db_manager import init_local_db, get_db_connection, save_alert, fetch_pending_alerts, delete_alert
from alert_service import build_alert_payload, encode_frame, post_alert

print("[INFO] Loading MobileNet-SSD model...")
net = cv2.dnn.readNetFromCaffe(MODEL_PROTOTXT, MODEL_CAFFEMODEL)

init_local_db()


def sync_cached_alerts_loop():
    print("[SYNC] Starting background SQLite sync thread.")
    while True:
        time.sleep(15)
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT id, intruderType, confidence, imageData, timestamp, status "
                    "FROM alerts_cache ORDER BY timestamp ASC LIMIT 5"
                )
                rows = cursor.fetchall()

                if rows:
                    print(f"[SYNC] Detected {len(rows)} alerts in offline cache. Backend may be back. Attempting sync...")
                    for row in rows:
                        row_id = row[0]
                        original_status = row[5] if row[5] else "Deterred (Synced)"
                        cached_payload = build_alert_payload(
                            label=row[1],
                            confidence=row[2],
                            image_data=row[3],
                            status=original_status,
                            timestamp=row[4],
                        )

                        try:
                            import requests
                            response = requests.post(PRIMARY_API_URL, json=cached_payload, timeout=5)
                            if response.status_code == 200:
                                delete_alert(conn, row_id)
                                print(f"[SYNC] Synced alert from {cached_payload['timestamp']} successfully.")
                            else:
                                print(f"[SYNC] Backend rejected alert (Status: {response.status_code}). Stopping sync loop.")
                                print(f"[SERVER SAID]: {response.text}")
                                break
                        except Exception:
                            print("[SYNC] Backend still unreachable. Stopping sync loop.")
                            break
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

    base64_image = encode_frame(frame)
    alert_payload = build_alert_payload(
        label=label,
        confidence=confidence * 100,
        image_data=base64_image,
        status=status_message,
        timestamp=actual_time,
    )

    print("[INFO] Attempting sync with backend...")
    post_alert(alert_payload, timeout=10)


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
