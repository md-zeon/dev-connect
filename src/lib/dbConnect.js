import clientPromise from "./mongodb";
import { ServerApiVersion } from "mongodb";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

export default async function dbConnect(collectionName) {
  // Wait for the client connection
  const client = await clientPromise;

  const db = client.db(process.env.DB_NAME);

  // Optionally apply the server API options if needed here

  // Return the collection you want
  return db.collection(collectionName);
}
