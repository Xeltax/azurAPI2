const { app } = require('@azure/functions');
const { getContainer } = require('../shared/database');

const usersContainer = getContainer('users'); // Nom du conteneur

app.http('GetUsers', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'GET') {
            const { resources: users } = await usersContainer.items.readAll().fetchAll();
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(users)
            };
        } else if (request.method === 'POST') {
            const userData = await request.json();
            if (!userData || !userData.username) {
                return {
                    status: 400,
                    body: { error: 'Invalid user data. "username" is required.' }
                };
            }

            const newUser = { id: Date.now().toString(), username: userData.username };
            const { resource: createdUser } = await usersContainer.items.create(newUser);

            return {
                status: 201,
                body: createdUser
            };
        }
    }
});
