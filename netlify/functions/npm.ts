import { fetch } from 'undici'
import { HandlerEvent } from '@netlify/functions'

async function getPkgVersion(pkg: string) {
    const url = `https://registry.npmjs.org/${pkg}`;
    const res = await fetch(url);
    const json = await res.json() as Record<string, { latest: string }>;
    return json['dist-tags'].latest;
}

export async function handler(event: HandlerEvent) {
    const pkg = event.queryStringParameters!.pkg!;
    const latestVersion = await getPkgVersion(pkg);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-store'
        },
        body: `${pkg}=${latestVersion}`
    };
}
