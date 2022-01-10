export class InfoResponseConstructor {

    /**
     * @type {Number}
     */
     statusCode
    
    /**
     * @type {String}
     */
    message

    /**
     * Either Information, Warning or Error
     * @type {String}
     */
    type

    /**
     * The main content for this response
     * @type {any}
     */
    content
 
    /**
     * Details about this response
     * @type {any}
     */
    details
}

export class InfoResponse {

    /**
     * @type {Number}
     */
    statusCode

    /**
     * @type {String}
     */
    message

    /**
     * Either Information, Warning or Error
     * @type {String}
     */
    type

    /**
     * The main content for this response
     * @type {any}
     */
    content

    /**
     * Details about this response
     * @type {any}
     */
    details

    /**
     * @param {InfoResponseConstructor} options
     */
    constructor(options) {
        if (!options)
            return
        
        this.content = options.content
        this.details = options.details
        this.message = options.message
        this.statusCode = options.statusCode
        this.type = options.type
    }
}

export const InfoResponseType = {
    Information: 'Information',
    Warning: 'Warning',
    Error: 'Error',
}
