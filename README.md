1) Al descargar es necesario crear el archivo .env dentro de este archivo colocar lo siguiente:

MONGODB_URI=mongodb://localhost:27017/  
DB_NAME=TPI_BD2

Explicación: 
- la variable "MONGODB_URI" aloja la url de conexion a mongodb, en este caso está en local para realizar las pruebas necesarias. una vez esté todo listo cambiar la url por la del enlace a mongoBD atlas

- la variable "DB_NAME" aloja el nombre de la bd con que se está trabajando, tambien debe cambiarse por el nombre de la bd creada en mongoDB atlas

Esto permite no tener que modificar el la url ni en nombre d el bd directamente en el archivo app.js y mantiene las configuraciones de url y bd ocultas.

2) Estructura app.js
Separé el main de las funciones crud: En un intento por generar una arquitectura un poco mas limpia, ordenada y mantenible,y no tanto spaguetti, separé en bloques de funciones las operaciones crud de cada entidad (categoria, producto, usuario y pedido), para ser invocadas en el main pasandole los parametros necesarios para su ejecución.

Vas a encontrar 
funciones CRUD de la coleccion categorias:
- crearCategoria() 
- obtenerCategorias()
- actualizarCategoria()
- eliminarCategoria()

funciones CRUD de la coleccion productos:
- crearProducto() 
- obtenerProductos()
- actualizarProducto()
- eliminarProducto()

funciones CRUD de la coleccion categorias:
- crearUsuario() 
- obtenerUsuarios()
- actualizarUsuario()
- eliminarUsuario()

funciones CRUD de la coleccion categorias:
- crearPedido() 
- obtenerPedidos()
- actualizarPedido()
- eliminarPedido()

Añadí en cada caso comentarios para explicar lo hecho. Realicé algunas validaciones y comprobaciones ya que estamos usando el driver nativo de mongo en vez de mongoose, aunque no es el objeto de la consigna que podrían agragarse algunas otras como la modificacion del stock de un producto cada vez que se hace un pedido. Pero cualquier cosa lo vemos.

En la funcion main vas a ver que al inicio, estan las configuraciones necesarias para la conexion con la bd, tambien una configuración inicial que se lanza para crear la bd si no existe y las colecciones correspondientes si se inicia por primera vez la app y porsupuesto programada para no crearlas dos o mas veces saber si verifica que ya existen.

En cuanto a las pruebas de los CRUD, vas a ver que hay campos donde indica que se debe introducir un ID, algo como "INGRESE_ID_AQUI". eso es para las partes donde hay colecciones referenciadas o embebidas. Esto lo indiqué asi porque como estoy trabajando ccon pruebas en local, mongo genera IDs diferentes a los que generará en el cluster de atlas. Cuando se pase a esta etapa alli deben colocarse los IDs correspondientes.

lo único que estaría faltando sería programar el backup. Cualquier cosa estoy a tu disposición.

