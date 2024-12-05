const { InvocationContext } = require('@azure/functions');
const { getMediaBlobContainer } = require('../../shared/storageAccount');
const { getContainer } = require('../../shared/database');

/**
 * @param {InvocationContext} context 
 * @param {any} requestUserData 
 * @param {any} fileName 
 * @returns 
 */
const getMedia = async (context, requestUserData, fileName) => {

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
                body: JSON.stringify({
                    message: `No media found with name ${fileName}`
                })
            }
        }
        userMediaRelation = relations[0]
    } catch (error) {
        context.error('Error while retrieve media relations')
        throw error
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
            throw Error(`No users related to the media ${fileName} were found`)
        }
        mediaRelatedUser = existingUsers[0];
    } catch (error) {
        context.error('Error while retrieve related user data')
        throw error
    }

    // Gestion des comptes privés / publiques
    context.info(`Successfully retrive user data for ${mediaRelatedUser.username}`)
    if (mediaRelatedUser.role === 'private') {
        if (mediaRelatedUser.id === requestUserData.userId) {
            context.warn(`User ${mediaRelatedUser.username} request his own resource`)
        } else {
            context.warn(`User ${mediaRelatedUser.username} has a private account but ${requestUserData.username} try to access to his content`)
            return {
                status: 401,
                body: JSON.stringify({
                    message: 'Unauthorized to access to this resource'
                })
            }
        }
    } else {
        context.info(`User ${mediaRelatedUser.username} has a public account`)
    }

    // Récupération et lecture du blob
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
        if (error.statusCode === 404) {
            context.warn(`Media blob not found with name ${fileName}`)
            return {
                status: 404,
                body: JSON.stringify({
                    message: `Media blob not found with name ${fileName}`
                })
            }
        }
        context.error(`Error while reading blob with name ${fileName}`)
        throw error
    }
}

module.exports = { getMedia }