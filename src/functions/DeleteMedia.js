const { app } = require('@azure/functions');
const { getMediaBlobContainer, container } = require('../shared/storageAccount');
const { verify_JWT } = require('../shared/jwt');
const { getContainer } = require('../shared/database');

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
        const userData = JWT_verification.body

        const fileName = request.params.filename
        if (!fileName) {
            context.error('No file name provided')
            return {
                status: 400,
                body: "File name requiered in path.",
            };
        }

        const relationContainer = getContainer('userMediaRelation')

        // Récupération de la relation
        let userMediaRelation
        try {
            context.info(`Trying to find blob relation data for ${fileName}`)

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
            context.error('Error occured while retrive blob media relation')
            context.error(error)
            return {
                status: 500,
                body: 'Error occured while deleting blob media'
            }
        }
        context.info(`Successfully retrieve blob media relation for ${userMediaRelation.blobName}`)

        // Vérification des autorisations
        if (userMediaRelation.userId !== userData.userId) {
            context.error(`User ${userData.username} try to delete a resource that is not its own`)
            return {
                status: 401,
                body: 'Unauthorized to access to this resource'
            }
        }
        context.info(`${userData.username} is authorized to delete ${userMediaRelation.blobName} media`)

        // Suppression de la relation
        context.info(`Trying to delete media relation for ${userMediaRelation.blobName}`)
        try {
            await relationContainer.item(userMediaRelation.id, userMediaRelation.blobName).delete()
        } catch (error) {
            context.error('Error while delete user media blob relation')
            context.error(error)
            return {
                status: 500,
                body: 'Error occured while deleting blob media'
            }
        }
        context.info(`Successfully delete relation for media ${userMediaRelation.id} related to ${userMediaRelation.userId}`)

        // Suppression du blob
        context.info(`Trying to delete blob media with name ${userMediaRelation.blobName}`)
        try {
            const container = getMediaBlobContainer()
            const blob = container.getBlobClient(fileName)
            
            context.info(`Starting to delete blob media '${blob.name}'`)
            await blob.delete({
                deleteSnapshots: "include"
            })

            context.info(`Successfully delete Blob media '${blob.name}'`)
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
