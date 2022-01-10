import bodyParser from 'body-parser'
import express from 'express'
import 'express-async-errors'
import jsonwebtoken from 'jsonwebtoken'
import { ACCESS_TOKEN_EXPIRATION, ACCESS_TOKEN_SECRET, PORT, REFRESH_TOKEN_SECRET } from './environment.js'
import { EmailTakenError } from './errors/EmailTaken.error.js'
import { InvalidPasswordError } from './errors/InvalidPassword.error.js'
import { NullArgumentError } from './errors/NullArgument.error.js'
import { PasswordUnreliableError } from './errors/PasswordUnreliable.error.js'
import { UserNotFoundError } from './errors/UserNotFound.error.js'
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware.js'
import { tokenMiddleware } from './middleware/token.middleware.js'
import { InfoResponse, InfoResponseType } from './models/InfoResponse.model.js'
import { StatusCode } from './models/StatusCode.model.js'
import { UserCollection } from './mongo/collections/User.collection.js'
import { initMongoAsync } from './mongo/index.js'
import { checkPasswordStrength, Unreliable } from './utils/passwordChecker.js'

function sendStatusCodeJson(res, statusCode, body) {
    res.status(statusCode).json({ statusCode, ...body })
}

/**
 * @param {express.Response} res
 * @param {InfoResponse} infoResponse
 */
function sendInfoResponse(res, infoResponse) {
    res.status(infoResponse.statusCode).json(infoResponse)
}

async function main() {
    const app = express()
    app.use(bodyParser.json())

    await initMongoAsync()

    app.post('/api/token', async (req, res) => {
        const { email, password } = req.body

        NullArgumentError.throw(email, 'email')
        NullArgumentError.throw(password, 'password')

        const userExists = await UserCollection.existsAsync({ email })

        if (!userExists)
            throw new UserNotFoundError({ email })

        const foundUser = await UserCollection.getFirstAsync({ email, password }) // TODO Add password verification

        if (!foundUser)
            throw new InvalidPasswordError()
        
        const token = { email }
        const accessToken = jsonwebtoken.sign(token, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION })
        const refreshToken = jsonwebtoken.sign(token, REFRESH_TOKEN_SECRET)

        return sendInfoResponse(res, new InfoResponse({
            content: { accessToken, refreshToken },
            statusCode: StatusCode.Ok,
        }))
    })

    app.get('/api/myProfile', tokenMiddleware, (_, res) => {
        const id = 'SomeRandomId'
        const username = 'random@address.com'
        res.json({ id, username })
    })

    app.post('/api/passwordReliability', async (req, res) => {
        const { password } = req.body

        NullArgumentError.throw(password, 'password')

        return sendInfoResponse(res, new InfoResponse({
            content: checkPasswordStrength(password),
            statusCode: StatusCode.Ok,
        }))
    })

    app.post('/api/signUp', async (req, res) => {
        const { email, password } = req.body

        NullArgumentError.throw(email, 'email')
        NullArgumentError.throw(password, 'password')

        const userExists = await UserCollection.existsAsync({ email })

        if (userExists)
            throw new EmailTakenError(email)

        const passwordReliability = checkPasswordStrength(password)

        if (passwordReliability.strength == Unreliable)
            throw new PasswordUnreliableError(passwordReliability)

        const user = await UserCollection.createAsync({ email, password })

        return sendStatusCodeJson(res, StatusCode.Created, new InfoResponse({
            content: user,
            details: passwordReliability,
            type: InfoResponseType.Warning,
        }))
    })

    app.get('/api/users', tokenMiddleware, async (req, res) => {
        return sendInfoResponse(res, new InfoResponse({
            content: await UserCollection.getWhereAsync({}),
            statusCode: StatusCode.Ok,
        }))
    })

    app.get('/api/users/:id', tokenMiddleware, async (req, res) => {
        const id = req.params.id

        NullArgumentError.throw(id, 'id')

        return sendInfoResponse(res, new InfoResponse({
            content: await UserCollection.getByIdAsync(id),
            statusCode: StatusCode.Ok,
        }))
    })

    // Error handler middleware must be right before the .listen method
    app.use(errorHandlerMiddleware)

    app.listen(PORT, () => {
        console.log(`Server listening in port ${PORT}`);
    })
}

main().catch(err => {
    console.log(`Unhandled error: ${err}`)
})
