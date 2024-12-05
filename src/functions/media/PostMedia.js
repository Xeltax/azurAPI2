const { getMediaBlobContainer } = require('../../shared/storageAccount');
const { Readable } = require('stream');
const { getContainer } = require('../../shared/database');
const { InvocationContext, HttpRequest } = require('@azure/functions');


/**
 * @param {InvocationContext} context 
 * @param {HttpRequest} request 
 * @param {any} requestUserData 
 */
const postMedia = async (context, request, requestUserData) => {

    let blockBlobClient;
    try {
        const contentType = request.headers['content-type'] // Détecte le type MIME
        const blobName = `upload-${Date.now()}`             // Générer un nom unique pour le blob
        context.info(`Starting upload blob media '${blobName}'`)

        const body = await request.body
        const stream = Readable.from(body)                  // Contient le contenu du fichier

        const container = getMediaBlobContainer()
        blockBlobClient = container.getBlockBlobClient(blobName)
        await blockBlobClient.uploadStream(stream, undefined, undefined,  {
            blobHTTPHeaders: { blobContentType: contentType }
        })

        context.info(`Successfully upload blob media '${blobName}'`)

    } catch (error) {
        context.error('Error while create new blob')
        throw error
    }

    try {
        context.info(`Create relation between blob ${blockBlobClient.name} and user ${requestUserData.username}`)

        const relationData = {
            userId: requestUserData.userId,
            storageAccount: blockBlobClient.accountName,
            container: blockBlobClient.containerName,
            blobName: blockBlobClient.name,
            url: blockBlobClient.url
        }

        const collection = getContainer('userMediaRelation')
        await collection.items.create(relationData)

        context.log(`Successfully related blob ${blockBlobClient.name} to user ${requestUserData.username}`)
    } catch (error) {
        context.error('Error while create blob media to user relation')
        throw error
    }

    // Media posté avec succès
    return {
        status: 201,
        body: JSON.stringify({
            name: blockBlobClient.name
        })
    }
}

module.exports = { postMedia }