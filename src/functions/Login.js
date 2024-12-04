const { app } = require('@azure/functions');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getContainer } = require('../shared/database');

// Accéder au conteneur des utilisateurs
const usersContainer = getContainer('users');

// Clé secrète pour signer le token
const SECRET_KEY = process.env.JWT_SECRET;

app.http('Login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Parse le body de la requête
            const userData = await request.json();
            
            if (!userData.username || !userData.password) {
                return {
                    status: 400,
                    body: "Le nom d'utilisateur et le mot de passe sont requis."
                };
            }

            // Requête pour trouver l'utilisateur par son username
            const query = {
                query: 'SELECT * FROM c WHERE c.username = @username',
                parameters: [{ name: '@username', value: userData.username }]
            };
            const { resources: existingUsers } = await usersContainer.items.query(query).fetchAll();

            // Vérifiez qu'un utilisateur est trouvé
            if (existingUsers.length === 0) {
                return {
                    status: 401,
                    body: "Utilisateur non trouvé"
                };
            }

            // Récupérer le premier utilisateur trouvé (doit être unique)
            const user = existingUsers[0];

            // Vérifiez le mot de passe
            const passwordValid = await bcrypt.compare(userData.password, user.passwordHash);
            console.log(passwordValid)
            if (!passwordValid) {
                return {
                    status: 401,
                    body: "Mot de passe incorrect"
                };
            }
            
            // Générer un JWT
            const token = jwt.sign(
                { userId: user.id, username: user.username, role : user.role },
                SECRET_KEY,
                { expiresIn: "1h" } // Durée de validité
            );

            console.log("SECRET_KEY in Login:", SECRET_KEY);

            console.log("Token JWT " + token)

            return {
                status: 200,
                body: token
            };
        } catch (error) {
            context.log.error("Erreur dans la fonction Login :", error);

            return {
                status: 500,
                body: "Une erreur interne est survenue."
            };
        }
    }
});
