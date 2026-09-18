const admin = (request, response) => {
  response.render("propiedades/admin", {
    pagina: "Mis propiedades",
    barra: true,
  });
};

//FORMULARO PARA CREAR UNA NUEVA PROPIEDAD
const crear = (request, response) => {
  response.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    barra: true,
  });
};

export { admin, crear };
