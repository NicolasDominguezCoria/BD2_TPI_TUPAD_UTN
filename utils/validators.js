import { ObjectId } from "mongodb";

export function esObjectIdValido(id) {
    return typeof id === "string" && ObjectId.isValid(id);
}

export function esEnteroPositivo(valor) {
    return Number.isInteger(valor) && valor > 0;
}

export function esNumeroNoNegativo(valor) {
    return Number.isFinite(valor) && valor >= 0;
}