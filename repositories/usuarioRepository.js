import { ObjectId } from "mongodb";

//1. Crear un usuario (CREATE)
export async function crearUsuario(
    db,
    nombreCompleto,
    email,
    telefono,
    direccion,
    rol
) {

    const usuarioCollection = db.collection("usuarios");
    const usuarioExiste = await usuarioCollection.findOne({nombreCompleto: nombreCompleto, eliminado: false});

    if (usuarioExiste) {
        console.log("Error: Ya existe un usuario con el nombre " + nombreCompleto);
        return null;
    }

    const nuevoUsuario = {
        nombreCompleto: nombreCompleto,
        email: email,
        telefono: telefono,
        direccion: direccion,
        rol: rol,
        eliminado: false,
        createdAt: new Date()
    };

    const resultado = await db
        .collection("usuarios")
        .insertOne(nuevoUsuario);

    console.log("Usuario creado correctamente.");
    console.log("ID del usuario: ", resultado.insertedId);
    return resultado.insertedId;

};

// 2. obtener usuarios (READ)
export async function obtenerUsuarios(db) {
    const usuarios = await db
        .collection("usuarios")
        .find({eliminado: false})
        .toArray();

    console.log("Listado de usuarios:")
    usuarios.forEach(usuario => {
        console.log(usuario);
    })

    return usuarios;
};

//3. actualizar usuario (UPDATE)
export async function actualizarUsuario(
    db,
    id,
    nuevoNombreCompleto,
    nuevoEmail,
    nuevoTelefono,
    nuevaDireccion,
    nuevoRol
) {
    const { ObjectId } = await import("mongodb");

    const resultado = await db
        .collection("usuarios")
        .updateOne(
            { _id: new ObjectId(id), eliminado: false},
            {
                $set: {
                    nombreCompleto: nuevoNombreCompleto,
                    email: nuevoEmail,
                    telefono: nuevoTelefono,
                    direccion: nuevaDireccion,
                    rol: nuevoRol
                }
            }
        );

        if (resultado.matchedCount === 0) {
            console.log("No se encontró un usuario activo con ese ID");
            return false;
        }

        console.log("Usuario actualizado correctamente.");
        console.log("Documentos modificados: ", resultado.modifiedCount);
        return true
};
export async function eliminarUsuario(db, id) {
    const resultado = await db
        .collection("usuarios")
        .updateOne(
            {
                _id: new ObjectId(id),
                eliminado: false
            },
            {
                $set: {
                    eliminado: true
                }
            }
        );

    if (resultado.matchedCount === 0) {
        console.log("No se encontró un usuario activo con ese ID.");
        return false;
    }

    console.log("Usuario eliminado lógicamente.");
    console.log("Documentos modificados: ", resultado.modifiedCount);
    return true;
};