const { app } = require('@azure/functions');
const bcrypt = require("bcryptjs");
const { getContainer } = require('../shared/database');

const usersContainer = getContainer('users');

app.http('Register', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const userData = await request.json();

        // Vérifiez que l'utilisateur n'existe pas déjà
        const { resources: existingUsers } = await usersContainer.items.query(`SELECT * FROM c WHERE c.username = "${userData.username}"`).fetchAll();

        if (existingUsers.length > 0) {
            console.log("400 returned")
            return {
                status: 400,
                body: "L'utilisateur existe déjà"
            };
        }

        // Hachez le mot de passe
        const passwordHash = await bcrypt.hash(userData.password, 10);

        // Créez un nouvel utilisateur dans Cosmos DB
        const newUser = {
            id: Math.random().toString(36).substr(2, 9), // Génération d'un ID unique
            username : userData.username,
            role : userData.role ? userData.role : "private",
            passwordHash
        };

        console.log(newUser)

        const { resource: createdUser } = await usersContainer.items.create(newUser);

        return {
            status: 201,
            body: createdUser
        };
    }
})