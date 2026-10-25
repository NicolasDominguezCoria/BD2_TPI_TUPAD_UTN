import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const url = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
let client;
let database;

export async function connectDatabase() {
    if (!url || !dbName) {
        throw new Error("Faltan MONGODB_URI y/o DB_NAME en el archivo .env");
    }

    if (!database) {
        client = new MongoClient(url);
        await client.connect();
        database = client.db(dbName);
    }

    return { client, db: database };
}

export async function closeDatabase() {
    if (client) {
        await client.close();
        client = undefined;
        database = undefined;
    }
}