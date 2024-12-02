const jwt = require('jsonwebtoken');

const SECRET_KEY = "4DesaManJWT_Secret785"; // Remplacez par votre clé secrète

// Exemple de payload
const payload = {
    userId: "12345",
    username: "testuser"
};

// Signature
const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
console.log("Token généré :", token);

// Vérification
try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Token décodé :", decoded);
} catch (err) {
    console.error("Erreur de vérification :", err.message);
}