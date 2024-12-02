const { app } = require('@azure/functions');
const { getContainer } = require('../shared/database');

// Initialize the Cosmos DB container for texts
const textsContainer = getContainer('texts');

app.http('DeleteText', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Extract the text ID from the URL query parameter
            const textId = context.bindingData.id;
            if (!textId) {
                return {
                    status: 400,
                    body: { error: 'Text ID is required' },
                };
            }

            console.log(`Attempting to delete text with ID: ${textId}`);

            // Delete the item from the Cosmos DB container
            await textsContainer.item(textId, textId).delete();

            return {
                status: 200,
                body: { message: `Text with ID ${textId} deleted successfully` },
            };
        } catch (err) {
            console.error('Error deleting text:', err.message);
            if (err.code === 404) {
                return {
                    status: 404,
                    body: { error: `Text with ID ${context.bindingData.id} not found` },
                };
            }
            return {
                status: 500,
                body: { error: 'Failed to delete text', details: err.message },
            };
        }
    },
});