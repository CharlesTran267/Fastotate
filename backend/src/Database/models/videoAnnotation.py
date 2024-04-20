from src.logger import logger
from typing import List, Any, Optional
from .imageAnnotation import ImageAnnotation
from .image import Image
from .annotation import Annotation
import uuid
from pydantic import BaseModel, Field
import cv2


class VideoFrame(ImageAnnotation):
    frame_number: int
    keyFrame: bool = False


class VideoAnnotation(BaseModel):
    video_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    videoFrames: List[VideoFrame] = []
    file_name: str = None
    fps: Optional[int] = 0

    def addFrames(self, frame: VideoFrame) -> None:
        self.videoFrames.append(frame)

    @property
    def video_length(self):
        return len(self.videoFrames) * self.fps

    def getFrame(self, frame_number: int) -> VideoFrame:
        for frame in self.videoFrames:
            if frame.frame_number == frame_number:
                return frame
        logger.warning(f"Frame {frame_number} not in videoFrames list")
        return None

    def getFrameByID(self, frame_id: str) -> VideoFrame:
        for frame in self.videoFrames:
            if frame.image_id == frame_id:
                return frame
        logger.warning(f"Frame {frame_id} not in videoFrames list")
        return None

    def setKeyFrame(self, frame_number: int, isKeyFrame: bool) -> None:
        if frame_number in range(len(self.videoFrames)):
            self.videoFrames[frame_number].keyFrame = isKeyFrame
        else:
            logger.warning(f"Frame {frame_number} not in keyFrames list")

    def getKeyFramesID(self) -> List[str]:
        keyFrames = []
        for frame in self.keyFrames:
            keyFrames.append(self.getFrame(frame).image_id)
        return keyFrames

    def adjustAnnotationByInterpolation(self, frames: List[Image]):
        grayFrames = [
            cv2.cvtColor(frame.image_ndarray, cv2.COLOR_BGR2GRAY) for frame in frames
        ]
        curFrame = 0
        while curFrame < len(self.videoFrames):
            if not self.videoFrames[curFrame].keyFrame:
                curFrame += 1
            else:
                break

        while curFrame < len(self.videoFrames) - 1:
            if self.videoFrames[curFrame + 1].keyFrame:
                curFrame += 1
                continue
            prevFrame = grayFrames[curFrame]
            nextFrame = grayFrames[curFrame + 1]

            flow = cv2.calcOpticalFlowFarneback(
                prevFrame, nextFrame, None, 0.5, 3, 15, 3, 5, 1.2, 0
            )
            self.videoFrames[curFrame + 1].annotations = []
            for annotation in self.videoFrames[curFrame].annotations:
                new_annotation = Annotation(className=annotation.className, points=[])
                for x, y in annotation.points:
                    dx, dy = flow[int(y), int(x)]
                    new_annotation.points.append([x + dx, y + dy])
                self.videoFrames[curFrame + 1].addAnnotation(new_annotation)
            curFrame += 1
