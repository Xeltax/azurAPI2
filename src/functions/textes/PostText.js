const { getContainer } = require('../../shared/database');

/**
 * @param {InvocationContext} context 
 * @param {HttpRequest} request 
 * @param {any} requestUserData 
 */
const postText = async (context, request, requestUserData) => {

    const content = await request.json()

    const newText = {
        userId: requestUserData.userId,
        content: content.content
    }

    // Ajout du texte à la base Cosmos
    context.info(`Try to create new text for user ${requestUserData.username}`)
    try {
        const collection = getContainer('texts')
        const { item: text }  = await collection.items.create(newText)

        context.info(`Successfully create new text for user ${requestUserData.username}`)
        return {
            status: 201,
            body: JSON.stringify({
                id: text.partitionKey[0]
            })
        }
    } catch (error) {
        context.error('Error while create new text')
        throw error
    }
}

module.exports = { postText }