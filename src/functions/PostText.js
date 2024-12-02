const { app } = require('@azure/functions');
const { getContainer } = require('../shared/database');

// Initialisation du conteneur pour stocker les textes
const textsContainer = getContainer('texts');

app.http('PostText', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json(); // Lire le contenu de la requête JSON
            const text = body.text;

            if (!text) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'The "text" field is required' }),
                };
            }

            const newText = { id: Date.now().toString(), text };
            const { resource: createdText } = await textsContainer.items.create(newText);

            return {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(createdText),
            };
        } catch (err) {
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'Failed to create text', details: err.message }),
            };
        }
    },
});
