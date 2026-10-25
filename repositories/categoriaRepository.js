import { ObjectId } from "mongodb";

//1. crear categoria (CREATE)
export async function crearCategoria(db, nombre, descripcion) { //pasamos solo los atributos nombre y decripción

    //verificamos si ya existe esa categoria en la colección (tambien se puede hacer creando un indice directamente desde la bd)
    const categoriasCollection = db.collection("categorias");
    const catExiste = await categoriasCollection.findOne({nombre: nombre, eliminado: false});

    if (catExiste) {
        console.log("Error: Ya existe una categoria con el nombre " + nombre);
        return null;
    }

    //si no existe entonces creamos el registro
    const nuevaCategoria = {
        //el ObjectId lo crea mongo por defecto.
        nombre: nombre, //atributo nombre
        descripcion: descripcion, //atributo descripción
        eliminado: false, //por defecto el atributo eliminado se guarda con falso
        createdAt: new Date() //automatico al momento de crear la categoria
    };

    const resultado = await db //Insertamos la nueva categoria
        .collection("categorias")
        .insertOne(nuevaCategoria);

    console.log("Categoría " + nuevaCategoria.nombre + " creada correctamente.");
    console.log("ID de la categoría:", resultado.insertedId);

    return resultado.insertedId;
};

// 2. Obtener categorias(READ)
export async function obtenerCategorias(db) {
    const categorias = await db //a través de un stream
        .collection("categorias") //filtramos los registros en la colección categorias
        .find({ eliminado: false }) //usando como referencia el campo eliminado = false
        .toArray(); //y los insertamos en un array

    console.log("Listado de categorías:");

    categorias.forEach(categoria => { //imprimimos por pantalla los resultados
        console.log(categoria);
    });

    return categorias;
};

// 3. Actualizar categoria(UPDATE)
export async function actualizarCategoria(db, id, nuevoNombre, nuevaDescripcion) { //vamos a proveer como parametros el id, un nuevo nombre y una nueva descripción


    const resultado = await db
        .collection("categorias")
        .updateOne(
            { _id: new ObjectId(id), eliminado: false }, //el parametro id lo usamos para identificar el documento a modificar, eliminado: false lo usamos para comprobar el estado de la categoria
            {
                $set: {
                    nombre: nuevoNombre, //pasamos el parametro con el nuevo nombre
                    descripcion: nuevaDescripcion //pasamos el parametro con la nueva descripción
                }
            }
        );

    if (resultado.matchedCount === 0) { //si no encontró ninguna coincidencia en la busqueda
        console.log("No se encontró una categoría activa con ese ID."); //devuelve el aviso y termina la operación
        return false;
    }

    console.log("Categoría actualizada correctamente.");
    console.log("Documentos modificados:", resultado.modifiedCount);

    return true;
};

// 4. Eliminar categoria (DELETE lógico)
export async function eliminarCategoria(db, id) { //pasamos como parametro el id del registro a eliminar de forma lógica
    const resultado = await db
        .collection("categorias")
        .updateOne(
            {
                _id: new ObjectId(id),
                eliminado: false
            },
            {
                $set: {
                    eliminado: true //cambiamos el valor del campo eliminado a true
                }
            }
        );

    if (resultado.matchedCount === 0) { //si no hay coincidencia en la búsqueda
        console.log("No se encontró una categoría activa con ese ID.");
        return false;
    }

    console.log("Categoría eliminada lógicamente.");
    console.log("Documentos modificados:", resultado.modifiedCount);

    return true;
};