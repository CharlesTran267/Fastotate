### redis

1. To build image: `docker build -t redis_image .`
2. To run container: `docker run -d -p 6379:6379 --name redis_container redis_image`
3. To stop container: `docker stop redis_container`
4. To remove container: `docker rm redis_container`
5. To remove image: `docker rmi redis_image`
