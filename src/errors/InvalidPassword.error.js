import { DomainError, StatusCode } from "viex.node.core";

export class InvalidPasswordError extends DomainError {
    constructor() {
        super(StatusCode.BadRequest, 'The password was incorrect')
    }
}