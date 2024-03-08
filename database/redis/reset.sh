#!/bin/bash

docker stop redis_container
docker rm redis_container
docker run -d -p 6379:6379 --name redis_container redis_image