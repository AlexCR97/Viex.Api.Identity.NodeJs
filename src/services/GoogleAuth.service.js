import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { readJsonAsync } from '../utils/files.utils.js'

/**
 * The path of the file that contains the credentials needed to authenticate with Google
 */
const GOOGLE_CREDENTIALS_PATH = 'google-credentials.json'

/**
 * The scopes that should be included in the Google JWT
 */
const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
]

/**
 * Get and store new token after prompting for user authorization.
 * @param {OAuth2Client} client The OAuth2 client to get token for.
 */
function getAccessTokenAsync(client) {
    return new Promise((resolve, reject) => {
        const authUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: GOOGLE_SCOPES,
        })

        console.log('Authenticate by visiting this url:', authUrl)

        const cli = createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        cli.question('Enter the code from the page here: ', (userInput) => {
            cli.close()

            client.getToken(userInput, (err, token) => {
                if (err)
                    return reject(err)

                const googleToken = JSON.parse(token)

                return writeFileAsync(GOOGLE_TOKEN_PATH, googleToken)
                    .then(() => resolve(googleToken))
                    .catch((err) => reject(err))
            });
        })
    })
}

/**
 * Gets Google credentials from a local file and returns the web portion of the response
 */
async function getGoogleWebCredentialsAsync() {
    const credentials = await readJsonAsync(GOOGLE_CREDENTIALS_PATH)
    return credentials.web
}

async function getGoogleClientAsync(googleWebCredentials) {
    const { client_id, client_secret, redirect_uris } = googleWebCredentials
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
}

/**
 * @param {OAuth2Client} client
 */
function getAccessTokenUrl(client) {
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: GOOGLE_SCOPES,
    })
}

export default {
    getAccessTokenUrl,
    getGoogleClientAsync,
    getGoogleWebCredentialsAsync,
}
