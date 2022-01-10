import { User } from "../../entities/User.entity.js"
import { BaseCollection } from "./Base.collection.js"

export const UserCollection = {
    ...BaseCollection(User),
}
