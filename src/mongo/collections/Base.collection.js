import mongoose from "mongoose"

/**
 * @param {mongoose.Model} model
 * @returns 
 */
export const BaseCollection = (model) => ({

    async createAsync(document) {
        const createdDocument = new model(document)
        createdDocument.dateCreated = new Date()
        await createdDocument.save()
        return createdDocument
    },

    /**
     * @param {mongoose.FilterQuery} filter 
     */
    async existsAsync(filter) {
        const found = await model.find(filter)
        return found != undefined && found != null && found.length > 0
    },

    /**
     * @param {String} id
     */
    async getByIdAsync(id) {
        return model.findById(id)
    },

    /**
     * @param {mongoose.FilterQuery} filter 
     */
    async getFirstAsync(filter) {
        const found = await model.find(filter)
        return found[0]
    },

    /**
     * @param {mongoose.FilterQuery} filter 
     */
    async getWhereAsync(filter) {
        return model.find(filter)
    },
})
