const { app } = require('@azure/functions');
const { verify_JWT } = require('../shared/jwt');
const { getMedia } = require('./media/GetMedia');
const { postMedia } = require('./media/PostMedia');
const { deleteMedia } = require('./media/DeleteMedia');

app.http('Media', {
    methods: ['GET', 'POST', 'DELETE'],
    authLevel: 'anonymous',
    route: 'media/{filename?}',
    handler: async (request, context) => {

        const JWT_verification = verify_JWT(request)
        if (JWT_verification.status !== 200) {
            return {
                status: JWT_verification.status,
                body: JWT_verification.body
            };
        }
        requestUserData = JWT_verification.body

        const fileName = request.params?.filename
        context.info(`${request.method} - /media${fileName ? '/' + fileName : ''}`)

        if (fileName === undefined && ['GET', 'DELETE'].includes(request.method)) {
            context.error(`File name is required to ${request.method.toLowerCase()} media`)
            return {
                status: 400,
                body: JSON.stringify({
                    message: "File name requiered in path"
                })
            };
        }

        try {
            switch (request.method) {
                case 'POST':
                    return await postMedia(context, request, requestUserData)
                case 'GET':
                    return await getMedia(context, requestUserData, fileName)
                case 'DELETE':
                    return await deleteMedia(context, requestUserData, fileName)
            }
        } catch (error) {
            context.error(`Error occured while working with media using verb ${request.method}`, error)
            return {
                status: 500,
                body: JSON.stringify({
                    message: 'Error occured while function working with medias'
                })
            }
        }
    }
});

