import bodyParser from 'body-parser'
import express from 'express'
import jsonwebtoken from 'jsonwebtoken'
import mongoose from 'mongoose'
import { User } from './entities/User.js'
import { InfoResponse, InfoResponseType } from './models/HttpResponse.js'
import { checkPasswordStrength, Unreliable } from './utils/passwordChecker.js'

/* #region Configuration */

const PORT = 3030
const ACCESS_TOKEN_EXPIRATION = '15sec'
const ACCESS_TOKEN_SECRET = '7b45876373bb62d5d2563aaab829de00'
const REFRESH_TOKEN_SECRET = 'd593ac80cbb1de1fed0c5c4b50e5790d'
const MONGO_USER = 'sysadmin'
const MONGO_PASSWORD = 'ErOTeggV9EZ84N6D'
const MONGO_DATABASE = 'identity'

/* #endregion */

/* #region CONSTANTS */

const StatusCodes = {
    // Successful
    Created: 201,

    // Client side errors
    BadRequest: 400,
}

/* #endregion */
/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const tokenMiddleware = (req, res, next) => {
    next()
    return

    const authHeader = req.headers['authorization']

    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header was not found' })
        return
    }
    
    const accessToken = authHeader.split(' ')[1] // "Bearer <accessToken>"
    
    if (!accessToken) {
        res.status(401).json({ message: 'Could not find access token in authorization header' })
        return
    }

    jsonwebtoken.verify(accessToken, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ message: 'Your token is invalid' })
            return
        }

        req.user = user
        next()
    })
}

/**
 * 
 * @param {express.Express} app
 */
async function initMongoAsync() {
    console.log('Connecting to mongo...')

    const connectionStringTemplate = 'mongodb+srv://<user>:<password>@maincluster.gwcad.mongodb.net/<databaseName>?retryWrites=true&w=majority'

    const connectionString = connectionStringTemplate
        .replace('<user>', MONGO_USER)
        .replace('<password>', MONGO_PASSWORD)
        .replace('<databaseName>', MONGO_DATABASE)

    await mongoose.connect(connectionString)

    console.log('Connection to mongo established correctly.')
}

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

        const userByEmail = await User.find({ email })

        if (userByEmail.length > 0)
            return sendStatusCodeMessage(res, StatusCodes.BadRequest, `The email ${email} is already taken`)
        
        const passwordReliability = checkPasswordStrength(password)

        if (passwordReliability.strength == Unreliable)
            return sendStatusCodeJson(res, StatusCodes.BadRequest, passwordReliability)

        const user = new User({ dateCreated: new Date(), email, password })

        console.log('user:', user)

        await user.save()

        console.log('User saved!', user)

        return sendStatusCodeJson(res, StatusCodes.Created, new InfoResponse({
            content: user,
            details: passwordReliability,
            type: InfoResponseType.Warning,
        }))
    })

    app.get('/api/users', async (req, res) => {
        const users = await User.find()
        res.json(users)
    })

    app.get('/api/users/:id', async (req, res) => {
        const _id = req.params.id

        try {
            const user = await User.find({ _id })
            res.json(user)
        } catch (err) {
            res.status(500).json(err)
        }
    })

    app.listen(PORT, () => {
        console.log(`Server listening in port ${PORT}`);
    })
}

main().catch(err => {
    console.log(`Unhandled error: ${err}`)
})
