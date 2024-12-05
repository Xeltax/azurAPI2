const { getContainer } = require('../../shared/database');

/**
 * @param {InvocationContext} context 
 * @param {any} requestUserData 
 * @param {string} textId 
 * @returns 
 */
const getText = async (context, requestUserData, textId) => {

    // Récupération des informations du texte
    let text
    try {
        const collection = getContainer('texts')
        const relationQuery = {
            query: 'SELECT * FROM c WHERE c.id = @id',
            parameters: [{ name: '@id', value: textId }]
        }
        const { resources: textes } = await collection.items.query(relationQuery).fetchAll()

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

    // Vérification da la visibilité du texte
    context.info(`Successfully retrive user data for ${textAuthor.username}`)
    if (textAuthor.role === 'private') {
        if (textAuthor.id === requestUserData.userId) {
            context.warn(`User ${textAuthor.username} request his own resource`)
        } else {
            context.warn(`User ${textAuthor.username} has a private account but ${requestUserData.username} try to access to his content`)
            return {
                status: 401,
                body: JSON.stringify({
                    message: 'Unauthorized to access to this resource'
                })
            }
        }
    } else {
        context.info(`User ${textAuthor.username} has a public account`)
    }

    // Le texte a bien été trouvé
    return {
        status: 200,
        body: JSON.stringify({
            userId: textAuthor.id,
            username: textAuthor.username,
            content: text.content
        })
    }
}

module.exports = { getText }