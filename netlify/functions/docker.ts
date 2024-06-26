import { fetch } from 'undici'
import { HandlerEvent } from '@netlify/functions'
import retry from 'async-retry'

interface DockerTagResponse {
    images: {
        architecture: string
        digest: string
    }[]
    last_updated: string
}

async function getDockerSha(input: string, architecture = 'amd64') {
    let [repo, tag] = input.split(':');
    if (tag === undefined) tag = 'latest';

    const response = await fetch(`https://hub.docker.com/v2/repositories/${repo}/tags/${tag}`);
    if (response.status != 200) throw new Error('failed to get docker');
    const json = await response.json() as DockerTagResponse;

    const arch = json.images.find(d => d.architecture === architecture);
    if (arch !== undefined) return arch.digest;

    // couldnt find arch, so instead return last modified
    return json.last_updated;
}

export async function handler(event: HandlerEvent) {
    const docker = event.queryStringParameters!.docker!;
    const arch = event.queryStringParameters!.arch!;
    const sha = await retry(() => getDockerSha(docker, arch), { minTimeout: 200, maxTimeout: 1000 });
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-store'
        },
        body: sha
    };
}
