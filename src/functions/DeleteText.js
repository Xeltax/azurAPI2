const { app } = require('@azure/functions');

// DELETE Endpoint to remove text
app.http('DeleteText', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Récupération de l'ID du texte depuis l'URL
            const textId = request.query.id;

            if (!textId) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ error: 'Text ID is required.' }),
                };
            }

            // Exemple : Suppression simulée (remplacer par une logique réelle)
            const deletedText = `Text with ID ${textId} deleted successfully`;

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: deletedText }),
            };
        } catch (err) {
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    error: 'Failed to delete text',
                    details: err.message,
                }),
            };
        }
    },
});
