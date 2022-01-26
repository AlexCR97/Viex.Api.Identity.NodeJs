import express from "express";
import { InfoResponse, NullArgumentError, sendInfoResponse, StatusCode } from "viex.node.core";
import { GoogleAuthService } from "../services/index.js";

/**
 * @param {express.Express} app
 */
export default function (app) {

    app.get('/api/google/authUrl', async (req, res) => {
        const creds = await GoogleAuthService.getGoogleWebCredentialsAsync()
        const client = await GoogleAuthService.getGoogleClientAsync(creds)
        const url = GoogleAuthService.getAccessTokenUrl(client)
        return sendInfoResponse(res, new InfoResponse({
            content: url,
            statusCode: StatusCode.Ok,
        }))
    })

    app.post('/api/google/token', async (req, res) => {
        const { code } = req.body

        NullArgumentError.throw(code, 'code')

        const creds = await GoogleAuthService.getGoogleWebCredentialsAsync()
        const client = await GoogleAuthService.getGoogleClientAsync(creds)
        const decodedCode = decodeURIComponent(code)

        try {
            const response = await client.getToken(decodedCode)

            return sendInfoResponse(res, new InfoResponse({
                content: response.tokens,
                statusCode: StatusCode.Ok,
            }))
        }
        catch (err) {
            const errorContent = err.response != undefined && err.response != null
                ? err.response.data
                : undefined

            return sendInfoResponse(res, new InfoResponse({
                content: errorContent,
                message: err.message,
                statusCode: err.code || StatusCode.InternalServerError,
            }))
        }
    })
}
