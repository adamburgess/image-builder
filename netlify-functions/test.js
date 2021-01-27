const yosay = require('yosay');

exports.handler = async function (event, context) {
    const text = yosay('hi ' + event.queryStringParameters);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: text
    };
}
