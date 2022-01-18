import mongoose from "mongoose";
import { BaseSchemaProperties } from "./Base.entity.js";

export const RefreshTokenSchema = new mongoose.Schema({
    ...BaseSchemaProperties,
    token: String,
    lastUsed: Date,
})

export const RefreshToken = mongoose.model('refresh-token', RefreshTokenSchema)
