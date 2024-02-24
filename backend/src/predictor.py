from segment_anything import sam_model_registry, SamPredictor
import numpy as np
from .logger import logger


class PredictorWrapper:
    def __init__(
        self,
        model_type: str = "vit_b",
        sam_checkpoint: str = "segment-anything/sam_vit_b_01ec64.pth",
        device: str = None,
    ):
        sam = sam_model_registry[model_type](sam_checkpoint)
        if device == "cuda":
            sam.to(device=device)
        self.predictor = SamPredictor(sam)
        self.points = []
        self.points_label = []
        self.mask_input = None
        self.input_box = None

    def set_image(self, image: np.ndarray):
        if self.predictor.is_image_set:
            self.predictor.reset_image()
        self.predictor.set_image(image)

    @property
    def is_image_set(self):
        return self.predictor.is_image_set

    def predict(self):
        if not self.is_image_set:
            logger.warning("No image set for prediction")
            return None

        masks, scores, logits = self.predictor.predict(
            point_coords=self.points,
            point_labels=self.points_label,
            box=self.input_box,
            mask_input=self.mask_input,
            multimask_output=False,
        )
        self.mask_input = logits[np.argmax(scores), :, :][None, :, :]
        return masks

    def reset_annotation(self):
        self.points = []
        self.points_label = []
        self.mask_input = None
        self.input_box = None

    def reset_image(self):
        self.reset_annotation()
        self.predictor.reset_image()

    def add_points(self, points: np.ndarray[np.ndarray], label: np.ndarray):
        if len(points) != len(label):
            logger.warning("Number of points and labels do not match")
            return

        for i in range(len(points)):
            self.points.append(points[i])
            self.points_label.append(label[i])

    def set_input_box(self, box: np.ndarray):
        self.input_box = box

    def add_point(self, point: np.ndarray, label: int):
        self.points.append(point)
        self.points_label.append(label)
