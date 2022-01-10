import { StatusCode } from "../models/StatusCode.model.js";
import { DomainError } from "./Domain.error.js";

export class InvalidPasswordError extends DomainError {
    constructor() {
        super(StatusCode.BadRequest, 'The password was incorrect')
    }
}