'use strict';

// =================================================================================
// App Configuration: Create Webhook + Enable Logging
// =================================================================================

const webhook = require('../../index').Webhook;
const app = require('../../index').Jovo;

// Enable Logging for Quick Testing
app.setConfig({
    logging: true,
});

// Listen for post requests
webhook.listen(3000, function() {
    console.log('Example server listening on port 3000!');
});

webhook.post('/webhook', function(req, res) {
    app.handleRequest(req, res, handlers);
    app.execute();
});

// =================================================================================
// App Logic: Hello World
// =================================================================================

let handlers = {

    'LAUNCH': function() {
        // async amazon api call
        this.alexaSkill().progressiveResponse('Processing your request');

        // or more than one progressive responses

        // this.alexaSkill().progressiveResponse('Processing your request', () => {
        //     setTimeout( () => {
        //         this.alexaSkill().progressiveResponse('Still processing');
        //     }, 1500);
        // });


        dummyApiCall( () => {
            this.tell('Here is your information.');
        });
    },

    'HelloWorldIntent': function() {
        this.tell('Hello World!');
    },
    'Unhandled': function() {
        this.tell('Unhandled');
    },
};

/**
 * Simulates a long api call
 * @param {func} callback
 */
function dummyApiCall(callback) {
    setTimeout(callback, 5000);
}
