import fetch from 'node-fetch'

interface HandlerEvent {
    queryStringParameters: {
        [key: string]: string
    }
}

async function getPkgVersion(pkg: string) {
    const url = `https://registry.npmjs.org/${pkg}`;
    const res = await fetch(url);
    const json = await res.json();
    return json['dist-tags'].latest;
}

exports.handler = async function (event: HandlerEvent, context: any) {
    const pkg = event.queryStringParameters.pkg;
    const latestVersion = await getPkgVersion(pkg);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: `${pkg}=${latestVersion}`
    };
}
