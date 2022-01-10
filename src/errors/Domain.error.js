export class DomainError extends Error {

    /**
     * @type {Number}
     */
    statusCode

    /**
     * @param {Number} statusCode
     * @param {String} message
     */
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
    }
}