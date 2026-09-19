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
    categorias,
    precios,
  });
};

export { admin, crear };
