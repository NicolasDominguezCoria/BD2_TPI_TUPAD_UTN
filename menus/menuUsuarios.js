import {crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from "../repositories/usuarioRepository.js";
import {preguntar } from "../utils/preguntar.js";

// ======== SUB MENU para gestion de USUARIOS ========
export async function menuUsuarios(db) {
    let opcion = "";

    while (opcion !== "0") {
        console.log("\n   ====== GESTIÓN DE USUARIOS ======");
        console.log("   1. Crear usuario");
        console.log("   2. Listar usuarios");
        console.log("   3. Actualizar usuario");
        console.log("   4. Eliminar usuario");
        console.log("   0. Volver al menú principal");
        console.log("   =================================");

        opcion = await preguntar("      Seleccione una opción: ");

        try {
            switch (opcion) {
                case "1": {
                    console.log("\nCREAR NUEVO USUARIO");

                    const nombreCompleto = await preguntar("Nombre completo: ");
                    const email = await preguntar("Email: ");
                    const telefono = await preguntar("Teléfono: ");
                    const direccion = await preguntar("Dirección: ");
                    const rol = await preguntar("Rol (cliente/administrador): ");

                    await crearUsuario(
                        db,
                        nombreCompleto,
                        email,
                        telefono,
                        direccion,
                        rol
                    );
                    break;
                }

                case "2":
                    await obtenerUsuarios(db);
                    break;

                case "3": {
                    console.log("\nACTUALIZAR USUARIO");

                    const id = await preguntar("ID del usuario: ");
                    const nuevoNombreCompleto = await preguntar("Nuevo nombre completo: ");
                    const nuevoEmail = await preguntar("Nuevo email: ");
                    const nuevoTelefono = await preguntar("Nuevo teléfono: ");
                    const nuevaDireccion = await preguntar("Nueva dirección: ");
                    const nuevoRol = await preguntar("Nuevo rol (cliente/administrador): ");

                    await actualizarUsuario(
                        db,
                        id,
                        nuevoNombreCompleto,
                        nuevoEmail,
                        nuevoTelefono,
                        nuevaDireccion,
                        nuevoRol
                    );
                    break;
                }

                case "4": {
                    console.log("\nELIMINAR USUARIO");

                    const id = await preguntar("ID del usuario que desea eliminar: ");

                    await eliminarUsuario(db, id);
                    break;
                }

                case "0":
                    console.log("Volviendo al menú principal...");
                    break;

                default:
                    console.log("Opción inválida. Intente nuevamente.");
            }
        } catch (error) {
            console.error("No se pudo completar la operación:", error);
        }
    }
};