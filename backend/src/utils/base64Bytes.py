from pydantic import PlainValidator, PlainSerializer, errors, WithJsonSchema
from typing_extensions import Annotated
from typing import Any
import base64


def base64_bytes_validator(o: Any) -> bytes:
    if isinstance(o, bytes):
        return o
    elif isinstance(o, bytearray):
        return bytes(o)
    elif isinstance(o, str):
        return base64.b64decode(o.encode("utf-8"))
    raise errors.BytesError()


base64Bytes = Annotated[
    bytes,
    PlainValidator(base64_bytes_validator),
    PlainSerializer(lambda b: base64.b64encode(b).decode("utf-8")),
    WithJsonSchema({"type": "string"}),
]
