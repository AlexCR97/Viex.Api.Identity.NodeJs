import { StatusCode } from "../models/StatusCode.model.js";
import { DomainError } from "./Domain.error.js";

export class InvalidRefreshTokenError extends DomainError {
    constructor() {
        super(StatusCode.Forbidden, 'Your refresh token is invalid')
    }
}
