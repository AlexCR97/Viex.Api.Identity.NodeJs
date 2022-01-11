import express from'express'
import { NullArgumentError } from '../errors/NullArgument.error.js'
import { InfoResponse } from '../models/InfoResponse.model.js'

/**
 * @param {express.Response} res
 * @param {InfoResponse} infoResponse
 */
export function sendInfoResponse(res, infoResponse) {
    NullArgumentError.throw(res, 'res')
    NullArgumentError.throw(infoResponse, 'infoResponse')
    NullArgumentError.throw(infoResponse.statusCode, 'infoResponse.statusCode')
    res.status(infoResponse.statusCode).json(infoResponse)
}

/**
 * @param {express.Request} req
 */
export function getAccessToken(req) {
    NullArgumentError.throw(req, 'req')

    const authHeader = req.headers['authorization']

    if (!authHeader)
        return undefined

    return authHeader.split(' ')[1] // "Bearer <accessToken>"
}
