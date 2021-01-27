const AlpineApk = require('alpine-apk');

const alpineApk = new AlpineApk();

let updatedAlpine = false;

async function updatePackages() {
    if (!updatedAlpine) {
        await alpineApk.update();
        updatedAlpine = true;
    }
}

async function getDependenciesForPackages(packages) {
    await updatePackages();
    let tree = alpineApk.getDependencyTree(...packages);
    return tree.split(',').filter(x => x).sort();
}

exports.handler = async function (event, context) {
    const packages = event.queryStringParameters.packages.split(' ');
    const dependencies = await getDependenciesForPackages(packages);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify(dependencies)
    };
}
