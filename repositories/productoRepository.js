import { ObjectId } from "mongodb";
//es bastante parecido al CRUD de categorias, la novedad de el campo tipo lista donde se pueden referenciar las categorias categorias
//1. Crear un producto (CREATE)
export async function crearProducto(
    db,
    nombre,
    precio,
    descripcion,
    stock,
    imagen,
    disponible,
    idsCategorias
) {
    //verificamos si el producto ya existe
    const prodCollection = db.collection("productos");
    const prodExiste = await prodCollection.findOne({nombre: nombre, eliminado: false});

    if (prodExiste) {
        console.log("Error: Ya existe un producto con el nombre " + nombre);
        return null;
    }
    const { ObjectId } = await import("mongodb");

    const nuevoProducto = {
        nombre: nombre,
        precio: precio,
        descripcion: descripcion,
        stock: stock,
        imagen: imagen,
        disponible: disponible,
        categorias: idsCategorias.map(id => new ObjectId(id)),
        eliminado: false,
        createdAt: new Date()
    };

    const resultado = await db
        .collection("productos")
        .insertOne(nuevoProducto);

    console.log("Producto creado correctamente.");
    console.log("ID del producto: ", resultado.insertedId);

    return resultado.insertedId;
};

// 2. Obtener Productos (READ)
export async function obtenerProductos(db) {
    const productos = await db
        .collection("productos")
        .find({ eliminado: false})
        .toArray();

    console.log("Listado de productos:");
    productos.forEach(producto => {
        console.log(producto);
    });

    return productos;
};

// 3.Actualizar producto (UPDATE)
export async function actualizarProducto(
    db,
    id,
    nuevoNombre,
    nuevoPrecio,
    nuevaDescripcion,
    nuevoStock,
    nuevaImagen,
    nuevoDisponible,
    nuevoIdsCategorias
) {
    const { ObjectId } = await import("mongodb");

    const resultado = await db
        .collection("productos")
        .updateOne(
            { _id: new ObjectId(id), eliminado: false},
            {
                $set: {
                    nombre: nuevoNombre,
                    precio: nuevoPrecio,
                    descripcion: nuevaDescripcion,
                    stock: nuevoStock,
                    imagen: nuevaImagen,
                    disponible: nuevoDisponible,
                    categorias: nuevoIdsCategorias.map(id => new ObjectId(id)),
                }
            }
        );

    if (resultado.matchedCount === 0) {
        console.log("No se encontró un producto activo con ese ID.");
        return false;
    }

    console.log("Producto actualizado correctamente.");
    console.log("Documentos modificados: ", resultado.modifiedCount);
    return true
};

// 4. Eliminar producto (DELETE lógico)
export async function eliminarProducto(db, id) {
    const resultado = await db
        .collection("productos")
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
        console.log("No se encontró un producto activo con ese ID.");
        return false;
    }

    console.log("Producto eliminada lógicamente.");
    console.log("Documentos modificados: ", resultado.modifiedCount);
    return true
};