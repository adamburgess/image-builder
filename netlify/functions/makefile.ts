import Yaml from 'js-yaml'
import { HandlerEvent } from '@netlify/functions'

interface ImagesYmlRaw {
    [key: string]: {
        disabled: boolean | undefined
        alpinepackages314: string | undefined
        alpinepackages315: string | undefined
        inputs: string[] | undefined
        dockers: string[] | undefined
        repos: string[] | undefined
        npm: string | undefined
    }
}

const netlifyUrl = `https://adamburgess-image-builder.netlify.app/.netlify/functions`;

function dockerToTarget(docker: string) {
    const s = sanitise(docker);
    return `docker-${s}: FORCE
\t@echo [Docker] ${docker}
\t@curl -s -G --data-urlencode "docker=${docker}" ${netlifyUrl}/docker > docker-${s}.tmp
\t$(call replace_if_different,docker-${s})

`
}

function alpineToTarget(pkg: string, version: string) {
    const s = sanitise(pkg);
    return `alpine-package-${version}-${s}: FORCE
\t@echo [Alpine Package] ${pkg}
\t@curl -s -G --data-urlencode "package=${pkg}" --data-urlencode "version=${version}" ${netlifyUrl}/alpine > alpine-package-${version}-${s}.tmp
\t$(call replace_if_different,alpine-package-${version}-${s})

`
}

function repoToTarget(repo: string) {
    const s = sanitise(repo);
    return `repo-${s}: FORCE
\t@echo [Repo] ${repo}
\t@curl -s -G --data-urlencode "repo=${repo}" ${netlifyUrl}/repo > repo-${s}.tmp
\t$(call replace_if_different,repo-${s})

`
}

function npmToTarget(pkg: string) {
    const s = sanitise(pkg);
    return `npm-${s}: FORCE
\t@echo [NPM] ${pkg}
\t@curl -s -G --data-urlencode "pkg=${pkg}" ${netlifyUrl}/npm > npm-${s}.tmp
\t$(call replace_if_different,npm-${s})

`
}

function sanitise(name: string) {
    return name.replace(/:/g, '.').replace(/\//g, '_');
}

function imageToTarget(image: string, repos: string[], dockers: string[], packages314: string[], packages315: string[], npms: string[], inputs: string[]) {
    const repoTargets = repos.map(r => 'repo-' + sanitise(r)).join(' ');
    const dockerTargets = dockers.map(d => 'docker-' + sanitise(d)).join(' ');
    const package314Targets = packages314.map(p => 'alpine-package-3.14-' + sanitise(p)).join(' ');
    const package315Targets = packages315.map(p => 'alpine-package-3.15-' + sanitise(p)).join(' ');
    const npmTargets = npms.map(n => 'npm-' + sanitise(n)).join(' ');
    const inputTargets = inputs.map(i => 'image-' + sanitise(i)).join(' ');

    const imageFile = sanitise(image);

    const dockerfileTarget = `dockerfile-${imageFile}: FORCE
\t@cat ../dockerfiles/${imageFile}.Dockerfile | sha256sum > dockerfile-${imageFile}.tmp
\t$(call replace_if_different,dockerfile-${imageFile})

`;

    const targets = [repoTargets, dockerTargets, package314Targets, package315Targets, npmTargets, inputTargets, `dockerfile-${imageFile}`];
    const imageFileTarget = `image-${imageFile}: ${targets.filter(t => t.length !== 0).join(' ')}
\t@echo [Image] ${image}
\tcd ../dockerfiles && docker buildx build --platform linux/amd64,linux/arm64 --push -t aburgess/${image} -f ${imageFile}.Dockerfile .
\t@touch image-${imageFile}

`;

    return dockerfileTarget + imageFileTarget;
}

export async function handler(event: HandlerEvent) {
    const ymlText = event.body!;
    const yml = Yaml.load(ymlText) as ImagesYmlRaw;

    let makefile = '';

    makefile += `
SHELL := /bin/bash

.PHONY: all login

`;

    makefile += `
# if file exists,
# and it is the same as the new old file, remove it.
# if it has changed, replace the file.
# if it does not exist, move it.
define replace_if_different
\t@if [ -r $(1) ];                                           \\
\tthen                                                       \\
\t  if cmp -s $(1) $(1).tmp;                                 \\
\t  then                                                     \\
\t      echo $(1) - no change;                               \\
\t      rm $(1).tmp;                                         \\
\t  else                                                     \\
\t      echo $(1) - changed!;                                \\
\t      echo \`cat $(1)\` -\\>;                              \\
\t      echo \`cat $(1).tmp\`;                               \\
\t      mv -f $(1).tmp $(1);                                 \\
\t  fi;                                                      \\
\telse                                                       \\
\t  echo $(1) - first time: \`cat $(1).tmp\`;                \\
\t  mv $(1).tmp $(1);                                        \\
\tfi
endef

`;

    makefile += `FORCE:

`;

    // create the all target
    makefile += `all: ${Object.keys(yml).map(k => 'image-' + sanitise(k)).join(' ')}
`;

    const images = Object.entries(yml).filter(([, e]) => !e.disabled).map(e => ({
        image: e[0],
        dockers: e[1].dockers ?? [],
        repos: e[1].repos ?? [],
        alpinepackages314: e[1].alpinepackages314?.split(' ') ?? [],
        alpinepackages315: e[1].alpinepackages315?.split(' ') ?? [],
        inputs: e[1].inputs ?? [],
        npm: e[1].npm?.split(' ') ?? []
    }));

    const dockers = Array.from(new Set(images.flatMap(image => image.dockers)));
    const repos = Array.from(new Set(images.flatMap(image => image.repos)));
    const alpinepackages314 = Array.from(new Set(images.flatMap(image => image.alpinepackages314)));
    const alpinepackages315 = Array.from(new Set(images.flatMap(image => image.alpinepackages315)));
    const npms = Array.from(new Set(images.flatMap(image => image.npm)));

    // create the targets
    dockers.forEach(d => makefile += dockerToTarget(d));
    repos.forEach(d => makefile += repoToTarget(d));
    alpinepackages314.forEach(d => makefile += alpineToTarget(d, '3.14'));
    alpinepackages315.forEach(d => makefile += alpineToTarget(d, '3.15'));
    npms.forEach(d => makefile += npmToTarget(d));

    images.forEach(i => makefile += imageToTarget(i.image, i.repos, i.dockers, i.alpinepackages314, i.alpinepackages315, i.npm, i.inputs));

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: makefile
    };
}

//handler({ body: require('fs').readFileSync('../images.yml', 'utf8'), queryStringParameters: {} }, undefined).then(x => require('fs').writeFileSync('../Makefile', x.body));
