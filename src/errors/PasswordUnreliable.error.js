import { DomainError, StatusCode } from "viex.node.core";

export class PasswordUnreliableError extends DomainError {
    constructor(passwordReliability) {
        super(StatusCode.BadRequest, 'Your password is not strong enough', passwordReliability)
    }
}
