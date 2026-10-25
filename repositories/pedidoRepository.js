import { ObjectId } from "mongodb";

// 1. Crear un pedido (CREATE)
export async function crearPedido(db, usuarioId, itemsPedido) {

    // Validar que el usuario exista y no esté eliminado
    const usuarioObjectId = new ObjectId(usuarioId); // Convertir el ID del usuario a ObjectId
    const usuario = await db
        .collection("usuarios")
        .findOne({ _id: usuarioObjectId, eliminado: false });

    if (!usuario) {
        throw new Error(`No se encontró un usuario con ID ${usuarioId}`);
    }

   //Construi usuario embebido para pedido
   const usuarioEmbebido = {
   usuarioId : usuario._id,
   nombreCompleto : usuario.nombreCompleto,
   email : usuario.email,
   telefono : usuario.telefono,
   direccion : usuario.direccion,
   rol : usuario.rol
   };

    // Validar y calcular totales recorriendo los ítems
    let totalPedido = 0; //inicializamos una variable para calcular el total en 0

    const detalleProcesado = [];
    const actualizacionesStock = [];

    for(const item of itemsPedido) {
        //buscamos el producto en la coleccion de productos
        const producto = await db
            .collection("productos")
            .findOne({
                _id: new ObjectId(item.productoId),
                eliminado: false
            });

        //comprobamos que el producto existe y no esté eliminado = true
        if (!producto) {
            throw new Error(
                `No se encontró el producto con ID ${item.productoId}`
            );
        }

        //comprobamos que esté disponible para la venta constatando stock respecto a cantidad
        if (!producto.disponible || producto.stock < item.cantidad) {
            throw new Error(
                `El producto ${producto.nombre} no está disponible o no tiene stock suficiente`
            );
        }

        const nuevoStock = producto.stock - item.cantidad;
        const nuevaDisponibilidad = nuevoStock > 0;

        // Agregamos el stock actualizado a productos
        actualizacionesStock.push ({
        productoId : producto._id,
        nuevoStock : nuevoStock,
        nuevaDisponibilidad : nuevaDisponibilidad});

        // Tomamos los datos directamente del producto encontrado
        const nombreProducto = producto.nombre;
        const precioUnitario = producto.precio;

        // Calculamos el subtotal y totales del pedido
        const subtotal = item.cantidad * precioUnitario;
        totalPedido += subtotal;

        // Construimos el detalle embebido
        detalleProcesado.push({
            productoId: producto._id,
            nombreProducto: nombreProducto,
            cantidad: item.cantidad,
            precioUnitario: precioUnitario,
            subtotal: subtotal
        });
    }

    for (const actualizacion of actualizacionesStock) {
    await db
        .collection("productos")
        .updateOne(
            {
                _id: actualizacion.productoId,
                eliminado: false
            },
            {
                $set: {
                    stock: actualizacion.nuevoStock,
                    disponible: actualizacion.nuevaDisponibilidad
                }
            }
        );
    }

    // Construimos el documento del pedido
    const nuevoPedido = {
        usuarioId: usuarioObjectId,
        usuario: usuarioEmbebido,
        detallePedido: detalleProcesado,
        total: totalPedido,
        fecha: new Date(),
        estado: "PENDIENTE",
        eliminado: false
    };

    const resultado = await db
        .collection("pedidos")
        .insertOne(nuevoPedido);

    console.log("Pedido creado correctamente.");
    console.log("ID del pedido:", resultado.insertedId);
    console.log("Total del pedido: $", totalPedido);

    return resultado.insertedId;

};

// 2. Obtener pedidos (READ)
export async function obtenerPedidos(db) {
    const pedidos = await db
        .collection("pedidos")
        .find({ eliminado: false })
        .toArray();

    console.log("Listado de pedidos:");
    pedidos.forEach(pedido => {
        console.log(pedido);
    });

    return pedidos;
};

// 3. Actualizar estado del pedido (UPDATE)
export async function actualizarEstadoPedido(db, id, nuevoEstado) {

    const resultado = await db
        .collection("pedidos")
        .updateOne(
            { _id: new ObjectId(id), eliminado: false },
            {
                $set: {
                    estado: nuevoEstado
                }
            }
        );

    if (resultado.matchedCount === 0) {
        console.log("No se encontró un pedido activo con ese ID.");
        return false;
    }

    console.log("Estado del pedido actualizado correctamente a:", nuevoEstado);
    console.log("Documentos modificados: ", resultado.modifiedCount);
    return true;
};

// 4. Eliminar pedido (DELETE lógico)
export async function eliminarPedido(db, id) {

    const resultado = await db
        .collection("pedidos")
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
        console.log("No se encontró un pedido activo con ese ID.");
        return false;
    }

    console.log("Pedido eliminado lógicamente.");
    console.log("Documentos modificados: ", resultado.modifiedCount);
    return true;
};