PRIMARY_API_URL = "http://localhost:8080/api/alerts"
DB_FILENAME = "agrosec_cache.db"
CONFIDENCE_THRESHOLD = 0.85
TARGET_CLASSES = ["person", "cow", "sheep"]

CLASSES = [
    "background", "aeroplane", "bicycle", "bird", "boat",
    "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
    "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
    "sofa", "train", "tvmonitor",
]

MODEL_PROTOTXT = "MobileNetSSD_deploy.prototxt"
MODEL_CAFFEMODEL = "MobileNetSSD_deploy.caffemodel"
