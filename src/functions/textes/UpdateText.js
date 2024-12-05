const { getContainer } = require("../../shared/database")

/**
 * @param {InvocationContext} context 
 * @param {any} requestUserData 
 * @param {string} fileName
 */
const updateText = async (context, request, requestUserData, textId) => {
    const content = await request.json()

    if (content.content === undefined) {
        return {
            status: 400,
            body: JSON.stringify({
                message: 'Body must be contain json with content property'
            })
        }
    }

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
        context.error(`User ${requestUserData.username} try to patch a resource that is not its own`)
        return {
            status: 401,
            body: JSON.stringify({
                message: 'Unauthorized to access to this resource'
            })
        }
    }
    context.info(`${requestUserData.username} is authorized to patch ${text.id} text`)

    // Update du texte
    try {
        text.content = content.content

        await textCollection.item(text.id, text.id).replace(text) 
    } catch (error) {
        context.error(`Error while updating text ${text.id}`)
        throw error
    }

    return {
        status: 200,
        body: JSON.stringify({
            userId: textAuthor.id,
            username: textAuthor.username,
            content: text.content
        })
    }
}

module.exports = { updateText }