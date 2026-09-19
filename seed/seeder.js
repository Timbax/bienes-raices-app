import { exit } from "node:process";
import categorias from "./categorias.js";
import Categoria from "../models/Categoria.js";
import precios from "./precios.js";
import Precio from "../models/Precio.js";
import db from "../config/db.js";

const importarDatos = async () => {
  try {
    //Autenticar en la base de datos
    await db.authenticate();

    //Generar las columnas
    await db.sync();

    //Insertar los datos con doble await
    await Categoria.bulkCreate(categorias);
    await Precio.bulkCreate(precios);

    //INSERTAR DATOS CON PROMISE.ALL
    /* await Promise.all([
      Categoria.bulkCreate(categorias),
      Precio.bulkCreate(precios),
    ]); */

    console.log("Datos importados correcta.");
    exit();
  } catch (error) {
    console.log(error);
    exit(1);
  }
};

const eliminarDatos = async () => {
  try {
    await Promise.all([
      Categoria.destroy({ where: {}, truncate: true }),
      Precio.destroy({ where: {}, truncate: true }),
    ]);
    console.log("Datos eliminados correctamente");
    exit();
  } catch (error) {
    console.log(error);
    exit(1);
  }
};

if (process.argv[2] === "-i") {
  importarDatos();
}

if (process.argv[2] === "-e") {
  eliminarDatos();
}
