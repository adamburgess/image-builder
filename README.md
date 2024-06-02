Common base images I use.

### [aburgess/common:latest](https://hub.docker.com/r/aburgess/latest)

Alpine 3.20, but with:
* bash (as entrypoint)
* curl
* htop
* nano
* libstdc++

Makes debugging easier. A good base image for final stages.

### [aburgess/common:extra](https://hub.docker.com/r/aburgess/extra)

Any misc extra packages to use when building.  
Base image: common:latest

Packages:
* sudo
* dpkg
* git
* rsync
* ssh

### [aburgess/caddy:2](https://hub.docker.com/r/aburgess/caddy)

Latest version of [caddy](https://caddyserver.com/), with:
 * Cloudflare DNS
 * CGI

Exposed as a single file at /caddy.

To export the binary for use in other systems:
```sh
container=$(docker container create aburgess/caddy:2 --pull always)
docker cp $container:/caddy ./caddy
docker container rm $container
```

### [aburgess/gcc:latest](https://hub.docker.com/r/aburgess/gcc)

Base image: aburgess/common:extra

Packages:
* build-base (alpine's build-essential)
* linux-headers
* openssl-dev
* cmake

### [aburgess/gcc:extra](https://hub.docker.com/r/aburgess/gcc)

Base image: aburgess/gcc:latest

Adds:
* GDB
* [fmt](https://github.com/fmtlib/fmt) 
* [jsoncpp](https://github.com/open-source-parsers/jsoncpp.git) 

I will add stuff to this image when I don't want to recompile dependencies.

### [aburgess/node:22](https://hub.docker.com/r/aburgess/node)

Base image: aburgess/common:latest  
Versions 22 of node.

### [aburgess/node:22-npm](https://hub.docker.com/r/aburgess/node)

Base image: aburgess/node:22  
Includes the latest version of npm, yarn, pnpm, and jq.  
Also includes [@adamburges/nr](https://www.npmjs.com/package/@adamburgess/nr).  
Generally you build on this image, then have a final stage on the other image.

### [aburgess/jpegxl](https://hub.docker.com/r/aburgess/jpegxl)

Base image: Alpine 3.20  
Builds the latest version of the [JPEG XL encoder/decoder](https://github.com/libjxl/libjxl) and provides them as /cjxl and /djxl.  
