const { app } = require('@azure/functions');
const { getContainer } = require('../shared/database');
const { verify_JWT } = require('../shared/jwt');

// Initialize the Cosmos DB container for texts
const textsContainer = getContainer('texts');

app.http('GetTexts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        const JWT_verification = verify_JWT(request)
        if (JWT_verification.status !== 200) {
            return {
                status: JWT_verification.status,
                body: JWT_verification.body
            };
        }

        try {
            // Fetch all items from the Cosmos DB container
            const { resources: texts } = await textsContainer.items.readAll().fetchAll();

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: texts,
            };
        } catch (err) {
            console.error('Error fetching texts:', err.message);
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