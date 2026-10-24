
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv"; //permite controlar la url de conexion a mongo desde .env

dotenv.config();

const url = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

const client = new MongoClient(url);

// ==== CRUD CATEGORIAS =============================================================== //

//1. crear categoria (CREATE)
async function crearCategoria(db, nombre, descripcion) { //pasamos solo los atributos nombre y decripción
    
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
}

// 2. Obtener categorias(READ)
async function obtenerCategorias(db) {
    const categorias = await db //a través de un stream 
        .collection("categorias") //filtramos los registros en la colección categorias
        .find({ eliminado: false }) //usando como referencia el campo eliminado = false
        .toArray(); //y los insertamos en un array

    console.log("Listado de categorías:");

    categorias.forEach(categoria => { //imprimimos por pantalla los resultados
        console.log(categoria);
    });

    return categorias;
}

// 3. Actualizar categoria(UPDATE)
async function actualizarCategoria(db, id, nuevoNombre, nuevaDescripcion) { //vamos a proveer como parametros el id, un nuevo nombre y una nueva descripción
     

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
}

// 4. Eliminar categoria (DELETE lógico)
async function eliminarCategoria(db, id) { //pasamos como parametro el id del registro a eliminar de forma lógica
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
}



// ==== CRUD PRODUCTOS =============================================================== //
//es bastante parecido al CRUD de categorias, la novedad de el campo tipo lista donde se pueden referenciar las categorias categorias
//1. Crear un producto (CREATE)
async function crearProducto(
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
}

// 2. Obtener Productos (READ)
async function obtenerProductos(db) {
    const productos = await db
        .collection("productos")
        .find({ eliminado: false})
        .toArray();

    console.log("Listado de productos:");
    productos.forEach(producto => {
        console.log(producto);
    });

    return productos;
}

// 3.Actualizar producto (UPDATE)
async function actualizarProducto(
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
}

// 4. Eliminar producto (DELETE lógico)
async function eliminarProducto(db, id) {
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
}

// ==== CRUD USUARIOS =============================================================== //
//1. Crear un usuario (CREATE)
async function crearUsuario(
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
async function obtenerUsuarios(db) {
    const usuarios = await db
        .collection("usuarios")
        .find({eliminado: false})
        .toArray();

    console.log("Listado de usuarios:")
    usuarios.forEach(usuario => {
        console.log(usuario);
    })

    return usuarios;
}

//3. actualizar usuario (UPDATE)
async function actualizarUsuario(
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
}

//4. Eliminar usuario (DELETE lógico)
async function eliminarUsuario(db, id) {
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
}

// ==== CRUD PEDIDOS =============================================================== //

// 1. Crear un pedido (CREATE)
async function crearPedido(db, usuarioId, itemsPedido) {
    
    // Validar y calcular totales recorriendo los ítems
    let totalPedido = 0; //inicializamos una variable para calcular el total en 0
    
    
    const detalleProcesado = [];

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

    // Construimos el documento del pedido
    const nuevoPedido = {
        usuarioId: new ObjectId(usuarioId),
        detallePedido: detalleProcesado,
        total: totalPedido,
        fecha: new Date(),
        estado: "pendiente",
        eliminado: false
    };

    const resultado = await db
        .collection("pedidos")
        .insertOne(nuevoPedido);

    console.log("Pedido creado correctamente.");
    console.log("ID del pedido:", resultado.insertedId);
    console.log("Total del pedido: $", totalPedido);

    return resultado.insertedId;

    

    
}

// 2. Obtener pedidos (READ)
async function obtenerPedidos(db) {
    const pedidos = await db
        .collection("pedidos")
        .find({ eliminado: false })
        .toArray();

    console.log("Listado de pedidos:");
    pedidos.forEach(pedido => {
        console.log(pedido);
    });

    return pedidos;
}

// 3. Actualizar estado del pedido (UPDATE)
async function actualizarEstadoPedido(db, id, nuevoEstado) {
    const { ObjectId } = await import("mongodb");

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
}

// 4. Eliminar pedido (DELETE lógico)
async function eliminarPedido(db, id) {
    const { ObjectId } = await import("mongodb");

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
}

//=========== MAIN ========================================================================//

async function main() {
    await client.connect();

        // inicialización de la aplicación
        console.log("Conexión exitosa al servidor MongoDB");

        const db = client.db(dbName);
        console.log(`Base de datos seleccionada: ${dbName}`);

        // Colecciones que utiliza la BD
        const colecciones = [
            "categorias",
            "productos",
            "usuarios",
            "pedidos"
        ];

        const existentes = await db
            .listCollections({}, { nameOnly: true })
            .toArray();

        const nombresExistentes = existentes.map(
            coleccion => coleccion.name
        );

        for (const nombre of colecciones) {
            if (!nombresExistentes.includes(nombre)) {
                await db.createCollection(nombre);
                console.log(`Colección creada: ${nombre}`);
                console.log("Configuración inicial completada.")
            } else {
                console.log(`La colección ya existe: ${nombre}`);
                console.log("Configuración inicial completada.")
            }
        }

        // ========================================================================================== //
        //EJECUCION DEL CRUD DE CATEGORIAS
        //cración e inserción de categorías
        await crearCategoria(db, "Pizzas", "Categorías de pizzas");

        //consulta de categorías en la db
        await obtenerCategorias(db);

        //modificacion de una categoria por su id
        await actualizarCategoria(
            db,
            "PEGAR_AQUI_EL_ID",
            "Pizzas artesanales",
            "Pizzas elaboradas de forma artesanal"
        );

        //eliminar una categoría por su id
        await eliminarCategoria(
            db,
            "PEGAR_AQUI_EL_ID"
        );

        // ========================================================================================== //
        //EJECUCION DEL CRUD DE PRODUCTOS
        await crearProducto(
            db,
            "Pizza muzzarella", 8500,
            "Pizza de muzzarella", 10,
            "pizza-muzzarella.jpg", true,
            ["PEGAR_AQUI_EL_ID_DE_CATEGORIA"]
        );

        //consulta de productos en la bd
        await obtenerProductos(db);

        //modificar un producto por su id
        await actualizarProducto(
            db,
            "PEGAR_AQUI_EL_ID_DE_PRODUCTO",
            "Pizza napolitana", 8500,
            "Pizza a la napolitana", 20,
            "pizza-napolitana.jpg", true,
            ["PEGAR_AQUI_EL_ID_DE_CATEGORIA"]
        )

        //eliminar un producto por su id
        await eliminarProducto(
            db,
            "PEGAR_EL_ID_AQUI"
        )

        // ========================================================================================== //
        //EJECUCION DEL CRUD DE USUARIOS
        await crearUsuario(
            db, 
            "Juan Perez",
            "jperes@mail.com",
            "1123456789",
            "calle falsa 123",
            "cliente"
        );

        //consulta de usuarios en la db
        await obtenerUsuarios(db);

        //modificar un usuario por su id
        await actualizarUsuario(
            db,
            "PEGAR_AQUI_EL_ID_DE_USUARIO",
            "Carlos Perez", "cp@mail.com", "1123456789", "domicilio 123","cliente"
        )

        //eliminar un usuario por su id
        await eliminarUsuario(
            db,
            "PEGAR_EL_ID_AQUI"
        )

        // ========================================================================================== //
        //EJECUCION DEL CRUD DE PEDIDOS
        
        // Creamos un pedido simulando  un ID de usuario y de producto
        await crearPedido(
            db,
            "PEGAR_AQUI_EL_ID_DE_USUARIO",
            [
                {
                    productoId: "PEGAR_AQUI_EL_ID_DE_PRODUCTO",
                    cantidad: 2,
                },
                {
                    productoId: "PEGAR_AQUI_EL_ID_DE_OTRO_PRODUCTO",
                    cantidad: 3,
                }
            ]
        );

        // Consultar pedidos
        await obtenerPedidos(db);

        // Actualizar el estado del pedido (ej: pasar de "pendiente" a "pagado")
        await actualizarEstadoPedido(
            db,
            "PEGAR_AQUI_EL_ID_DE_PEDIDO",
            "pagado"
        );

        // Eliminar pedido lógicamente
        await eliminarPedido(
            db,
            "PEGAR_AQUI_EL_ID_DE_PEDIDO"
        );
    }


// EJECUCION DEL PROGRAMA
try {
    const result = await main();
    if (result) {
    console.log("Procesos completados");
    };

} catch (error) {
    console.error("Error al conectar o configurar MongoDB:", error);
} finally {
    await client.close();
    console.log("Conexión cerrada.");
}

