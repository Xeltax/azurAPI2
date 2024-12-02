const { app } = require('@azure/functions');
const { getMediaBlobContainer } = require('../shared/storageAccount');
const { Readable } = require('stream');

app.http('PostMedia', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'media',
    handler: async (request, context) => {

        const contentType = request.headers['content-type'] // Détecte le type MIME
        const blobName = `upload-${Date.now()}`             // Générer un nom unique pour le blob
        
        const body = await request.body
        const stream = Readable.from(body)                  // Contient le contenu du fichier

        try {
            console.log(`Starting upload blob media '${blobName}'`)

            const container = getMediaBlobContainer()
            const blockBlobClient = container.getBlockBlobClient(blobName)
            await blockBlobClient.uploadStream(stream, undefined, undefined,  {
                blobHTTPHeaders: { blobContentType: contentType }
            })

            console.log(`Successfully upload blob media '${blobName}'`)
            return {
                status: 201,
                body: JSON.stringify({
                    name: blockBlobClient.name,
                    url: blockBlobClient.url
                })
            }
        } catch (error) {
            console.error(error)
            return {
                status: 500,
                body: 'Error while uploading your media'
            };
        }
    
    }
});
