import {menuCategorias } from "./menuCategorias.js";
import {menuProductos } from "./menuProductos.js";
import {menuUsuarios } from "./menuUsuarios.js";
import {menuPedidos } from "./menuPedidos.js";
import {preguntar } from "../utils/preguntar.js";

// === MENU DE INICIO ===================================== //

export async function menuPrincipal(db) {
    let opcion = "";

    while (opcion !== "0") {
        console.log("\n========== MENU PRINCIPAL ==========");
        console.log("1. Gestionar categorías");
        console.log("2. Gestionar productos");
        console.log("3. Gestionar usuarios");
        console.log("4. Gestionar pedidos");
        console.log("0. Salir");
        console.log("================================");

        opcion = await preguntar("Seleccione una opción: ");

        switch (opcion) {
            case "1":
                await menuCategorias(db);
                break;

            case "2":
                await menuProductos(db);
                break;

            case "3":
                await menuUsuarios(db);
                break;

            case "4":
                await menuPedidos(db);
                break;

            case "0":
                console.log("Saliendo del programa...");
                break;

            default:
                console.log("Opción inválida. Intente nuevamente.");
        }
    }
};