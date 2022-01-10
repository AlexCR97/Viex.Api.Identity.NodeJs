import mongoose from "mongoose"
import { User } from "../../entities/User.entity.js"

export const UserCollection = {

    async createAsync({ email, password }) {
        const user = new User({ dateCreated: new Date(), email, password })
        await user.save()
        return user
    },

    /**
     * @param {mongoose.FilterQuery} filter 
     */
     async existsAsync(filter) {
        const found = await User.find(filter)
        return found != undefined && found != null && found.length > 0
    },

    /**
     * @param {String} id
     */
    async getByIdAsync(id) {
        return User.findById(id)
    },

    /**
     * @param {mongoose.FilterQuery} filter 
     */
    async getFirstAsync(filter) {
        const found = await User.find(filter)
        return found[0]
    },
    
    /**
     * @param {mongoose.FilterQuery} filter 
     */
    async getWhereAsync(filter) {
        return User.find(filter)
    },
}
