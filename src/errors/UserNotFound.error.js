import { DomainError, StatusCode } from "viex.node.core";

export class UserNotFoundError extends DomainError {
    constructor({ id, email }) {
        super(StatusCode.NotFound)

        if (id)
            this.message = `Could not find User with id ${id}`
        else if (email)
            this.message = `Could not find User with email ${email}`
    }
}