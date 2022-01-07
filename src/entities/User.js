import mongoose from "mongoose"
import { BaseSchemaProperties } from "./Base.js"

export const UserSchema = new mongoose.Schema({
    ...BaseSchemaProperties,
    email: String,
    password: String,
})

export const User = mongoose.model('user', UserSchema)
