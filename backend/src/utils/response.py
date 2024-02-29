from dataclasses import dataclass


@dataclass
class Response:
    data: any
    status: int
    message: str
