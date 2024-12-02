const { app } = require('@azure/functions');
const { getMediaBlob, getMediaBlobContainer } = require('../shared/storageAccount');

app.http('DeleteMedia', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'media/{filename}',
    handler: async (request, context) => {
        const fileName = request.params.filename

        if (!fileName) {
            console.error('No file name provided')
            return {
                status: 400,
                body: "File name requiered in path.",
            };
        }

        console.log(`Trying to delete blob with name ${fileName}`)
        try {
            const container = getMediaBlobContainer()
            const blob = container.getBlobClient(fileName)
            
            console.log(`Starting to delete blob '${blob.name}'`)
            await blob.delete({
                deleteSnapshots: "include"
            })

            console.log(`Successfully delete Blob '${blob.name}'`)
            return {
                status: 204
            }
        } catch (error) {
            console.error(error)
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
