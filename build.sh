#!/bin/bash

if [ -z "$IMAGE_PREFIX" ]; then
    >&2 echo no image prefix, please set IMAGE_PREFIX
    exit 1
fi

if [ ! -z "$DOCKER_USER" ] && [ ! -z "$DOCKER_PASS" ]; then
    if ! (echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin); then
        exit 1
    fi
    echo setting push to 1
    PUSH=1
elif [ -f ~/.docker/config.json ]; then
    PUSH=1
else
    >&2 echo no DOCKER_USER and DOCKER_PASS and no login file mounted to ~/.docker/config.json. pushing disabled.
fi

set -o pipefail

IFS=' '
# tags on file system
tags=$(find . -name Dockerfile -not -wholename ./Dockerfile | sed -E -e 's/.\/(.+)\/(.+)\/Dockerfile/\1:\2/')
# add ordered tags first
tags=$(echo "$tags" | cat order - | awk '!seen[$0]++' )

indent() {
    
    sed "s#^#$(tput setaf 6)$1$(tput setaf 7) --> #"
}

IFS=$'\n'
built_tags=()
for tag in $tags;
do
    folder=$(echo "$tag" | sed -e 's/:/\//')
    tag="${IMAGE_PREFIX}/$tag"
    echo Building "$tag"
    
    if (docker build -t "$tag" "$folder" | indent "$tag")
    then
        built_tags+=("$tag")
    fi
done

if [ "$PUSH" -eq 1 ]; then
    for tag in "${built_tags[@]}";
    do
        echo Pushing "$tag"

        docker push $tag
    done
fi