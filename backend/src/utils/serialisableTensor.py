from pydantic import PlainValidator, PlainSerializer, errors, WithJsonSchema
from typing_extensions import Annotated
from typing import Any
from torch import Tensor
import torch


def torch_tensor_validator(o: Any) -> Tensor:
    if o is None:
        return None
    elif isinstance(o, list):
        return torch.as_tensor(o)

    raise RuntimeError(f"Expected a torch.Tensor, but got {type(o)}")


def torch_serializer(t: Tensor) -> Any:
    if t is None:
        return None
    return t.tolist()


TorchTensor = Annotated[
    Tensor,
    PlainValidator(torch_tensor_validator),
    PlainSerializer(torch_serializer),
    WithJsonSchema({"type": "array", "items": {"type": "number"}}),
]
