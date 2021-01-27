import fetch from 'node-fetch'

interface HandlerEvent {
    queryStringParameters: {
        [key: string]: string
    }
}

interface DockerTagResponse {
    images: {
        architecture: string
        digest: string
    }[]
    last_updated: string
}

const dockerCache: {
    [name: string]: string
} = {};

async function getDockerSha(input: string) {
    if (input in dockerCache) return dockerCache[input];

    let [repo, tag] = input.split('@');
    if (tag === undefined) tag = 'latest';

    const response = await fetch(`https://hub.docker.com/v2/repositories/${repo}/tags/${tag}`);
    if (response.status != 200) throw new Error('failed to get docker');
    const json = await response.json() as DockerTagResponse;

    const amd64 = json.images.find(d => d.architecture === 'amd64');
    if (amd64 !== undefined) return dockerCache[input] = amd64.digest;

    // couldnt find amd64, so instead return last modified
    return dockerCache[input] = json.last_updated;
}

exports.handler = async function (event: HandlerEvent, context: any) {
    const docker = event.queryStringParameters.docker;
    const sha = await getDockerSha(docker);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: sha
    };
}
