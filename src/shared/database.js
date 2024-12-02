const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
    endpoint: process.env.COSMOS_DB_URI,
    key: process.env.COSMOS_DB_KEY
});

const database = client.database(process.env.COSMOS_DB_DATABASE);

// Récupérer un conteneur
const getContainer = (containerName) => {
    return database.container(containerName);
};

module.exports = { getContainer };