import { fetch } from 'undici'
import { HandlerEvent } from '@netlify/functions'
import Toml from '@iarna/toml'
import retry from 'async-retry'

async function getRustVersion(channel: string) {
    const url = `https://static.rust-lang.org/dist/channel-rust-${channel}.toml`;
    const res = await fetch(url);
    const txt = await res.text();
    const toml = Toml.parse(txt) as any;
    return toml.pkg.rust.version;
}

export async function handler(event: HandlerEvent) {
    const channel = event.queryStringParameters!.channel!;
    const latestVersion = await retry(() => getRustVersion(channel), { minTimeout: 200, maxTimeout: 1000 });
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-store'
        },
        body: `${channel}=${latestVersion}`
    };
}
