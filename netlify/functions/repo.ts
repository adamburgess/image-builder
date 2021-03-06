import fetch from 'node-fetch'

interface HandlerEvent {
    queryStringParameters: {
        [key: string]: string
    }
}

async function getRepoSha(input: string) {
    let [hoster, repo, tag] = input.split('@');
    if (tag === undefined) tag = 'master';
    let sha: string;
    if (hoster === 'github') {
        //const github = new Github(repo, auth);
        let response = await fetch(`https://api.github.com/repos/${repo}/git/ref/heads/${tag}`);
        if (response.status !== 200) {
            // try instead tags
            response = await fetch(`https://api.github.com/repos/${repo}/git/ref/tags/${tag}`);
            if (response.status !== 200) {
                throw new Error('failed to get ' + input);
            }
        }
        sha = (await response.json() as { object: { sha: string } }).object.sha;
    } else if (hoster === 'gitlab') {
        // gitlabs thing
        const response = await fetch(`https://gitlab.com/api/v4/projects/${repo.replace('/', '%2F')}/repository/branches/${tag}`);
        if (response.status != 200) throw new Error('failed to get ' + input);
        sha = (await response.json() as { commit: { id: string } }).commit.id;
    } else {
        throw new Error('unknown hoster ' + hoster);
    }
    return sha;
}

exports.handler = async function (event: HandlerEvent, context: any) {
    const repo = event.queryStringParameters.repo;
    const sha = await getRepoSha(repo);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: `${repo}=${sha}`
    };
}
