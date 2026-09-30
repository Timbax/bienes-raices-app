import { validationResult } from "express-validator";
import Categoria from "../models/Categoria.js";
import Precio from "../models/Precio.js";

const admin = (request, response) => {
  response.render("propiedades/admin", {
    pagina: "Mis propiedades",
    barra: true,
  });
};

//FORMULARO PARA CREAR UNA NUEVA PROPIEDAD
const crear = async (request, response) => {
  //Consultar Modelo de precios y categoria
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);

  response.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    barra: true,
    csrfToken: request.csrfToken(),
    categorias,
    precios,
  });
};

const guardar = async (request, response) => {
  //Validacion
  let resultado = validationResult(request);
  if (!resultado.isEmpty()) {
    //Consultar Modelo de precios y categoria
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);
    return response.render("propiedades/crear", {
      pagina: "Crear Propiedad",
      barra: true,
      csrfToken: request.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
    });
  }
};

export { admin, crear, guardar };
