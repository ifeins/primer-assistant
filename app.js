'use strict';

process.env.debug = 'actions-on-google:*';

let ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

app.post('/', function (request, response) {
    console.log('handle post');
    const assistant = new ActionsSdkAssistant({request: request, response: response});

    function mainIntent(assistant) {
        console.log('mainIntent');
        let inputPrompt = assistant.buildInputPrompt(true, 
            '<speak>' +
            'Hi, welcome to Primer!' +
            '<break time="1"/>' +
            'In each turn I will pick a random number between 1 and 100 and you will have to find its prime factors, should be fun!' +
            '<break time="1"/>' +
            'When you are ready say start.' +
            '</speak>');
        assistant.ask(inputPrompt);
    }

    function rawInput(assistant) {
        console.log('rawInput');
        if (assistant.getRawInput() === 'bye') {
            assistant.tell('Goodbye!');
        } else if (assistant.getRawInput() === 'start') {
            let randomNumber = Math.random() * 99 + 1;
        } else {
            let factor = parseInt(assistant.getRawInput());
            let inputPrompt = assistant.buildInputPrompt(true,
                '<speak>' +
                'You said that the factor is <say-as interpret-as="cardinal">' + factor + '</say-as>' +
                '</speak>'
                );
            assistant.ask(inputPrompt);
        }

        let actionsMap = new Map();
        actionsMap.set(assistant.StandardIntents.MAIN, mainIntent);
        actionsMap.set(assistant.StandardIntents.TEXT, rawInput);

        assistant.handleRequest(actionsMap);
    }
});

let server = app.listen(app.get('port'), function () {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});


