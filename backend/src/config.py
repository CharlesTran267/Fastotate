from typing import List


class defaultProjectConfig:
    name: str = "default"
    classes: List[str] = ["Class 1"]
    default_class: str = "Class 1"


class defaultRedisConfig:
    redis_url: str = ""
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
