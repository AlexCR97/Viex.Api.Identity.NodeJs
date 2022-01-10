import bodyParser from 'body-parser'
import express from 'express'
import 'express-async-errors'
import jsonwebtoken from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET, PORT, REFRESH_TOKEN_SECRET } from './environment.js'
import { NullArgumentError } from './errors/NullArgument.error.js'
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware.js'
import { tokenMiddleware } from './middleware/token.middleware.js'
import { InfoResponse, InfoResponseType } from './models/InfoResponse.model.js'
import { StatusCode } from './models/StatusCode.model.js'
import { UserCollection } from './mongo/collections/User.collection.js'
import { initMongoAsync } from './mongo/index.js'
import { checkPasswordStrength, Unreliable } from './utils/passwordChecker.js'

/**
 * @param {express.Response} res
 * @param {Number} statusCode
 * @param {Error} message
 */
function sendStatusCodeMessage(res, statusCode, message) {
    res.status(statusCode).json({ statusCode, message })
}

function sendStatusCodeJson(res, statusCode, body) {
    res.status(statusCode).json({ statusCode, ...body })
}

async function main() {
    const app = express()
    app.use(bodyParser.json())

    await initMongoAsync()

    app.post('/api/token', (_, res) => {
        const token = { email: 'random@address.com' }
        const accessToken = jsonwebtoken.sign(token, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION })
        const refreshToken = jsonwebtoken.sign(token, REFRESH_TOKEN_SECRET)
        res.json({ accessToken, refreshToken })
    })

    app.get('/api/myProfile', tokenMiddleware, (_, res) => {
        const id = 'SomeRandomId'
        const username = 'random@address.com'
        res.json({ id, username })
    })

    app.post('/api/passwordReliability', async (req, res) => {
        const { password } = req.body
        const reliability = checkPasswordStrength(password)
        res.json(reliability)
    })

    app.post('/api/signUp', async (req, res) => {
        const { email, password } = req.body

        NullArgumentError.throw(email, 'email')
        NullArgumentError.throw(password, 'password')

        const userByEmail = await UserCollection.getFirstAsync({ email })

        if (!userByEmail)
            return sendStatusCodeMessage(res, StatusCode.BadRequest, `The email ${email} is already taken`)

        const passwordReliability = checkPasswordStrength(password)

        if (passwordReliability.strength == Unreliable)
            return sendStatusCodeJson(res, StatusCode.BadRequest, passwordReliability)

        const user = await UserCollection.createAsync({ email, password })

        return sendStatusCodeJson(res, StatusCode.Created, new InfoResponse({
            content: user,
            details: passwordReliability,
            type: InfoResponseType.Warning,
        }))
    })

    app.get('/api/users', tokenMiddleware, async (req, res) => {
        const users = await UserCollection.getWhereAsync({})
        res.json(users)
    })

    app.get('/api/users/:id', tokenMiddleware, async (req, res) => {
        const _id = req.params.id

        try {
            // const user = await User.find({ _id })
            const user = await UserCollection.getByIdAsync(_id)
            res.json(user)
        } catch (err) {
            res.status(500).json(err)
        }
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
