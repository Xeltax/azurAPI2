const { BlobServiceClient } = require("@azure/storage-blob");

const client = BlobServiceClient.fromConnectionString(process.env.STORAGE_ACCOUNT);
const container = client.getContainerClient('media');

const getMediaBlob = (fileName) => {
    return container.getBlobClient(fileName);
}

module.exports = { getMediaBlob }