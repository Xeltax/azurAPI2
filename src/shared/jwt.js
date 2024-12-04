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

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: decodedToken
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