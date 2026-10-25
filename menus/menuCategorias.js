import {crearCategoria, obtenerCategorias, actualizarCategoria, eliminarCategoria } from "../repositories/categoriaRepository.js";
import {preguntar } from "../utils/preguntar.js";

// ======== SUB MENU para gestion de CATEGORIAS ========
export async function menuCategorias(db) {
    let opcion = "";

    while( opcion !== "0") {
        console.log("\n   ====== GESTIÓN DE CATEGORÍAS ======");
        console.log("   1. Crear categoría");
        console.log("   2. Listar categorías");
        console.log("   3. Actualizar categoría");
        console.log("   4. Eliminar categoría");
        console.log("   0. Volver al menú principal");
        console.log("   ==================================");

        opcion = await preguntar("      Seleccione una opción: ");

        try {
            switch (opcion) {
                case "1": {
                    console.log("\nCREAR NUEVA CATEGORIA")
                    const nombre = await preguntar("Nombre: ");
                    const descripcion = await preguntar("Descripción: ")

                    await crearCategoria(db, nombre, descripcion);
                    break;
                }
                case "2": {
                    await obtenerCategorias(db);
                    break;
                }
                case "3": {
                    console.log("\nACTUALIZAR CATEGORIA")
                    const id = await preguntar("ID de la categoría: ");
                    const nuevoNombre = await preguntar("Nuevo Nombre: ");
                    const nuevaDescripcion = await preguntar("Nueva descripción: ");

                    await actualizarCategoria(db,id,nuevoNombre,nuevaDescripcion);
                    break;
                }
                case "4": {
                    console.log("\nELIMINAR UNA CATEGORIA")
                    const id = await preguntar("ID de la categoria a eliminar: ");

                    await eliminarCategoria(db,id);
                    break;
                }
                case "0":
                    console.log("Volviendo al menú principal...");
                    break;

                default:
                    console.log("Opción inválida. Intente nuevamente.");

            }
        } catch (error) {
            console.log("No se pudo completar la operación: ", error);
        }
    }
};