const { app } = require('@azure/functions');
const { getMediaBlob, getMediaBlobContainer } = require('../shared/storageAccount');

app.http('GetMedia', {
    methods: ['GET'],
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

        console.log(`Trying to get blob with name ${fileName}`)
        try {
            const container = getMediaBlobContainer()
            const blob = container.getBlobClient(fileName)
            const downloadedBlob = await blob.download()

            console.log(`Starting to fetch blob '${blob.name}'`)
            const chunks = []
            for await (const chunk of downloadedBlob.readableStreamBody) {
                chunks.push(chunk)
            }
            const blobData = Buffer.concat(chunks) 

            console.log(`Successfully retrieved Blob '${blob.name}'`)
            return {
                status: 200,
                headers: {
                    'Content-Type': 'image/png',
                    'Content-Disposition': `inline; filename=${fileName}`
                },
                body: blobData
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
                body: `Error while trying to retrieve media blob with name '${fileName}'.`
            };
        }
    
    }
});
