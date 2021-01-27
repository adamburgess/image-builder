import Yaml from 'js-yaml'



interface HandlerEvent {
    queryStringParameters: {
        [key: string]: string
    }
    body: string
}

exports.handler = async function (event: HandlerEvent, context: any) {
    const body = event.body;
    console.log(body);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: body
    };
}
