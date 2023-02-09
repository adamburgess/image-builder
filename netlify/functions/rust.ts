import fetch from 'node-fetch'
import { HandlerEvent } from '@netlify/functions'
import Toml from '@iarna/toml'

async function getRustVersion(channel: string) {
    const url = `https://static.rust-lang.org/dist/channel-rust-${channel}.toml`;
    const res = await fetch(url);
    const txt = await res.text();
    const toml = Toml.parse(txt) as any;
    return toml.pkg.rust.version;
}

export async function handler(event: HandlerEvent) {
    const channel = event.queryStringParameters!.channel!;
    const latestVersion = await getRustVersion(channel);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: `${channel}=${latestVersion}`
    };
}
