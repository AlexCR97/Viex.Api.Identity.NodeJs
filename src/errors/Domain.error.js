export class DomainError extends Error {

    /**
     * @type {Number}
     */
    statusCode

    /**
     * @type {any}
     */
    details

    /**
     * @param {Number} statusCode
     * @param {String} message
     * @param {any} details
     */
    constructor(statusCode, message, details) {
        super(message)
        this.statusCode = statusCode
        this.details = details
    }
}
