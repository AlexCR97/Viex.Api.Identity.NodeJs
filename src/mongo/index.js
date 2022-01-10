import express from 'express'
import mongoose from 'mongoose'
import { MONGO_DATABASE, MONGO_PASSWORD, MONGO_USER } from '../environment.js'

/**
 * 
 * @param {express.Express} app
 */
export async function initMongoAsync() {
    console.log('Connecting to mongo...')

    const connectionStringTemplate = 'mongodb+srv://<user>:<password>@maincluster.gwcad.mongodb.net/<databaseName>?retryWrites=true&w=majority'

    const connectionString = connectionStringTemplate
        .replace('<user>', MONGO_USER)
        .replace('<password>', MONGO_PASSWORD)
        .replace('<databaseName>', MONGO_DATABASE)

    await mongoose.connect(connectionString)

    console.log('Connection to mongo established correctly.')
}
