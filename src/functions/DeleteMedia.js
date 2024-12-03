const { app } = require('@azure/functions');
const { getMediaBlobContainer } = require('../shared/storageAccount');
const { verify_JWT } = require('../shared/jwt');

app.http('DeleteMedia', {
    methods: ['DELETE'],
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

        context.log(`Trying to delete blob media with name ${fileName}`)
        try {
            const container = getMediaBlobContainer()
            const blob = container.getBlobClient(fileName)
            
            context.log(`Starting to delete blob media '${blob.name}'`)
            await blob.delete({
                deleteSnapshots: "include"
            })

            context.log(`Successfully delete Blob media '${blob.name}'`)
            return {
                status: 204
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
                body: `Error while trying to delete media blob with name '${fileName}'.`
            };
        }
    }
});
