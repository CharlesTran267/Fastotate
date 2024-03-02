import cv2
import numpy as np


def findVerticesFromMasks(masks: np.ndarray):
    masks = masks[0, :, :]
    masks = 255 * np.uint8(masks)
    contours, hierarchy = cv2.findContours(
        masks, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    # Approximate contours to polygons and get vertices
    vertices = []
    for contour in contours:
        epsilon = 0.01 * cv2.arcLength(contour, True)  # Adjust epsilon for your needs
        approx = cv2.approxPolyDP(contour, epsilon, True)
        approx = approx.reshape(-1, 2).tolist()
        vertices.append(approx)
    return vertices
