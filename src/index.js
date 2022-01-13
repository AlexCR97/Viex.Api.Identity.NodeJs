import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import 'express-async-errors'
import jsonwebtoken from 'jsonwebtoken'
import { ACCESS_TOKEN_EXPIRATION, ACCESS_TOKEN_SECRET, PORT, REFRESH_TOKEN_SECRET, SALT_GENERATION_ROUNDS } from './environment.js'
import { EmailTakenError } from './errors/EmailTaken.error.js'
import { InvalidPasswordError } from './errors/InvalidPassword.error.js'
import { InvalidRefreshTokenError } from './errors/InvalidRefreshToken.error.js'
import { NullArgumentError } from './errors/NullArgument.error.js'
import { PasswordUnreliableError } from './errors/PasswordUnreliable.error.js'
import { UserNotFoundError } from './errors/UserNotFound.error.js'
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware.js'
import { tokenMiddleware } from './middleware/token.middleware.js'
import { InfoResponse, InfoResponseType } from './models/InfoResponse.model.js'
import { StatusCode } from './models/StatusCode.model.js'
import { RefreshTokenCollection } from './mongo/collections/RefreshToken.collection.js'
import { UserCollection } from './mongo/collections/User.collection.js'
import { initMongoAsync } from './mongo/index.js'
import { getAccessToken, sendInfoResponse } from './utils/api.utils.js'
import { checkPasswordStrength, Unreliable } from './utils/passwordChecker.js'

async function main() {
    const app = express()

    app.use(bodyParser.json())

    /* #region CORS */

    const whitelist = [
        'http://localhost:8080',
        'http://localhost:8180',
        'https://vx-app-management.herokuapp.com',
    ]

    app.use(cors())

    // app.use(cors({
    //     origin: function(origin, callback) {
    //         if (whitelist.indexOf(origin) !== -1) {
    //             callback(null, true)
    //         } else {
    //             callback(new Error('Not allowed by CORS'))
    //         }
    //     },
    // }))

    /* #endregion */

    await initMongoAsync()

    app.get('/', (req, res) => {
        res.send('<h1>Identity Server Home Page</h1>')
    })

    app.get('/api', (req, res) => {
        res.send('<h1>Identity Server API</h1>')
    })

    /* #region Token */

    app.post('/api/token', async (req, res) => {
        const { email, password } = req.body

        NullArgumentError.throw(email, 'email')
        NullArgumentError.throw(password, 'password')

        const userExists = await UserCollection.existsAsync({ email })

        if (!userExists)
            throw new UserNotFoundError({ email })

        const foundUser = await UserCollection.getFirstAsync({ email })
        const isPasswordValid = await bcrypt.compare(password, foundUser.password)

        if (!isPasswordValid)
            throw new InvalidPasswordError()

        const token = { email }
        const accessToken = jsonwebtoken.sign(token, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION })
        const refreshToken = jsonwebtoken.sign(token, REFRESH_TOKEN_SECRET)

        await RefreshTokenCollection.createAsync({ token: refreshToken })

        return sendInfoResponse(res, new InfoResponse({
            content: { accessToken, refreshToken },
            statusCode: StatusCode.Ok,
        }))
    })

    app.post('/api/refreshToken', async (req, res) => {
        const { refreshToken } = req.body

        NullArgumentError.throw(refreshToken, 'refreshToken')

        const refreshTokenDocument = await RefreshTokenCollection.getFirstAsync({ token: refreshToken })

        if (!refreshTokenDocument)
            throw new InvalidRefreshTokenError()

        jsonwebtoken.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
            if (err || !user)
                throw new InvalidRefreshTokenError()

            const token = { email: user.email }
            const accessToken = jsonwebtoken.sign(token, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION })

            sendInfoResponse(res, new InfoResponse({
                content: { accessToken },
                statusCode: StatusCode.Ok,
            }))
        })
    })

    app.post('/api/logout', async (req, res) => {
        const { refreshToken } = req.body

        NullArgumentError.throw(refreshToken, 'refreshToken')

        await RefreshTokenCollection.deleteWhereAsync({ token: refreshToken })

        return sendInfoResponse(res, new InfoResponse({
            statusCode: StatusCode.Ok,
        }))
    })

    /* #endregion */

    /* #region User */

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

        const hashedPassword = await bcrypt.hash(password, SALT_GENERATION_ROUNDS)
        const user = await UserCollection.createAsync({ email, password: hashedPassword })

        return sendInfoResponse(res, new InfoResponse({
            content: user,
            details: passwordReliability,
            statusCode: StatusCode.Created,
            type: InfoResponseType.Warning,
        }))
    })

    app.get('/api/myProfile', tokenMiddleware, (req, res) => {
        const accessToken = getAccessToken(req)
        const token = jsonwebtoken.decode(accessToken)
        return sendInfoResponse(res, new InfoResponse({
            content: token,
            statusCode: StatusCode.Ok,
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

    /* #endregion */

    /* #region Others */

    app.post('/api/passwordReliability', async (req, res) => {
        const { password } = req.body

        NullArgumentError.throw(password, 'password')

        return sendInfoResponse(res, new InfoResponse({
            content: checkPasswordStrength(password),
            statusCode: StatusCode.Ok,
        }))
    })

    /* #endregion */

    // Error handler middleware must be right before the .listen method
    app.use(errorHandlerMiddleware)

    const port = process.env.PORT || PORT

    app.listen(port, () => {
        console.log(`Server listening in port ${port}`);
    })
}

main().catch(err => {
    console.log(`Unhandled error: ${err}`)
})
