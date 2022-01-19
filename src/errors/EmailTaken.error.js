import { DomainError, StatusCode } from "viex.node.core"

export class EmailTakenError extends DomainError {

    /**
     * @param {String} email
     */
    constructor(email) {
        super(StatusCode.BadRequest, `The email ${email} is already taken`)
    }
}
