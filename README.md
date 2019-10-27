Common base images I use.

### aburgess/common:latest

Alpine, but with:
* bash (as entrypoint)
* curl
* htop
* tini (init)

Makes debugging easier. A good base image for final stages.

### aburgess/common:extra

Any misc extra packages to use when building.
Base image: common:latest
Packages:
* sudo
* dpkg

### aburgess/gcc:latest

Base image: aburgess/common:extra
Basically, build-essential.

### aburgess/gcc:extra

Base image: aburgess/gcc:extra
Adds:
* GDB
* CGreen (testing)
* Pistache (HTTP)
I will add stuff to this image when I don't want to recompile dependencies.

### aburgess/node:latest and aburgess/node:lts

Base image: aburgess/common:latest
With the latest version of node and the LTS version, respectively.


### aburgess/node:extra

Base image: aburgess/common:extra
Adds the latest version of node, with npm and yarn.

### aburgess/docker:latest

Docker in docker. Not really used very often.

### aburgess/binaries:*

Since docker doesn't cache "ADD", I just store final binaries in these packages.