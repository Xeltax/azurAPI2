const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

function verify_JWT(request) {
    try {
        // Récupérer le token depuis les headers
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                status: 401,
                body: "Token JWT manquant ou mal formé"
            };
        }

        const token = authHeader.split(' ')[1];

        
        console.log("SECRET_KEY in verify_JWT:", SECRET_KEY);
        console.log(token)
        console.log(SECRET_KEY)
        
        // Vérifier et décoder le token JWT
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return {
                status: 401,
                body: "Token JWT invalide"
            };
        }

        // Lire tous les utilisateurs de la base de données

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: true
        };
    } catch (error) {
        console.error("Erreur dans verify_JWT :", error);
        return {
            status: 500,
            body: "Une erreur interne est survenue"
        };
    }
}

module.exports = { verify_JWT };