import { StatusCode } from "../models/StatusCode.model.js";
import { DomainError } from "./Domain.error.js";

export class PasswordUnreliableError extends DomainError {
    constructor(passwordReliability) {
        super(StatusCode.BadRequest, 'Your password is not strong enough', passwordReliability)
    }
}
