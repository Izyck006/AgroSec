import time
import base64

import cv2
import requests

from config import PRIMARY_API_URL
from db_manager import save_alert


def build_alert_payload(label, confidence, image_data, status, timestamp=None):
    if timestamp is None:
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%S")
    return {
        "intruderType": str(label),
        "confidence": float(confidence),
        "imageData": image_data,
        "timestamp": timestamp,
        "status": status,
    }


def encode_frame(frame, size=(320, 240)):
    resized = cv2.resize(frame, size)
    success, buffer = cv2.imencode(".jpg", resized)
    if not success:
        raise RuntimeError("Failed to encode frame as JPEG")
    return base64.b64encode(buffer).decode("utf-8")


def post_alert(payload, timeout=10):
    try:
        response = requests.post(PRIMARY_API_URL, json=payload, timeout=timeout)
        if response.status_code == 200:
            print("[INFO] Synced to primary backend successfully.")
            return True
        print(f"[WARNING] Backend rejected send (Status: {response.status_code}). Saving to SQLite.")
        save_alert(payload)
        return False
    except requests.exceptions.Timeout:
        print(f"[WARNING] Connection timed out ({timeout}s limit). Saving to backup cache.")
        save_alert(payload)
        return False
    except requests.exceptions.RequestException:
        print("[WARNING] Backend unreachable. Saving to backup cache.")
        save_alert(payload)
        return False
