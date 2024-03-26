import AlpineApk from 'alpine-apk'
import { Mutex } from 'async-mutex'
import { HandlerEvent } from '@netlify/functions'

const mutex = new Mutex();
const alpines: Record<string, AlpineApk> = {};

async function getAndUpdateAlpinePkgs(version: string) {
    return mutex.runExclusive(async () => {
        if (version in alpines) return alpines[version];

        const alpineApk = new AlpineApk();
        await alpineApk.update(version);
        alpines[version] = alpineApk;
        return alpineApk;
    });
}

async function getDependenciesForPackages(pkg: string, version: string) {
    const alpineApk = await getAndUpdateAlpinePkgs(version);
    let tree = alpineApk.getDependencyTree(pkg);
    return tree.split(',').filter(x => x).sort();
}

export async function handler(event: HandlerEvent) {
    const pkg = event.queryStringParameters!.package!;
    const version = event.queryStringParameters!.version ?? 'latest-stable';
    const dependencies = await getDependenciesForPackages(pkg, version);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-store'
        },
        body: dependencies.join(' ')
    };
}
