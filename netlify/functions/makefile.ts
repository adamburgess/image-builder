import Yaml from 'js-yaml'

interface HandlerEvent {
    queryStringParameters: {
        [key: string]: string
    }
    body: string
}

interface ImagesYmlRaw {
    [key: string]: {
        packages: string | undefined
        inputs: string[] | undefined
        dockers: string[] | undefined
        repos: string[] | undefined
    }
}

const netlifyUrl = `https://adamburgess-image-builder.netlify.app/.netlify/functions`;

function dockerToTarget(docker: string) {
    const s = sanitise(docker);
    return `docker-${s}: FORCE
\t@echo [Docker] ${docker}
\t@curl -s ${netlifyUrl}/docker?docker=${docker} > docker-${s}.tmp
\t$(call replace_if_different,docker-${s})

`
}

function alpineToTarget(pkg: string) {
    const s = sanitise(pkg);
    return `package-${s}: FORCE
\t@echo [Alpine Package] ${pkg}
\t@curl -s ${netlifyUrl}/alpine?package=${pkg} > package-${s}.tmp
\t$(call replace_if_different,package-${s})

`
}

function repoToTarget(repo: string) {
    const s = sanitise(repo);
    return `repo-${s}: FORCE
\t@echo [Repo] ${repo}
\t@curl -s ${netlifyUrl}/repo?repo=${repo} > repo-${s}.tmp
\t$(call replace_if_different,repo-${s})

`
}

function sanitise(name: string) {
    return name.replace(/:/g, '.').replace(/\//g, '_');
}

function imageToTarget(image: string, repos: string[], dockers: string[], packages: string[], inputs: string[]) {
    const repoTargets = repos.map(r => 'repo-' + sanitise(r)).join(' ');
    const dockerTargets = dockers.map(d => 'docker-' + sanitise(d)).join(' ');
    const packageTargets = packages.map(p => 'package-' + sanitise(p)).join(' ');
    const inputTargets = inputs.map(i => 'image-' + sanitise(i));
    
    const imageFile = sanitise(image);

    const targets = [repoTargets, dockerTargets, packageTargets, inputTargets, 'login', `dockerfiles/${imageFile}.Dockerfile`];
    return `image-${imageFile}: ${targets.filter(t => t.length !== 0).join(' ')}
\t@echo [Image] ${image}
\t@cd dockerfiles && docker build -t ${image} -f ${imageFile}.Dockerfile . > ../image-${imageFile}
\tdocker push ${image}

`
}

async function handler(event: HandlerEvent, context: any) {
    const ymlText = event.body;
    const yml = Yaml.load(ymlText) as ImagesYmlRaw;

    let makefile = '';

    makefile += `.PHONY: all login

`;

    makefile += `define replace_if_different
\t@if test -r $(1); \\
\tthen \\
\t  cmp -s $(1) $(1).tmp && rm $(1).tmp || mv -f $(1).tmp $(1); \\
\telse \\
\t  mv $(1).tmp $(1); \\
\tfi
endef

`;

    makefile += `FORCE:

`;

    // create the all target
    makefile += `all: ${Object.keys(yml).map(k => 'image-' + sanitise(k)).join(' ')}
`;

    makefile += `login:
\t@docker login -u \${DOCKER_USERNAME} -p \${DOCKER_PASSWORD}

`;

    const images = Object.entries(yml).map(e => ({
        image: e[0],
        dockers: e[1].dockers ?? [],
        repos: e[1].repos ?? [],
        packages: (e[1].packages?.split(' ') ?? []),
        inputs: e[1].inputs ?? []
    }));

    const dockers = Array.from(new Set(images.flatMap(image => image.dockers)));
    const repos = Array.from(new Set(images.flatMap(image => image.repos)));
    const packages = Array.from(new Set(images.flatMap(image => image.packages)));

    // create the targets
    dockers.forEach(d => makefile += dockerToTarget(d));
    repos.forEach(d => makefile += repoToTarget(d));
    packages.forEach(d => makefile += alpineToTarget(d));

    images.forEach(i => makefile += imageToTarget(i.image, i.repos, i.dockers, i.packages, i.inputs));

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: makefile
    };
}


exports.handler = handler;

//handler({ body: require('fs').readFileSync('../images.yml', 'utf8'), queryStringParameters: {} }, undefined).then(x => require('fs').writeFileSync('../Makefile', x.body));