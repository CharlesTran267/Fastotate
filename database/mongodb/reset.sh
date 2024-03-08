#!/bin/bash

docker stop mongo_container
docker rm mongo_container
docker run -d -p 27017:27017 --name mongo_container mongo_image
