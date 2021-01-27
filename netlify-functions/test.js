const yosay = require('yosay');

exports.handler = async function (event, context) {
    console.log(event);
    const text = yosay('hi ' + JSON.stringify(event.queryStringParameters));
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: text
    };
}
