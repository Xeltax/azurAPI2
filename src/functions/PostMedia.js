const { app } = require('@azure/functions');
const { getMediaBlobContainer } = require('../shared/storageAccount');
const { Readable } = require('stream');
const { verify_JWT } = require('../shared/jwt');
const { getContainer } = require('../shared/database');

app.http('PostMedia', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'media',
    handler: async (request, context) => {

        const JWT_verification = verify_JWT(request)
        if (JWT_verification.status !== 200) {
            return {
                status: JWT_verification.status,
                body: JWT_verification.body
            };
        }
        const userData = JWT_verification.body

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
            context.error(error)
            return {
                status: 500,
                body: 'Error while uploading your media'
            };
        }

        try {
            context.info(`Create relation between blob ${blockBlobClient.name} and user ${userData.username}`)

            const relationData = {
                userId: userData.userId,
                storageAccount: blockBlobClient.accountName,
                container: blockBlobClient.containerName,
                blobName: blockBlobClient.name,
                url: blockBlobClient.url
            }

            const collection = getContainer('userMediaRelation')
            await collection.items.create(relationData)

            context.log(`Successfully related blob ${blockBlobClient.name} to user ${userData.username}`)
        } catch (error) {
            context.log(error)
            return {
                status: 500,
                body: 'Error while uploading your media'
            };
        }

        // Media posté avec succès
        return {
            status: 201,
            body: JSON.stringify({
                name: blockBlobClient.name
            })
        }
    }
});