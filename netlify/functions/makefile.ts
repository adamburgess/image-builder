import Yaml from 'js-yaml'
import { HandlerEvent } from '@netlify/functions'
import from from '@adamburgess/linq'

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
        rust?: string
        githubRelease?: string
    }
}
interface Image {
    image: string
    alpine: [version: string, pkgs: string[]][]
    inputs: string[]
    dockers: string[]
    repos: string[]
    npm: string[]
    rust: string | undefined
    githubRelease: string | undefined
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

function githubReleaseToTarget(repo: string) {
    const s = sanitise(repo);
    return `github-release-${s}: FORCE
\t@echo [GitHub Latest Release] ${repo}
\t@curl -s -G --data-urlencode "repo=${repo}" ${netlifyUrl}/github-release > github-release-${s}.tmp
\t$(call replace_if_different,github-release-${s})

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

function rustToTarget(channel: string) {
    const s = sanitise(channel);
    return `rust-${channel}: FORCE
\t@echo [Rust] ${channel}
\t@curl -s -G --data-urlencode "channel=${channel}" ${netlifyUrl}/rust > rust-${s}.tmp
\t$(call replace_if_different,rust-${s})

`
}

function sanitise(name: string) {
    return name.replace(/:/g, '.').replace(/\//g, '_');
}

function imageToTarget(i: Image) {
    const { image, repos, dockers, alpine, npm, rust, inputs, githubRelease } = i;
    const repoTargets = repos.map(r => 'repo-' + sanitise(r)).join(' ');
    const dockerTargets = dockers.map(d => 'docker-' + sanitise(d)).join(' ');
    const alpineTargets = alpine.flatMap(([version, pkgs]) => pkgs.map(p => `alpine-package-${version}-${sanitise(p)}`)).join(' ');
    const npmTargets = npm.map(n => 'npm-' + sanitise(n)).join(' ');
    const rustTarget = rust ? 'rust-' + rust : '';
    const inputTargets = inputs.map(i => 'image-' + sanitise(i)).join(' ');
    const githubReleaseTarget = githubRelease ? 'github-release-' + sanitise(githubRelease) : '';

    const imageFile = sanitise(image);

    const dockerfileTarget = `dockerfile-${imageFile}: FORCE
\t@cat ../dockerfiles/${imageFile}.Dockerfile | sha256sum > dockerfile-${imageFile}.tmp
\t$(call replace_if_different,dockerfile-${imageFile})

`;

    const targets = [repoTargets, dockerTargets, alpineTargets, npmTargets, rustTarget, inputTargets, githubReleaseTarget, `dockerfile-${imageFile}`];
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
        npm: opt.npm?.split(' ') ?? [],
        rust: opt.rust,
        githubRelease: opt.githubRelease
    }) as Image);

    const dockers = from(images).map(image => image.dockers).flat().distinct().toArray();
    const repos = from(images).map(image => image.repos).flat().distinct().toArray();
    // take the list of alpines then group each by their version and combine all groups.
    const alpine = from(images).map(image => image.alpine).flat().groupBy(x => x[0], x => x[1]).toObject(x => x.key, x => x.flat().distinct().toArray());
    const npms = from(images).map(image => image.npm).flat().distinct().toArray();
    const rusts = from(images).where(image => image.rust).map(image => image.rust!).distinct().toArray();
    const githubReleases = from(images).where(image => image.githubRelease).map(image => image.githubRelease!).distinct().toArray();

    // create the targets
    dockers.forEach(d => makefile += dockerToTarget(d));
    repos.forEach(d => makefile += repoToTarget(d));
    Object.entries(alpine).forEach(([version, pkgs]) => pkgs.forEach(d => makefile += alpineToTarget(d, version)));
    npms.forEach(d => makefile += npmToTarget(d));
    rusts.forEach(d => makefile += rustToTarget(d));
    githubReleases.forEach(d => makefile += githubReleaseToTarget(d));

    images.forEach(i => makefile += imageToTarget(i));

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-store'
        },
        body: makefile
    };
}

//handler({ body: require('fs').readFileSync('../images.yml', 'utf8'), queryStringParameters: {} }, undefined).then(x => require('fs').writeFileSync('../Makefile', x.body));
