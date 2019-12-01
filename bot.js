
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
        case 'Hobbies':
            await context.sendActivity(`Meine Hobbys sind: ...np`);
            break;
        case 'Sprachen':
            await context.sendActivity(`Ich Spreche:`);
            await context.sendActivity(`Englisch,`);
            await context.sendActivity(`Deutsch`);
            await context.sendActivity(`Und Spanisch.`);
            break;
        case 'Programmiersprachen':
            await context.sendActivity(`Durch die Uni habe ich:`);
            await Sleep(700);
            await context.sendActivity(`Java Script,`);
            await Sleep(900);
            await context.sendActivity(`PHP,`);
            await Sleep(1000);
            await context.sendActivity(`Und die Arduino IDE gelernt!`);
            await Sleep(700);
            await context.sendActivity(`Aber auch mit Datenbanken also MySql hatte ich dort schon zu tun.`);
            break;
        case 'Programme':
            await context.sendActivity(`Ich kenne mich mit folgender Software aus:`);
            await Sleep(700);
            await context.sendActivity(`Adobe XD,`);
            await Sleep(900);
            await context.sendActivity(`Photoshop CC,`);
            await Sleep(1000);
            await context.sendActivity(`Sketch`);
            await Sleep(700);
            await context.sendActivity(`Und allen Microsoft Programmen`);
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

    async processShoppingOrder(context, luisResult) {
        // Since the LuisRecognizer was configured to include the raw results, get returned entity data.
        var entities = luisResult.entities;

        // check if the entity found is the one we are looking for
        // this is usually only necessary if there are more then one entity in an intent
        if(entities.length > 0 && entities[0].type == "product") {
            // we found a product
            var product = entities[0].entity;
            await context.sendActivity(`Your ordered ${ product }`);
        } else {
            // we found nothing
            await context.sendActivity(`I do not know what you ordered.`);
        }
    }
}



module.exports.LuisBot = LuisBot;