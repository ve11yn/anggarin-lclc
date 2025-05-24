import { doc, getDoc } from "firebase/firestore";
import { db } from "../main";


export interface UserDetails {
    uid: string;
    name: string;
    email: string;
    position?: string;
    joinDate?: string;
}

export const getUserDetails = async (userId: string): Promise<UserDetails> => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
        return {
            uid: userId,
            name: userDoc.data().name || "Unknown User",
            email: userDoc.data().email,
            position: userDoc.data().position,
            joinDate: userDoc.data().createdAt
        };
    }
    return {
        uid: userId,
        name: "Deleted User",
        email: "N/A",
        position: "Unknown",
        joinDate: "N/A"
    };
};