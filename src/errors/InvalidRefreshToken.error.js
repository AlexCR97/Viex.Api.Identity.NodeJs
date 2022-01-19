import { DomainError, StatusCode } from "viex.node.core";

export class InvalidRefreshTokenError extends DomainError {
    constructor() {
        super(StatusCode.Forbidden, 'Your refresh token is invalid')
    }
}
