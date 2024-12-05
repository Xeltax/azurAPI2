const { getMediaBlobContainer } = require('../../shared/storageAccount');
const { getContainer } = require('../../shared/database');
const { InvocationContext } = require('@azure/functions');

/**
 * @param {InvocationContext} context 
 * @param {any} requestUserData 
 * @param {string} fileName
 */
const deleteMedia = async (context, requestUserData, fileName) => {
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
    context.info(`Successfully retrieve blob media relation for ${userMediaRelation.blobName}`)

    // Vérification des autorisations
    if (userMediaRelation.userId !== requestUserData.userId) {
        context.error(`User ${requestUserData.username} try to delete a resource that is not its own`)
        return {
            status: 401,
            body: JSON.stringify({
                message: 'Unauthorized to access to this resource'
            })
        }
    }
    context.info(`${requestUserData.username} is authorized to delete ${userMediaRelation.blobName} media`)

    // Suppression de la relation
    context.info(`Trying to delete media relation for ${userMediaRelation.blobName}`)
    try {
        await relationContainer.item(userMediaRelation.id, userMediaRelation.blobName).delete()
    } catch (error) {
        context.error('Error while delete user media blob relation')
        throw error
    }
    context.info(`Successfully delete relation for media ${userMediaRelation.blobName} related to ${requestUserData.username}`)

    // Suppression du blob
    context.info(`Trying to delete blob media with name ${userMediaRelation.blobName}`)
    try {
        const container = getMediaBlobContainer()
        const blob = container.getBlobClient(fileName)
        
        await blob.delete({
            deleteSnapshots: "include"
        })

        context.info(`Successfully delete Blob media '${blob.name}'`)
        return {
            status: 204
        }
    } catch (error) {
        if (error.statusCode === 404) {
            context.warn(`Media blob not found with name '${fileName}'`)
            return {
                status: 404,
                body: JSON.stringify({
                    message: `Media blob not found with name '${fileName}'`
                })
            }
        }
        context.error(`Error while deleting blob with name ${fileName}`)
        throw error
    }
}

module.exports = { deleteMedia }