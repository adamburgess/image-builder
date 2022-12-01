import Yaml from 'js-yaml'
import { HandlerEvent } from '@netlify/functions'

interface ImagesYmlRaw {
    [key: string]: {
        disabled?: boolean
        alpine?: {
            [version: string]: string
        }
        inputs?: string[]
        dockers?: string[]
        repos?: string[]
        npm?: string
    }
}
interface Image {
    image: string
    alpine: [version: string, pkgs: string[]][]
    inputs: string[]
    dockers: string[]
    repos: string[]
    npm: string[]
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
\t@curl -s -G --data-urlencode "package=${pkg}" --data-urlencode "version=v${version}" ${netlifyUrl}/alpine > alpine-package-${version}-${s}.tmp
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

function imageToTarget(i: Image) {
    const {image, repos, dockers, alpine, npm, inputs} = i;
    const repoTargets = repos.map(r => 'repo-' + sanitise(r)).join(' ');
    const dockerTargets = dockers.map(d => 'docker-' + sanitise(d)).join(' ');
    const alpineTargetsA: string[] = [];
    for(const [version, pkgs] of alpine) {
        alpineTargetsA.push(...pkgs.map(p => `alpine-package-${version}-${sanitise(p)}`));
    }
    const alpineTargets = alpineTargetsA.join(' ');
    const npmTargets = npm.map(n => 'npm-' + sanitise(n)).join(' ');
    const inputTargets = inputs.map(i => 'image-' + sanitise(i)).join(' ');

    const imageFile = sanitise(image);

    const dockerfileTarget = `dockerfile-${imageFile}: FORCE
\t@cat ../dockerfiles/${imageFile}.Dockerfile | sha256sum > dockerfile-${imageFile}.tmp
\t$(call replace_if_different,dockerfile-${imageFile})

`;

    const targets = [repoTargets, dockerTargets, alpineTargets, npmTargets, inputTargets, `dockerfile-${imageFile}`];
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

    const inputs = Object.entries(yml).filter(([, e]) => !e.disabled);

    // create the all target
    makefile += `all: ${inputs.map(x => x[0]).map(k => 'image-' + sanitise(k)).join(' ')}
`;

    const images = inputs.map(([key, opt]) => ({
        image: key,
        dockers: opt.dockers ?? [],
        repos: opt.repos ?? [],
        alpine: Object.entries(opt.alpine ?? {}).map(([version, pkgs]) => [version, pkgs.split(' ')]),
        inputs: opt.inputs ?? [],
        npm: opt.npm?.split(' ') ?? []
    }) as Image);

    const dockers = Array.from(new Set(images.flatMap(image => image.dockers)));
    const repos = Array.from(new Set(images.flatMap(image => image.repos)));
    const alpine: Record<string, string[]> = {};
    for (const image of images) for (const [version, pkgs] of image.alpine) {
        if (alpine[version]) alpine[version].push(...pkgs);
        else alpine[version] = pkgs;
    }
    for(const version in alpine) {
        alpine[version] = [...new Set(alpine[version])];
    }
    const npms = Array.from(new Set(images.flatMap(image => image.npm)));

    // create the targets
    dockers.forEach(d => makefile += dockerToTarget(d));
    repos.forEach(d => makefile += repoToTarget(d));
    for (const version in alpine) {
        alpine[version].forEach(d => makefile += alpineToTarget(d, version));
    }
    npms.forEach(d => makefile += npmToTarget(d));

    images.forEach(i => makefile += imageToTarget(i));

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: makefile
    };
}

//handler({ body: require('fs').readFileSync('../images.yml', 'utf8'), queryStringParameters: {} }, undefined).then(x => require('fs').writeFileSync('../Makefile', x.body));
