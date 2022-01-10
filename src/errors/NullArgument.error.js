import { StatusCode } from "../models/StatusCode.model.js"
import { DomainError } from "./Domain.error.js"

export class NullArgumentError extends DomainError {

    /**
     * @param {String} argumentName
     */
    constructor(argumentName) {
        super(StatusCode.BadRequest, `Argument ${argumentName} cannot be null or undefined`)
    }

    static throw(argumentValue, argumentName) {
        if (argumentValue == undefined || argumentValue == null)
            throw new NullArgumentError(argumentName)
    }
}
