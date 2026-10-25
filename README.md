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

Al ejecutar la app inicia el Menu principal desde donde seleccionas que entidad queres gestionar, da hi navegas a los menues de cada entidad para realizar las operaciones crud. Recodar que cada vez que se coloca un ID se debe hacer sin las comillas.

faltaria trabajar en los pequeños detalles, el backup y estamos

