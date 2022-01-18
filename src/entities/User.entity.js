import mongoose from "mongoose"
import { BaseSchemaProperties } from "./Base.entity.js"
import { RefreshTokenSchema } from "./RefreshToken.entity.js"

export const UserSchema = new mongoose.Schema({
    ...BaseSchemaProperties,
    email: String,
    password: String,
    refreshTokens: [RefreshTokenSchema],
})

export const User = mongoose.model('user', UserSchema)
