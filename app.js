'use strict';

process.env.debug = 'actions-on-google:*';

let ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let isPrime = require('is-prime');

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
            'In each turn I will pick a random number between 1 and 100 and you will have to find its prime factors.' +
            '<break time="1"/>' +
            'Should be fun!' +
            '<break time="1"/>' +
            'When you are ready say "start".' +
            '</speak>');
        assistant.ask(inputPrompt);
    }

    function rawInput(assistant) {
        console.log('rawInput');
        if (assistant.getRawInput() === 'bye') {
            assistant.tell('Goodbye!');
        } else if (assistant.getRawInput() === 'start') {
            let state = assistant.getDialogState();
            state.randomNumber = Math.floor(Math.random() * 99 + 1);
            let inputPrompt = assistant.buildInputPrompt(true, '<speak>Here is the number: ' + state.randomNumber + '\nFind its factors.</speak>');
            assistant.ask(inputPrompt, state);
        } else {
            let state = assistant.getDialogState();
            let randomNumber = state.randomNumber;
            let factors;
            if (assistant.getRawInput().includes("and")) {
                factors = assistant.getRawInput().split("and");
            } else if (assistant.getRawInput().includes("+")) {
                factors = assistant.getRawInput().split("+");
            } else {
                factors = [ assistant.getRawInput().trim() ];
            }

            let product = 1;
            let allFactorsArePrime = true;
            for (let factor of factors) {
                let factorNumber = parseInt(factor.trim());
                allFactorsArePrime = allFactorsArePrime && isPrime(factorNumber);
                product = product * factorNumber;
            }
            
            let inputPrompt;
            if (product === randomNumber) {
                if (allFactorsArePrime) {
                    state.randomNumber = Math.floor(Math.random() * 99 + 1);
                    inputPrompt = assistant.buildInputPrompt(true, '<speak>You got it right!\nHere is a new number: ' + state.randomNumber + '</speak');    
                } else {
                    inputPrompt = assistant.buildInputPrompt(true, '<speak>Not all your factors are prime numbers, please try again.</speak>');
                }
            } else {
                inputPrompt = assistant.buildInputPrompt(true, '<speak>Nope, your math is wrong. Please try again</speak>');
            }

            assistant.ask(inputPrompt, state);
        }
    }

    let actionsMap = new Map();
    actionsMap.set(assistant.StandardIntents.MAIN, mainIntent);
    actionsMap.set(assistant.StandardIntents.TEXT, rawInput);

    assistant.handleRequest(actionsMap);
});

let server = app.listen(app.get('port'), function () {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});


