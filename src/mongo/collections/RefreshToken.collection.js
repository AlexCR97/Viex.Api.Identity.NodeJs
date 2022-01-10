import { RefreshToken } from "../../entities/RefreshToken.entity.js";
import { BaseCollection } from "./Base.collection.js";

export const RefreshTokenCollection = {
    ...BaseCollection(RefreshToken),
}
