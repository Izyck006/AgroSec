import cv2
import time
import requests
import base64
import winsound
import threading 

# For the system to connect to my phone camera
IP_CAMERA_URL = "http://192.168.0.154:8080/video" 
TARGET_CLASSES = ["person", "cow", "sheep", "horse", "dog"]
API_URL = "http://localhost:8080/api/alerts"
CONFIDENCE_THRESHOLD = 0.65


INFERENCE_INTERVAL = 0.5
GLOBAL_COOLDOWN = 7

print("[INFO] Loading lightweight MobileNet-SSD model...")
net = cv2.dnn.readNetFromCaffe("MobileNetSSD_deploy.prototxt", "MobileNetSSD_deploy.caffemodel")

CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor"]

def play_acoustic_deterrent():
    print("[ALERT] Activating physical presence deterrence audio...")
    winsound.Beep(2500, 1500)


def send_payload_in_background(payload):
    try:
        response = requests.post(API_URL, json=payload, timeout=10)
        if response.status_code == 200:
            print("[INFO] Successfully synced alert data and image to backend.")
    except requests.exceptions.RequestException:
        print("[WARNING] Backend offline or Ngrok tunnel congested.")

def trigger_deterrent(detected_object, confidence_score, frame):
    print(f"\n[!!!] ALERT: {detected_object.upper()} DETECTED!")
    
    play_acoustic_deterrent()

    thumbnail = cv2.resize(frame, (320, 240))
    _, buffer = cv2.imencode('.jpg', thumbnail, [cv2.IMWRITE_JPEG_QUALITY, 20])
    base64_image = base64.b64encode(buffer).decode('utf-8')

    payload = {
        "intruderType": str(detected_object),
        "confidence": float(confidence_score * 100),
        "imageData": base64_image 
    }

    thread = threading.Thread(target=send_payload_in_background, args=(payload,))
    thread.start()

print("[INFO] Connecting to Phone Camera Stream...")
vs = cv2.VideoCapture(IP_CAMERA_URL)
time.sleep(2.0)

last_inference_time = 0 
last_alert_time = 0

while True:
    ret, frame = vs.read()
    if not ret:
        print("[ERROR] Failed to grab frame from phone camera. Checking connection...")
        break
    
    current_time = time.time()
    

    if current_time - last_inference_time > INFERENCE_INTERVAL:
        last_inference_time = current_time 
        
        frame_resized = cv2.resize(frame, (400, 300))
        (h, w) = frame_resized.shape[:2]
        
        blob = cv2.dnn.blobFromImage(cv2.resize(frame_resized, (300, 300)), 0.007843, (300, 300), 127.5)
        net.setInput(blob)
        detections = net.forward()
        
        alert_triggered_this_frame = False

        for i in range(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]

            if confidence > CONFIDENCE_THRESHOLD:
                class_id = int(detections[0, 0, i, 1])
                label = CLASSES[class_id]

                if label in TARGET_CLASSES:
                    box = detections[0, 0, i, 3:7] * [w, h, w, h]
                    (startX, startY, endX, endY) = box.astype("int")
                    
                    display_text = f"{label}: {confidence * 100:.2f}%"
                    cv2.rectangle(frame_resized, (startX, startY), (endX, endY), (0, 0, 255), 2)
                    cv2.putText(frame_resized, display_text, (startX, startY - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                    
                    if not alert_triggered_this_frame and (current_time - last_alert_time > GLOBAL_COOLDOWN):
                        trigger_deterrent(label, confidence, frame_resized)
                        last_alert_time = current_time
                        alert_triggered_this_frame = True
                        
        frame = frame_resized

    cv2.imshow("AgroSec Monitor Feed", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

vs.release()
cv2.destroyAllWindows()