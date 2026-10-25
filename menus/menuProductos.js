import {crearProducto, obtenerProductos, actualizarProducto, eliminarProducto } from "../repositories/productoRepository.js";
import {preguntar } from "../utils/preguntar.js";
import { esNumeroNoNegativo } from "../utils/validators.js";

// ======== SUB MENU para gestion de PRODUCTOS ========
export async function menuProductos(db) {
    let opcion = "";

    while (opcion !== "0") {
        console.log("\n   ====== GESTIÓN DE PRODUCTOS ======");
        console.log("   1. Crear producto");
        console.log("   2. Listar productos");
        console.log("   3. Actualizar producto");
        console.log("   4. Eliminar producto");
        console.log("   0. Volver al menú principal");
        console.log("   ==================================");

        opcion = await preguntar("      Seleccione una opción: ")

        try{
            switch (opcion) {
                    case "1": {
                        console.log("\nCREAR NUEVO PRODUCTO")
                        const nombre = await preguntar("Nombre: ");
                        const precio = Number(await preguntar("Precio: "));
                        const descripcion = await preguntar("Descripción: ");
                        const stock = Number(await preguntar("Stock: "));
                        const imagen = await preguntar("Nombre o ruta de la imagen: ");

                        const disponible = stock > 0;

                        if (!esNumeroNoNegativo(precio) || !esNumeroNoNegativo(stock)) {
                            console.log("El precio y el stock deben ser números no negativos.");
                            break;
                        }

                        const categoriasTexto = await preguntar(
                            "IDs de categorías separados por coma: "
                        );

                        const idsCategorias = categoriasTexto
                            .split(",")
                            .map(id => id.trim())
                            .filter(id => id !== "");

                        await crearProducto(
                            db,
                            nombre,
                            precio,
                            descripcion,
                            stock,
                            imagen,
                            disponible,
                            idsCategorias
                        );
                        break;
                    }

                    case "2":
                        await obtenerProductos(db);
                        break;

                    case "3": {
                        console.log("\nACTUALIZAR UN PRODUCTO")
                        const id = await preguntar("ID del producto: ");
                        const nuevoNombre = await preguntar("Nuevo nombre: ");
                        const nuevoPrecio = Number(await preguntar("Nuevo precio: "));
                        const nuevaDescripcion = await preguntar("Nueva descripción: ");
                        const nuevoStock = Number(await preguntar("Nuevo stock: "));
                        const nuevaImagen = await preguntar("Nombre o ruta de la nueva imagen: ");

                        const nuevoDisponible = nuevoStock > 0;

                        if (!esNumeroNoNegativo(nuevoPrecio) || !esNumeroNoNegativo(nuevoStock)) {
                            console.log("El precio y el stock deben ser números no negativos.");
                            break;
                        }

                        const categoriasTexto = await preguntar(
                            "Nuevos IDs de categorías separados por coma: "
                        );

                        const nuevoIdsCategorias = categoriasTexto
                            .split(",")
                            .map(id => id.trim())
                            .filter(id => id !== "");

                        await actualizarProducto(
                            db,
                            id,
                            nuevoNombre,
                            nuevoPrecio,
                            nuevaDescripcion,
                            nuevoStock,
                            nuevaImagen,
                            nuevoDisponible,
                            nuevoIdsCategorias
                        );
                        break;
                    }

                    case "4": {
                        console.log("\nELIMINAR UN PRODUCTO")
                        const id = await preguntar(
                            "ID del producto que desea eliminar: "
                        );
                        await eliminarProducto(db, id);
                        break;
                    }

                    case "0":
                        console.log("Volviendo al menú principal...");
                        break;

                    default:
                        console.log("Opción inválida. Intente nuevamente.");
                }
        } catch (error) {
            console.error("No se pudo completar la operación.", error);
        }
    }
};