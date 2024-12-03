const { app } = require('@azure/functions');
const { getMediaBlobContainer } = require('../shared/storageAccount');
const { verify_JWT } = require('../shared/jwt');

app.http('GetMedia', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'media/{filename}',
    handler: async (request, context) => {
        
        const JWT_verification = verify_JWT(request)
        if (JWT_verification.status !== 200) {
            return {
                status: JWT_verification.status,
                body: JWT_verification.body
            };
        }

        const fileName = request.params.filename
        if (!fileName) {
            context.error('No file name provided')
            return {
                status: 400,
                body: "File name requiered in path.",
            };
        }

        context.log(`Trying to get blob media with name ${fileName}`)
        try {
            const container = getMediaBlobContainer()
            const blob = container.getBlobClient(fileName)
            const downloadedBlob = await blob.download()

            context.log(`Starting to fetch blob media '${blob.name}'`)
            const chunks = []
            for await (const chunk of downloadedBlob.readableStreamBody) {
                chunks.push(chunk)
            }
            const blobData = Buffer.concat(chunks) 

            context.log(`Successfully retrieved Blob media '${blob.name}'`)
            return {
                status: 200,
                headers: {
                    'Content-Type': 'image/png',
                    'Content-Disposition': `inline; filename=${fileName}`
                },
                body: blobData
            }
        } catch (error) {
            context.error(error)
            if (error.statusCode === 404) {
                return {
                    status: 404,
                    body: `Media blob not found with name '${fileName}'.`,
                };
            }
            return {
                status: 500,
                body: `Error while trying to retrieve media blob with name '${fileName}'.`
            };
        }
    }
});
