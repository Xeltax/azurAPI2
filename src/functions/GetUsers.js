const { app } = require('@azure/functions');
const { getContainer } = require('../shared/database');
const { verify_JWT } = require('../shared/jwt');

const usersContainer = getContainer('users'); // Nom du conteneur

app.http('GetUsers', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const JWT_verification = verify_JWT(request)
        let decodedToken
        if (JWT_verification.status !== 200) {
            return {
                status: JWT_verification.status,
                body: JWT_verification.body
            };
        } else {
            decodedToken = JWT_verification.body
        }

        const { resources: users } = await usersContainer.items.readAll().fetchAll();
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(users)
        };
    }
});
