from src.logger import logger
from typing import List, Any, Optional
from .imageAnnotation import ImageAnnotation
import uuid
from pydantic import BaseModel, Field


class VideoFrame(ImageAnnotation):
    frame_number: int


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
