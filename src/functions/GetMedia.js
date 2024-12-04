const { app } = require('@azure/functions');
const { getMediaBlobContainer } = require('../shared/storageAccount');
const { verify_JWT } = require('../shared/jwt');
const { getContainer } = require('../shared/database');

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
        requestUserData = JWT_verification.body

        const fileName = request.params.filename
        if (!fileName) {
            context.error('No file name provided')
            return {
                status: 400,
                body: "File name requiered in path.",
            };
        }

        // Récupération de la relation
        let userMediaRelation
        try {
            context.info('Starting to find blob relation data')

            const relationContainer = getContainer('userMediaRelation')
            const relationQuery = {
                query: 'SELECT * FROM c WHERE c.blobName = @blobName',
                parameters: [{ name: '@blobName', value: fileName }]
            }
            const { resources: relations } = await relationContainer.items.query(relationQuery).fetchAll()
            
            if (relations.length === 0) {
                context.error(`No relation found for blob ${fileName}`)
                return {
                    status: 404,
                    body: `No media found with name ${fileName}`
                }
            }

            userMediaRelation = relations[0]
        } catch (error) {
            context.error(error)
            return {
                status: 500,
                body: 'Error occured while retrive blob media'
            }
        }
        context.info('Successfully retrieve blob media relation')

        // Récupération des donnée de l'utilisateur
        context.info(`Try to get user data with id ${userMediaRelation.userId}`)
        let mediaRelatedUser
        try {
            const usersContainer = getContainer('users')
            const query = {
                query: 'SELECT * FROM c WHERE c.id = @userId',
                parameters: [{ name: '@userId', value: userMediaRelation.userId }]
            };
            const { resources: existingUsers } = await usersContainer.items.query(query).fetchAll();

            // Vérifiez qu'un utilisateur est trouvé
            if (existingUsers.length === 0) {
                throw Error('Related user not found')
            }
            mediaRelatedUser = existingUsers[0];
        } catch (error) {
            context.error(error)
            return {
                status: 500,
                body: 'Error occured while retrive blob media'
            }
        }

        context.info(`Successfully retrive user data for $ mediaRelatedUser.username}`)
        if (mediaRelatedUser.role === 'private') {
            if (mediaRelatedUser.id === requestUserData.userId) {
                context.warn(`User ${mediaRelatedUser.username} request his own resource`)
            } else {
                context.warn(`User ${mediaRelatedUser.username} has a private account`)
                return {
                    status: 401,
                    body: 'Unauthorized to access to this resource'
                }
            }
        } else {
            context.info(`User ${mediaRelatedUser.username} has a public account`)
        }

        context.info(`Try to get blob media with name ${fileName}`)
        try {
            const container = getMediaBlobContainer()
            const blob = container.getBlobClient(fileName)
            const downloadedBlob = await blob.download()

            context.info(`Starting to fetch blob media '${blob.name}'`)
            const chunks = []
            for await (const chunk of downloadedBlob.readableStreamBody) {
                chunks.push(chunk)
            }
            const blobData = Buffer.concat(chunks) 

            context.info(`Successfully retrieved Blob media '${blob.name}'`)
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
