import { StatusCode } from "../models/StatusCode.model.js";
import { DomainError } from "./Domain.error.js";

export class UserNotFoundError extends DomainError {
    constructor({ id, email }) {
        super(StatusCode.NotFound)

        if (id)
            this.message = `Could not find User with id ${id}`
        else if (email)
            this.message = `Could not find User with email ${email}`
    }
}