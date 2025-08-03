import clientPromise from "./mongodb";

// Centralized collection names
export const collectionNamesObj = {
	users: "users",
	projects: "projects",
	applications: "applications",
};

/**
 * Connect to the database and return the requested collection
 * @param {string} collectionName - One of the values from collectionNamesObj
 */
export default async function dbConnect(collectionName) {
	const client = await clientPromise;
	const db = client.db(process.env.DB_NAME);

	return db.collection(collectionName);
}
