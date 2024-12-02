const { BlobServiceClient } = require("@azure/storage-blob");

const client = BlobServiceClient.fromConnectionString(process.env.STORAGE_ACCOUNT);
const container = client.getContainerClient('media');

const getMediaBlobContainer = () => {
    return client.getContainerClient('media')
}

module.exports = { getMediaBlobContainer, container }