import cv2
import numpy as np
from ..Database.models import Project
from datetime import datetime, timezone
import hashlib


def hashString(string: str) -> str:
    return hashlib.sha256(string.encode()).hexdigest()


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


def exportProjectToCOCO(project: Project) -> dict:
    current_time = datetime.now(timezone.utc)
    current_year = current_time.year

    time_iso = current_time.isoformat(timespec="seconds")

    info = {
        "year": current_year,
        "version": "1",
        "description": "Exported from Fastotate",
        "contributor": "Fastotate",
        "url": f"https://fastotate.com/annotation/{project.project_id}",
        "date_created": time_iso,
    }

    licenses = [
        {
            "id": 1,
            "name": "Attribution-NonCommercial-ShareAlike License",
            "url": "http://creativecommons.org/licenses/by-nc-sa/2.0/",
        }
    ]

    categories = []
    for i, className in enumerate(project.classes):
        categories.append({"id": i, "name": className, "supercategory": "object"})

    images = []
    annotations = []
    for i, image in enumerate(project.imageAnnotations):
        images.append(
            {
                "id": i,
                "width": image.width,
                "height": image.height,
                "file_name": image.file_name,
                "license": 1,
                "date_captured": time_iso,
            }
        )

        for j, annotation in enumerate(image.annotations):
            annotations.append(
                {
                    "id": j,
                    "image_id": i,
                    "category_id": project.classes.index(annotation.className),
                    "segmentation": [
                        coord for vertex in annotation.points for coord in vertex
                    ],
                    "area": annotation.area,
                    "bbox": [],
                    "iscrowd": 0,
                }
            )

    return {
        "info": info,
        "licenses": licenses,
        "categories": categories,
        "images": images,
        "annotations": annotations,
    }
