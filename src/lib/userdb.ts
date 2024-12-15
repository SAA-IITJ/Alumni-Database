// lib/mongo.ts
import { MongoClient, MongoClientOptions, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string; // Ensure the environment variable is defined
const options: MongoClientOptions = {};

// A variable to hold the singleton client instance
let client: MongoClient | null = null;
let db: Db | null = null;

export const userdb = async (): Promise<Db> => {
  if (!uri) {
    throw new Error("Please add your MongoDB URI to .env.local");
  }

  if (!client) {
    client = new MongoClient(uri, options); // Create the MongoClient instance
    await client.connect(); // Establish the connection
    db = client.db("database_app"); // Connect to the 'database_app' database
  }

  return db as Db;
};
