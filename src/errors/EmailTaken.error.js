import { StatusCode } from "../models/StatusCode.model.js"
import { DomainError } from "./Domain.error.js"

export class EmailTakenError extends DomainError {

    /**
     * @param {String} email
     */
    constructor(email) {
        super(StatusCode.BadRequest, `The email ${email} is already taken`)
    }
}
