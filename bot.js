
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
            const welcomeText = 'Hallo. Ich bin der Portfolio Bot! Sie können mir fragen zu meiner Person oder zu Projekten stellen die ich Ihnen dann beantworte.';
            const membersAdded = context.activity.membersAdded;

            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(`Hallo ${ member.name }. ${ welcomeText }`);
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
            await context.sendActivity(`Meine Hobbys sind:`);
            await context.sendActivity(`Fußball schauen und spielen,`);
            await context.sendActivity(`Gitarre spielen und singen`);
            break;
        case 'Sprachen':
            await context.sendActivity(`Ich Spreche:`);
            await context.sendActivity(`Englisch,`);
            await context.sendActivity(`Deutsch`);
            await context.sendActivity(`Und Spanisch.`);
            break;
        case 'Programmiersprachen':
            await context.sendActivity(`Durch die Uni habe ich:`);
            await context.sendActivity(`Java Script,`);
            await context.sendActivity(`PHP,`);
            await context.sendActivity(`Und die Arduino IDE gelernt!`);
            await context.sendActivity(`Aber auch mit Datenbanken also MySql hatte ich dort schon zu tun.`);
            break;
        case 'Programme':
            await context.sendActivity(`Ich kenne mich mit folgender Software aus:`);
            await context.sendActivity(`Adobe XD,`);
            await context.sendActivity(`Photoshop CC,`);
            await context.sendActivity(`Sketch`);
            await context.sendActivity(`Und allen Microsoft Programmen`);
            break;
        case 'EntwurfTools':
            await context.sendActivity(`In Entwurf Grundlagen 2 haben wir hauptsächlich mit Adobe XD gearbeitet.`);
            await context.sendActivity(`Damals war das Teamwork Feature noch ganz neu und auch noch nicht so stabil. Häufig haben wir Zwischenstände deswegen verloren.`);
            break;
        case 'EntwurfAufgabe':
            await context.sendActivity(`Die Kühlschrank App ist das Ergebnis des Fachs 'Entwurf Grundlagen 2'. Die Aufgabenstellung hierfür war relativ eng gehalten.`);
            await context.sendActivity(`Wir hatten einen Funktionsumfang der erreicht werden sollte. Die nötigen Funktionen waren:
            \n - Einsehen welche Nahrungsmittel sich im Kühlschrank befinden
            \n - Es musste möglich sein Einstellungen am Kühlschrank zu ändern
            \n - Mindestens eine Benachrichtigung sollte designt werden. 
            \n Außerdem wurde es uns frei gehalten zusärtzliche Funktionen einzubauen.`);
            break;
        case 'EntwurfAufteilung':
            await context.sendActivity(`Eigentlich haben wir an allem gemeinsam gearbeitet. Auch wenn sich die Team Arbeit nicht immer einfach dargestellt hat da man sich bei Formen und Farben sehr oft abstimmen musste, sind wir mit dem Endergebnis sehr zufrieden.`);
            break;
        default:
            console.log(`Dispatch unrecognized intent: ${ intent }.`);
            await context.sendActivity(`Da weiß ich leider nicht weiter
                                                \nSie könnten mich aber zum Beispiel nach folgenden Sachen fragen:
                                                \n - 'Programmiersprachen und Software'
                                                \n - 'Sprachen und Eigenschaften'
                                                \n - 'Projekten auf dieser Seite' oder 'meinem Lebenslauf'.`);
            break;
        }
    }


}



module.exports.LuisBot = LuisBot;