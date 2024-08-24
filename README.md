# API REST para Tienda Virtual de Cursos Online

Este proyecto es una API RESTful desarrollada con la metodología MERN (MongoDB, Express.js, React.js, Node.js). La API gestiona los datos de una tienda virtual de cursos online, con dos vistas montadas en Angular.

## Estructura del Proyecto

├── package.json<br>
├── package-lock.json<br>
├── server/<br>
│ ├── index.js<br>
│ ├── config/<br>
│ │ └── db.js<br>
│ ├── controllers/<br>
│ │ └── courseController.js<br>
│ ├── models/<br>
│ │ └── courseModel.js<br>
│ ├── routes/<br>
│ │ └── courseRoutes.js<br>
│ └── middleware/<br>
│ └── auth.js<br>
└── client/<br>
├── src/<br>
│ ├── app/<br>
│ │ ├── components/<br>
│ │ ├── services/<br>
│ │ └── views/<br>
│ └── main.ts<br>
└── angular.json<br>


## Instalación

1. Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    cd tu-repositorio
    ```

2. Instala las dependencias del servidor:
    ```bash
    cd server
    npm install
    ```

3. Instala las dependencias del cliente:
    ```bash
    cd ../client
    npm install
    ```

## Configuración

1. Crea un archivo `.env` en la carpeta `server` con las siguientes variables de entorno:
    ```
    PORT=8000
    MONGODB_URI=mongodb://localhost:27017/tu-base-de-datos
    JWT_SECRET=tu_secreto_jwt
    ```

2. Configura la conexión a MongoDB en `server/config/db.js`.

## Uso

### Servidor

1. Inicia el servidor:
    ```bash
    cd server
    npm start
    ```

2. El servidor estará corriendo en `http://localhost:8000`.

### Cliente

1. Inicia la aplicación Angular:
    ```bash
    cd client
    ng serve
    ```

2. La aplicación estará disponible en `http://localhost:4200`.

## Endpoints

### Cursos

- **GET /api/courses**: Obtiene todos los cursos.
- **POST /api/courses**: Crea un nuevo curso.
- **GET /api/courses/:id**: Obtiene un curso por ID.
- **PUT /api/courses/:id**: Actualiza un curso por ID.
- **DELETE /api/courses/:id**: Elimina un curso por ID.

### Autenticación

- **POST /api/auth/register**: Registra un nuevo usuario.
- **POST /api/auth/login**: Inicia sesión y obtiene un token JWT.

## Dependencias

### Servidor

- `express`: ^4.18.2
- `mongoose`: ^7.4.1
- `jsonwebtoken`: ^9.0.1
- `bcryptjs`: ^2.4.3
- `dotenv`: ^16.3.1
- `nodemailer`: ^6.9.4
- `nodemailer-smtp-transport`: ^2.7.4

### Cliente

- `@angular/core`: ^12.0.0
- `@angular/router`: ^12.0.0
- `rxjs`: ^6.6.0

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la licencia ISC.

---

**Autor**: Zebkazz_Castle
