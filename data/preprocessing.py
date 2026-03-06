import cv2
import numpy as np

def preprocess_image(img):
    img = cv2.resize(img, (224, 224))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    clahe = cv2.createCLAHE(clipLimit=2.0)
    img = clahe.apply(img)

    img = img.astype('float32') / 255.0
    return np.expand_dims(img, axis=0)
