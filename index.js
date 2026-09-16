import express from "express";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRouter from "./routes/usuarioRoutes.js";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import db from "./config/db.js";

//Crear un app
const app = express();

//Habilitar lectura de datos del formulario
app.use(express.urlencoded({ extended: true }));

//HABILITAR COOCKIE PARSER
app.use(cookieParser());

//HABILITAR CSRF
app.use(csrf({ cookie: true }));

//Conexion a la base de datos
try {
  await db.authenticate();
  db.sync();
  console.log("Conexion correcta a la base de datos!");
} catch {
  console.log(error);
}

//Habilitar pug
app.set("view engine", "pug");
app.set("views", "./views");

//Carpetas publicas
app.use(express.static("public"));

//Routing
app.use("/auth", usuarioRouter);
app.use("/", propiedadesRoutes);

//Definir un puerto y arrancar el proyecto

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`El servidor esta funcionando en el puerto: ${port}`);
});
