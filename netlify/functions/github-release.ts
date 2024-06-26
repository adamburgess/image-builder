import { fetch } from 'undici'
import { HandlerEvent } from '@netlify/functions'
import retry from 'async-retry'

async function getLatestRelease(repo: string) {
    let sha: string;

    let response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
    if (response.status !== 200) {
        throw new Error('failed to get ' + repo);
    }

    const tagName = (await response.json() as { tag_name: string }).tag_name;

    response = await fetch(`https://api.github.com/repos/${repo}/git/ref/tags/${tagName}`);
    if (response.status !== 200) {
        // whatever, just return the tag for now.
        return tagName;
    }

    sha = (await response.json() as { object: { sha: string } }).object.sha;
    return `${tagName},${sha}`;
}

export async function handler(event: HandlerEvent) {
    const repo = event.queryStringParameters!.repo!;
    const release = await retry(() => getLatestRelease(repo), { minTimeout: 200, maxTimeout: 1000 });
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-store'
        },
        body: `${repo}=${release}`
    };
}
