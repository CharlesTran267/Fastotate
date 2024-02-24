from segment_anything import SamPredictor, sam_model_registry
import cv2

image = cv2.imread("test.jpg")
sam = sam_model_registry["vit_b"](checkpoint="./sam_vit_b_01ec64.pth")
predictor = SamPredictor(sam)
predictor.set_image(image)
