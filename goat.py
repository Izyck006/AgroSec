import cv2
import face_recognition

from edge_detector import PRIMARY_API_URL, CONFIDENCE_THRESHOLD, net, save_alert_to_backup
import time

img = cv2.imread('goat image.jpg')
rpg_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
img_encoding = face_recognition.face_encodings(rpg_img)[0]

results = face_recognition.compare_faces([img_encoding], img_encoding)
print(results)


cv2.imshow('Goat Image', rpg_img)
cv2.waitKey(0)
