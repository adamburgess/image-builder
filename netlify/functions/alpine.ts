import AlpineApk from 'alpine-apk'
import { Mutex } from 'async-mutex'
import { HandlerEvent } from '@netlify/functions'

const alpineApk = new AlpineApk();

let updatedAlpine = false;
const mutex = new Mutex();

async function updatePackages() {
    await mutex.acquire();
    try {
        if (!updatedAlpine) {
            await alpineApk.update();
            updatedAlpine = true;
        }
    } finally {
        mutex.release();
    }
}

async function getDependenciesForPackages(pkg: string) {
    await updatePackages();
    let tree = alpineApk.getDependencyTree(pkg);
    return tree.split(',').filter(x => x).sort();
}

export async function handler(event: HandlerEvent) {
    const pkg = event.queryStringParameters!.package!;
    const dependencies = await getDependenciesForPackages(pkg);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: dependencies.join(' ')
    };
}
