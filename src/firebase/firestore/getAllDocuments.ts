import firebase_app from "../config";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Get the Firestore instance
const db = getFirestore(firebase_app);

// Function to retrieve all documents from a Firestore collection
export default async function getAllDocuments(col: string) {
    // Create a reference to the collection
    const collectionRef = collection(db, col);
    // Variable to store the result of the operation
    let results = null;
    // Variable to store any error that occurs during the operation
    let error = null;

    try {
        // Retrieve all documents from the collection
        results = await getDocs(collectionRef);
    } catch (e) {
        // Catch and store any error that occurs during the operation
        error = e;
    }

    // Return the result and error as an object
    return { results, error };
}
