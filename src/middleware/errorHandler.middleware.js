import express from 'express'
import { DomainError } from '../errors/Domain.error.js'
import { InfoResponse, InfoResponseType } from '../models/InfoResponse.model.js'
import { StatusCode } from '../models/StatusCode.model.js'

/**
 * @param {any} err
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
    console.log('Error intercepted!')
    console.log({ err })
    
    if (err instanceof DomainError) {
        res.status(err.statusCode).json(new InfoResponse({
            message: err.message,
            statusCode: err.statusCode,
            type: InfoResponseType.Error,
        }))
    }
    else {
        res.status(StatusCode.InternalServerError).json(new InfoResponse({
            message: 'An unhandled error occured',
            statusCode: StatusCode.InternalServerError,
            type: InfoResponseType.Error,
        }))
    }
}
