from pydantic import BaseModel
from ...utils.serialisableTensor import TorchTensor
from ...utils.base64Bytes import base64Bytes
import io
import numpy as np
import PIL.Image


class Image(BaseModel):
    image_id: str
    image_bytes: base64Bytes
    image_embeddings: TorchTensor = None

    @property
    def image_ndarray(self):
        return np.array(PIL.Image.open(io.BytesIO(self.image_bytes)), dtype=np.uint8)[
            :, :, :3
        ]
