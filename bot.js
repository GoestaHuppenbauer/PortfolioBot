
// Copykright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// edited sample from https://github.com/microsoft/BotBuilder-Samples/tree/master/samples/javascript_nodejs/14.nlp-with-dispatch 

const { ActivityHandler } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');

/**
 * A simple bot that responds to utterances with answers from the Language Understanding (LUIS) service.
 * If an answer is not found for an utterance, the bot responds with help.
 */
class LuisBot extends ActivityHandler {
    
    constructor() {
        super();

        // If the includeApiResults parameter is set to true, as shown below, the full response
        // from the LUIS api will be made available in the properties  of the RecognizerResult
        const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LuisAppId,
            endpointKey: process.env.LuisAPIKey,
            endpoint: `https://${ process.env.LuisRegion }.api.cognitive.microsoft.com`
        }, {
            includeAllIntents: true,
            includeInstanceData: true
        }, true);

        this.dispatchRecognizer = dispatchRecognizer;


        /**
         * Every message calls this method.
         * There are no dialogs used, since it's "single turn" processing, meaning a single request and
         * response, with no stateful conversation.
         */
        this.onMessage(async (context, next) => {
            console.log('Processing Message Activity.');

            // First, we use the dispatch model to determine which cognitive service (LUIS or QnA) to use.
            const recognizerResult = await dispatchRecognizer.recognize(context);

            // Top intent tell us which cognitive service to use.
            const intent = LuisRecognizer.topIntent(recognizerResult);

            // Next, we call the dispatcher with the top intent.
            await this.dispatchToTopIntentAsync(context, intent, recognizerResult);

            await next();
        });

        /**
         * Whenever a user joins the conversation this message is send to the user.
         */
        this.onMembersAdded(async (context, next) => {
            const welcomeText = 'Send me a message and I will try to predict your intent.';
            const membersAdded = context.activity.membersAdded;

            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(`Welcome to NLP with LUIS ${ member.name }. ${ welcomeText }`);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    // This is  called when LUIS finished parsing the message and returns possible intents
    async dispatchToTopIntentAsync(context, intent, recognizerResult) {
        switch (intent) {
        case 'Lebenslauf':
            await context.sendActivity(`Grundschule`);
            await context.sendActivity(`Realschule`);
            await context.sendActivity(`weiterführendes Gymnasium`);
            await context.sendActivity(`HfG Schwäbisch Gmünd`);
            break;
        case 'Hobby':
            await context.sendActivity(`Meine Hobbys sind: ...np`);
            break;
        default:
            console.log(`Dispatch unrecognized intent: ${ intent }.`);
            await context.sendActivity(`Da weiß ich leider nicht weiter
                                                \nSie könnten mich aber zum Beispiel nach folgenden Sachen fragen:
                                                \n - '1
                                                \n - '2'
                                                \nTry typing '3' or '4'.`);
            break;
        }
    }


}



module.exports.LuisBot = LuisBot;