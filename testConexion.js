import { connectDatabase, closeDatabase } from "./config/database.js";

try {
    const { db } = await connectDatabase();
    await db.command({ ping: 1 });
    console.log(`Conexión exitosa a ${db.databaseName}`);
} catch (error) {
    console.error("No se pudo conectar a MongoDB:", error.message);
    process.exitCode = 1;
} finally {
    await closeDatabase();
}