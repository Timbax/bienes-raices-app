const admin = (request, response) => {
  response.render("propiedades/admin", {
    pagina: "Mis propiedades",
    barra: true
  });
};

export { admin };
