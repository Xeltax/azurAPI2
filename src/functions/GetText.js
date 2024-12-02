const { app } = require('@azure/functions');

// GET Endpoint to fetch texts
app.http('GetTexts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Exemple : Textes statiques (remplacer par une logique de stockage)
            const texts = ['Sample Text 1', 'Sample Text 2', 'Sample Text 3'];

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body:  JSON.stringify(texts),
            };
        } catch (err) {
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: { error: 'Failed to fetch texts', details: err.message },
            };
        }
    },
});
