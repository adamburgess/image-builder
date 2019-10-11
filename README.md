note: you're gonna give your password and username and your docker socket to this image.
it's a simple script, but don't just run this without checking the remote one is the same as this one.

with user/pass:
```bash
docker run --rm \
    -e DOCKER_USER=user \
    -e DOCKER_PASS=pass \
    -e IMAGE_PREFIX=user \
    -v /var/run/docker.sock:/var/run/docker.sock \
    aburgess/image-builder:latest
```

or with config file:
```bash
docker run --rm \
    -e IMAGE_PREFIX=user \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    -v /home/user/.docker/config.json:/root/.docker/config.json:ro \
    aburgess/image-builder:latest
```
