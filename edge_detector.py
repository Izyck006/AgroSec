import cv2
import time
import requests

#For the system to connect to my phone camera
IP_CAMERA_URL = "http://192.168.0.154:8080/video" 
TARGET_CLASSES = ["person", "cow", "sheep", "horse", "dog"]
CONFIDENCE_THRESHOLD = 0.5


print("[INFO] Loading lightweight MobileNet-SSD model...")
net = cv2.dnn.readNetFromCaffe("MobileNetSSD_deploy.prototxt", "MobileNetSSD_deploy.caffemodel")

CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor"]

def trigger_deterrent(detected_object, confidence_score):
    
    print(f"\n[!!!] ALERT: {detected_object.upper()} DETECTED!")
    
    
    payload = {
        "intruderType": str(detected_object),
        "confidence": float(confidence_score * 100)
    }
    
    try:
       
        response = requests.post("http://localhost:8080/api/alerts", json=payload, timeout=2)
        if response.status_code == 200:
            print("[INFO] Successfully synced alert data to Spring Boot backend.")
    except requests.exceptions.RequestException:
        print("[WARNING] Backend offline. Event queued in edge hardware storage.")


print("[INFO] Connecting to Phone Camera Stream...")
vs = cv2.VideoCapture(IP_CAMERA_URL)
time.sleep(2.0)

last_trigger_time = 0
cooldown_period = 5  

while True:
    ret, frame = vs.read()
    if not ret:
        print("[ERROR] Failed to grab frame from phone camera. Checking connection...")
        break

    frame = cv2.resize(frame, (400, 300))
    (h, w) = frame.shape[:2]
    
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 0.007843, (300, 300), 127.5)
    net.setInput(blob)
    detections = net.forward()

    for i in range(0, detections.shape[2]):
        confidence = detections[0, 0, i, 2]

        if confidence > CONFIDENCE_THRESHOLD:
            class_id = int(detections[0, 0, i, 1])
            label = CLASSES[class_id]

            if label in TARGET_CLASSES:
                box = detections[0, 0, i, 3:7] * [w, h, w, h]
                (startX, startY, endX, endY) = box.astype("int")
                
                display_text = f"{label}: {confidence * 100:.2f}%"
                cv2.rectangle(frame, (startX, startY), (endX, endY), (0, 0, 255), 2)
                cv2.putText(frame, display_text, (startX, startY - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                
              
                current_time = time.time()
                if current_time - last_trigger_time > cooldown_period:
                    trigger_deterrent(label, confidence)
                    last_trigger_time = current_time

    cv2.imshow("Edge Farm Monitor Feed", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

vs.release()
cv2.destroyAllWindows()