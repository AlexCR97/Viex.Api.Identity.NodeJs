import mongoose from "mongoose";
import { BaseSchemaProperties } from "./Base.entity.js";

export const RefreshTokenSchema = new mongoose.Schema({
    ...BaseSchemaProperties,
    token: String,
})

export const RefreshToken = mongoose.model('refresh-token', RefreshTokenSchema)
