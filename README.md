Common base images I use.

### [aburgess/common:latest](https://hub.docker.com/r/aburgess/latest)

Alpine, but with:
* bash (as entrypoint)
* curl
* htop
* tini (init)
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

### [aburgess/node:latest and aburgess/node:lts](https://hub.docker.com/r/aburgess/node)

Base image: aburgess/common:latest  
With the latest version of node and the LTS version, respectively.

### [aburgess/node:latest-npm and aburgess/node:lts-npm](https://hub.docker.com/r/aburgess/node)

Base image: aburgess/node:latest or aburgess/note:lts  
Includes the latest version of npm, yarn, pnpm, and jq.  
Also includes [@adamburges/nr](https://www.npmjs.com/package/@adamburgess/nr).  
Generally you build on this image, then have a final stage on the other image.

### [aburgess/binaries:*](https://hub.docker.com/r/aburgess/binaries)

Since docker doesn't cache "ADD", I just store final binaries in these packages.

### [aburgess/h2o:latest](https://hub.docker.com/r/aburgess/h2o)

Base image: aburgess/common:latest

The [h2o HTTP server](https://github.com/h2o/h2o)
