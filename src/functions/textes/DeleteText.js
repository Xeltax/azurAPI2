const { getContainer } = require('../../shared/database');

/**
 * @param {InvocationContext} context 
 * @param {any} requestUserData 
 * @param {string} fileName
 */
const deleteText = async (context, requestUserData, textId) => {
    
    const textCollection = getContainer('texts')
    
    // Récupération des informations du texte
    let text
    try {
        const relationQuery = {
            query: 'SELECT * FROM c WHERE c.id = @id',
            parameters: [{ name: '@id', value: textId }]
        }
        const { resources: textes } = await textCollection.items.query(relationQuery).fetchAll()

        if (textes.length === 0) {
            context.error(`No text found for id ${textId}`)
            return {
                status: 404,
                body: JSON.stringify({
                    message: `No text found for id ${textId}`
                })
            }
        }
        text = textes[0]
    } catch (error) {
        context.error(`Error while retrieve text data with id ${textId}`)
        throw error
    }

    // Récupération de l'auteur du texte
    let textAuthor
    try {
        const usersContainer = getContainer('users')
        const query = {
            query: 'SELECT * FROM c WHERE c.id = @userId',
            parameters: [{ name: '@userId', value: text.userId }]
        };
        const { resources: existingUsers } = await usersContainer.items.query(query).fetchAll();

        // Vérifiez qu'un utilisateur est trouvé
        if (existingUsers.length === 0) {
            throw Error(`No users for text ${textId} were found`)
        }
        textAuthor = existingUsers[0];
    } catch (error) {
        context.error('Error while retrieve text author data')
        throw error
    }

    // Vérification des autorisations
    if (textAuthor.id !== requestUserData.userId) {
        context.error(`User ${requestUserData.username} try to delete a resource that is not its own`)
        return {
            status: 401,
            body: JSON.stringify({
                message: 'Unauthorized to access to this resource'
            })
        }
    }
    context.info(`${requestUserData.username} is authorized to delete ${text.id} text`)

    // Suppression de la relation
    context.info(`Trying to delete text ${text.id}`)
    try {
        await textCollection.item(text.id, text.id).delete()
    } catch (error) {
        context.error('Error while delete user text')
        throw error
    }
    context.info(`Successfully delete text ${text.id} related to ${requestUserData.username}`)

    return {
        status: 204
    }
}

module.exports = { deleteText }