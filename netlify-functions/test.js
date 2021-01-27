const yosay = require('yosay');

exports.handler = async function (event, context) {
    const text = yosay('hi ' + event.path);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: text
    };
}
