const { app } = require('@azure/functions');
const { verify_JWT } = require('../shared/jwt');
const { postText } = require('./textes/PostText');
const { getText } = require('./textes/GetText');
const { deleteText } = require('./textes/DeleteText');
const { updateText } = require('./textes/UpdateText');

app.http('Textes', {
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    authLevel: 'anonymous',
    route: 'text/{textId?}',
    handler: async (request, context) => {

        const JWT_verification = verify_JWT(request)
        if (JWT_verification.status !== 200) {
            return {
                status: JWT_verification.status,
                body: JWT_verification.body
            };
        }
        requestUserData = JWT_verification.body

        const textId = request.params?.textId
        context.info(`${request.method} - /text${textId ? '/' + textId : ''}`)

        if (textId === undefined && ['GET', 'PATCH', 'DELETE'].includes(request.method)) {
            context.error(`Text id is required to ${request.method.toLowerCase()} text`)
            return {
                status: 400,
                body: JSON.stringify({
                    message: "Text id requiered in path"
                })
            };
        }

        try {
            switch (request.method) {
                case 'POST':
                    return await postText(context, request, requestUserData)
                case 'GET':
                    return await getText(context, requestUserData, textId)
                case 'PATCH':
                    return await updateText(context, request, requestUserData, textId)
                case 'DELETE':
                    return await deleteText(context, requestUserData, textId)
            }
        } catch (error) {
            context.error(`Error occured while working with textes using verb ${request.method}`, error)
            return {
                status: 500,
                body: JSON.stringify({
                    message: 'Error occured while function working with textes'
                })
            }
        }
    }
});