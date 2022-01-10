import express from 'express'

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export const tokenMiddleware = (req, res, next) => {
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
