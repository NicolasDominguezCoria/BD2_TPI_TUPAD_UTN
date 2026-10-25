//importaciones que van a permitir interactuar con el usuario coninputs
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });
//funcion para introducir informacion con un input
export async function preguntar(mensaje) {
    return await rl.question(mensaje);
}

export function cerrarPreguntas() {
    rl.close();
}