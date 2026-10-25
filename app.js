import {menuPrincipal } from "./menus/menuPrincipal.js";
import { connectDatabase, closeDatabase } from "./config/database.js";
import { cerrarPreguntas } from "./utils/preguntar.js";

//=============================================================================================================================
//   MAIN ejecución del programa
//=============================================================================================================================

async function main() {
        const { client, db } = await connectDatabase();
        console.log("Conexión exitosa al servidor MongoDB");
        
        console.log(`Base de datos seleccionada: ${db.databaseName}`);

        // Colecciones que utiliza la BD 
        const colecciones = [
            "categorias",
            "productos",
            "usuarios",
            "pedidos"
        ];

        //comprobación de la existencia de las colecciones
        const existentes = await db
            .listCollections({}, { nameOnly: true })
            .toArray();

        const nombresExistentes = existentes.map(
            coleccion => coleccion.name
        );

        for (const nombre of colecciones) {
            if (!nombresExistentes.includes(nombre)) {
                await db.createCollection(nombre);
                console.log(`Colección creada: ${nombre}`);
            } else {
                console.log(`La colección ya existe: ${nombre}`);
                
            }
        }
        console.log("Configuración inicial completada.")

        // ==========
        //EJECUCION DEL MENU INICIAL

        console.log("\n ======== BIENVENIDO AL SISTEMA DE GESTION DE FOOD STORE ========")
        await menuPrincipal(db);
        
};

// EJECUCION DEL PROGRAMA
try {
     await main();
} catch (error) {
    console.error("   Error en la aplicación:", error);
} finally {
    await closeDatabase();
    cerrarPreguntas();
    console.log("   Conexión con la base de datos cerrada. Hasta la próxima!");
};
