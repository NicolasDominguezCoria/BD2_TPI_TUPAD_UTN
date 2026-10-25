//importacion del driver y gestor de ObjectId
import { MongoClient, ObjectId } from "mongodb";

//permite controlar la url de conexion a mongo desde .env
import dotenv from "dotenv"; 
dotenv.config();

//importaciones que van a permitir interactuar con el usuario coninputs
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });
//funcion para introducir informacion con un input
async function preguntar(mensaje) {
    return await rl.question(mensaje);
};

//coneccion con el servidor y la base de datos
const url = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const client = new MongoClient(url);

//===========================================================================================
// FUNCIONES CRUD
//===========================================================================================

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
};

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
};

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
};

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
};

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
};

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
};

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
};

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
    return true;
};

// ==== CRUD PEDIDOS =============================================================== //

// 1. Crear un pedido (CREATE)
async function crearPedido(db, usuarioId, itemsPedido) {
    
    //Validar si el usuario existe en la coleccion
    const usuariosCollection = db.collection("usuarios");
    const usuarioExiste = await usuariosCollection.findOne({_id: new ObjectId(usuarioId), eliminado: false});

    if (!usuarioExiste) {
        throw new Error(
            `No se encontró el usuario con ID ${usuarioId}`
        );
    }
    
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
        
        //comprobamos que el producto existe y no esté en estado eliminado = true
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
};

// 3. Actualizar estado del pedido (UPDATE)
async function actualizarEstadoPedido(db, id, nuevoEstado) {

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
async function eliminarPedido(db, id) {
    
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

//============================================================================================================================
// MENUS PARA INTERACCIÓN
//===========================================================================================================================

// === MENU DE INICIO ===================================== //

async function menuPrincipal(db) {
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

// ======== SUB MENU para gestion de CATEGORIAS ======== 
async function menuCategorias(db) {
    let opcion = "";

    while( opcion !== "0") {
        console.log("\n   ====== GESTIÓN DE CATEGORÍAS ======");
        console.log("   1. Crear categoría");
        console.log("   2. Listar categorías");
        console.log("   3. Actualizar categoría");
        console.log("   4. Eliminar categoría");
        console.log("   0. Volver al menú principal");
        console.log("   ==================================");

        opcion = await preguntar("      Seleccione una opción: ");

        try {
            switch (opcion) {
                case "1": {
                    console.log("\nCREAR NUEVA CATEGORIA")
                    const nombre = await preguntar("Nombre: ");
                    const descripcion = await preguntar("Descripción: ")

                    await crearCategoria(db, nombre, descripcion);
                    break;
                }
                case "2": {   
                    await obtenerCategorias(db);
                    break;
                }
                case "3": {
                    console.log("\nACTUALIZAR CATEGORIA")
                    const id = await preguntar("ID de la categoría: ");
                    const nuevoNombre = await preguntar("Nuevo Nombre: ");
                    const nuevaDescripcion = await preguntar("Nueva descripción: ");

                    await actualizarCategoria(db,id,nuevoNombre,nuevaDescripcion);
                    break;
                }
                case "4": {
                    console.log("\nELIMINAR UNA CATEGORIA")
                    const id = await preguntar("ID de la categoria a eliminar: ");

                    await eliminarCategoria(db,id);
                    break;
                }
                case "0": 
                    console.log("Volviendo al menú principal...");
                    break;
                
                default:
                    console.log("Opción inválida. Intente nuevamente.");
                
            }
        } catch (error) {
            console.log("No se pudo completar la operación: ", error);
        }
    }
};

// ======== SUB MENU para gestion de PRODUCTOS ======== 
async function menuProductos(db) {
    let opcion = "";

    while (opcion !== "0") {
        console.log("\n   ====== GESTIÓN DE PRODUCTOS ======");
        console.log("   1. Crear producto");
        console.log("   2. Listar productos");
        console.log("   3. Actualizar producto");
        console.log("   4. Eliminar producto");
        console.log("   0. Volver al menú principal");
        console.log("   ==================================");
    
        opcion = await preguntar("      Seleccione una opción: ")

        try{
            switch (opcion) {
                    case "1": {
                        console.log("\nCREAR NUEVO PRODUCTO")
                        const nombre = await preguntar("Nombre: ");
                        const precio = Number(await preguntar("Precio: "));
                        const descripcion = await preguntar("Descripción: ");
                        const stock = Number(await preguntar("Stock: "));
                        const imagen = await preguntar("Nombre o ruta de la imagen: "); 

                        const disponible = stock > 0;
                        
                        const categoriasTexto = await preguntar(
                            "IDs de categorías separados por coma: "
                        );

                        const idsCategorias = categoriasTexto
                            .split(",")
                            .map(id => id.trim())
                            .filter(id => id !== "");

                        await crearProducto(
                            db,
                            nombre,
                            precio,
                            descripcion,
                            stock,
                            imagen,
                            disponible,
                            idsCategorias
                        );
                        break;
                    }

                    case "2":
                        await obtenerProductos(db);
                        break;

                    case "3": {
                        console.log("\nACTUALIZAR UN PRODUCTO")
                        const id = await preguntar("ID del producto: ");
                        const nuevoNombre = await preguntar("Nuevo nombre: ");
                        const nuevoPrecio = Number(await preguntar("Nuevo precio: "));
                        const nuevaDescripcion = await preguntar("Nueva descripción: ");
                        const nuevoStock = Number(await preguntar("Nuevo stock: "));
                        const nuevaImagen = await preguntar("Nombre o ruta de la nueva imagen: ");
                        
                        const nuevoDisponible = nuevoStock > 0;
                        
                        const categoriasTexto = await preguntar(
                            "Nuevos IDs de categorías separados por coma: "
                        );

                        const nuevoIdsCategorias = categoriasTexto
                            .split(",")
                            .map(id => id.trim())
                            .filter(id => id !== "");

                        await actualizarProducto(
                            db,
                            id,
                            nuevoNombre,
                            nuevoPrecio,
                            nuevaDescripcion,
                            nuevoStock,
                            nuevaImagen,
                            nuevoDisponible,
                            nuevoIdsCategorias
                        );
                        break;
                    }

                    case "4": {
                        console.log("\nELIMINAR UN PRODUCTO")
                        const id = await preguntar(
                            "ID del producto que desea eliminar: "
                        );
                        await eliminarProducto(db, id);
                        break;
                    }

                    case "0":
                        console.log("Volviendo al menú principal...");
                        break;

                    default:
                        console.log("Opción inválida. Intente nuevamente.");
                }
        } catch (error) {
            console.error("No se pudo completar la operación.", error);
        }
    }
};

// ======== SUB MENU para gestion de USUARIOS ========
async function menuUsuarios(db) {
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

// ======== SUB MENU para gestion de PEDIDOS ========
async function menuPedidos(db) {
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

                        if(!Number.isInteger(cantidad)|| cantidad <=0) {
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


//=============================================================================================================================
//   MAIN ejecución del programa
//=============================================================================================================================

async function main() {
    //conectar con el servidor base de datos de mongoDB
        await client.connect();
        console.log("Conexión exitosa al servidor MongoDB");
        
        
        //seleccion o creación de la bd
        const db = client.db(dbName);
        console.log(`Base de datos seleccionada: ${dbName}`);

        // Colecciones que utiliza la BD 
        const colecciones = [
            "categorias",
            "productos",
            "usuarios",
            "pedidos"
        ];

        //comprobación de la existencia de las colecciones
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
            } else {
                console.log(`La colección ya existe: ${nombre}`);
                
            }
        }
        console.log("Configuración inicial completada.")

        // ==========
        //EJECUCION DEL MENU INICIAL

        console.log("\n ======== BIENVENIDO AL SISTEMA DE GESTION DE FOOD STORE ========")
        await menuPrincipal(db);
        
};

// EJECUCION DEL PROGRAMA
try {
     await main();
} catch (error) {
    console.error("   Error en la aplicación:", error);
} finally {
    await client.close();
    console.log("   Conexión con la base de datos cerrada. Hasta la próxima!");
    rl.close();
};
