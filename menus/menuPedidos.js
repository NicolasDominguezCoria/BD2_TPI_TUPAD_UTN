import {crearPedido, obtenerPedidos, actualizarEstadoPedido, eliminarPedido } from "../repositories/pedidoRepository.js";
import {preguntar } from "../utils/preguntar.js";
import { esEnteroPositivo } from "../utils/validators.js";

// ======== SUB MENU para gestion de PEDIDOS ========
export async function menuPedidos(db) {
    let opcion = "";

    while (opcion !== "0") {
        console.log("\n   ====== GESTIÓN DE PEDIDOS ======");
        console.log("   1. Crear pedido");
        console.log("   2. Listar pedidos");
        console.log("   3. Actualizar estado pedido");
        console.log("   4. Eliminar pedido");
        console.log("   0. Volver al menú principal");
        console.log("   =================================");

        opcion = await preguntar("      Seleccione una opción: ");

        try{
            switch (opcion) {
                case "1": {
                    console.log("\nCREAR NUEVO PEDIDO");
                    const usuarioId = await preguntar("ID del usuario: ");

                    const itemsPedido = [];
                    let agregarOtro = "s";

                    while (agregarOtro.toLowerCase() === "s") {
                        console.log("\n  AGREGAR PRODUCTO AL PEDIDO:");

                        const productoId = await preguntar("ID del producto: ");
                        const cantidadTexto = await preguntar("Cantidad: ");
                        const cantidad = Number(cantidadTexto);

                        if(!esEnteroPositivo(cantidad)) {
                            console.log("La cantidad debe ser un numero entero mayor que cero.")
                            continue;
                        }

                        itemsPedido.push({productoId, cantidad});

                        agregarOtro = await preguntar( "Desea agregar otro producto? (s/n)");
                    }

                    if (itemsPedido.length === 0) {
                        console.log("No se puede crear un pedido sin productos.");
                        break;
                    }

                    await crearPedido(db, usuarioId,itemsPedido);
                    break;
                }
                case "2": {
                    await obtenerPedidos(db);
                    break;
                }
                case "3": {
                    console.log("\nACTUALIZAR ESTADO DE UN PEDIDO");
                    const id = await preguntar("ID del pedido: ");

                    console.log("\nSeleccione el nuevo estado:");
                    console.log("1. PENDIENTE");
                    console.log("2. CONFIRMADO");
                    console.log("3. TERMINADO");
                    console.log("4. CANCELADO");
                    console.log("0. Volver");

                    const opcionEstado = await preguntar("Selecciones una opción: ");
                    let nuevoEstado;

                    switch(opcionEstado) {
                        case "1":
                            nuevoEstado = "PENDIENTE";
                            break;
                        case "2":
                            nuevoEstado = "CONFIRMADO";
                            break;
                        case "3":
                            nuevoEstado = "TERMINADO";
                            break;
                        case "4":
                            nuevoEstado = "CANCELADO";
                            break;
                        case "0":
                            console.log("Operación cancelada.");
                            break;
                        default:
                            console.log("Opción inválida, operación cancelada.");
                            break;
                    }

                    if (nuevoEstado) {
                        await actualizarEstadoPedido(db,id, nuevoEstado);
                    }
                    break;
                }
                case "4": {
                    console.log("\nELIMINAR PEDIDO");
                    const id = await preguntar("ID del pedido a eliminar: ");

                    await eliminarPedido(db,id);
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