import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";
import { generarId } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const formularioLogin = (request, response) => {
  response.render("auth/login", {
    pagina: "Iniciar Sesión",
    csrfToken: request.csrfToken(),
  });
};

const autenticar = async (request, response) => {
  await check("email")
    .notEmpty()
    .isEmail()
    .withMessage("El email es obligatorio")
    .run(request);
  await check("password")
    .notEmpty()
    .withMessage("El password es obligatorio")
    .run(request);

  let resultado = validationResult(request);
  //Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    //ERRORES
    return response.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: request.csrfToken(),
      errores: resultado.array(),
    });
  }

  //Comprobar si el usuario existe
  const { email, password } = request.body;
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return response.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: request.csrfToken(),
      errores: [{ msg: "El usuario NO existe" }],
    });
  }

  //Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    return response.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: request.csrfToken(),
      errores: [{ msg: "Tu cuenta no ha sido confirmada." }],
    });
  } 

  //Revisar el password



};

const formularioRegistro = (request, response) => {
  response.render("auth/registro", {
    pagina: "Crear Cuenta",
    csrfToken: request.csrfToken(),
  });
};

const registrar = async (request, response) => {
  //VALIDACIONES
  await check("nombre")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio!")
    .run(request);
  await check("email")
    .notEmpty()
    .isEmail()
    .withMessage("Eso no parece un email!")
    .run(request);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe ser almenos de 6 caracteres")
    .run(request);
  await check("repetir_password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Los passwords no son iguales!")
    .run(request);

  /* return response.json(resultado.array()); */
  let resultado = validationResult(request);
  //Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    //ERRORES
    return response.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: request.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: request.body.nombre,
        email: request.body.email,
      },
    });
  }

  //Extraer los datos
  const { nombre, email, password } = request.body;

  //VERIFICAR QUE EL USUARIO NO ESTE DUPLICADO
  const existeUsuario = await Usuario.findOne({
    where: { email },
  });
  if (existeUsuario) {
    return response.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: request.csrfToken(),
      errores: [{ msg: "El usuario ya esta registrado" }],
      usuario: {
        nombre: request.body.nombre,
        email: request.body.email,
      },
    });
  }

  //ALMACENAR USUARIO
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  //ENVIA EMAIL DE CONFIRMACION
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  //MOSTRAR MENSAJE DE CONFIRMACIÓN
  response.render("templates/mensaje", {
    pagina: "Cuenta creada Correctamente",
    mensaje: "Hemos enviado un email de confirmación, presiona en el enlace.",
  });
};

//FUNCION QUE COMPRUEBA UNA CUENTA DESDE EL EMAIL
const confirmar = async (request, response) => {
  const { token } = request.params;

  //VERIFICAR SI EL TOKEN ES VALIDO

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return response.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar cuenta.",
      mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo.",
      error: true,
    });
  }
  console.log(usuario);

  //CONFIRMAR LA CUENTA

  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  response.render("auth/confirmar-cuenta", {
    pagina: "Cuenta confirmada!",
    mensaje: "La cuenta se confirmó correctamente!",
  });

  console.log(usuario);
};

const formularioOlvidePassword = (request, response) => {
  response.render("auth/olvide-password", {
    pagina: "Recupera tu acceso a Bienes y Raices",
    csrfToken: request.csrfToken(),
  });
};

const resetPassword = async (request, response) => {
  //VALIDACIONES
  await check("email")
    .notEmpty()
    .isEmail()
    .withMessage("Eso no parece un email!")
    .run(request);

  /* return response.json(resultado.array()); */
  let resultado = validationResult(request);
  //Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    //ERRORES
    return response.render("auth/olvide-password", {
      pagina: "Recupera tu acceso a Bienes y Raices",
      csrfToken: request.csrfToken(),
      errores: resultado.array(),
    });
  }

  //BUSCAR EL USUARIO

  const { email } = request.body;
  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return response.render("auth/olvide-password", {
      pagina: "Recupera tu acceso a Bienes y Raices",
      csrfToken: request.csrfToken(),
      errores: [{ msg: "El email no pertenece a ningun usuario" }],
    });
  }

  //GENERAR UN TOKEN Y ENVIAR EL EMAIL
  usuario.token = generarId();

  await usuario.save();

  //ENVIAR UN EMAIL
  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  // RENDEREIZAR UN MENSAJE

  response.render("templates/mensaje", {
    pagina: "Reestablece tu password",
    mensaje: "Hemos enviado un email con las instrucciones.",
  });
};

const comprobarToken = async (request, response) => {
  const { token } = request.params;
  const usuario = await Usuario.findOne({ where: { token } });
  console.log(usuario);

  if (!usuario) {
    return response.render("auth/confirmar-cuenta", {
      pagina: "Reestablece tu password",
      mensaje: "Hubo un error al validar tu informacion, intenta de nuevo.",
      error: true,
    });
  }

  // MOSTRAR FORMULARIO PARA MODIFICAR EL PASSWORD
  response.render("auth/reset-password", {
    pagina: "Reestablece tu password",
    csrfToken: request.csrfToken(),
  });
};

const nuevoPassword = async (request, response) => {
  //Validar el password
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe ser almenos de 6 caracteres")
    .run(request);

  let resultado = validationResult(request);
  //Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    //ERRORES
    return response.render("auth/reset-password", {
      pagina: "Reestablece tu password",
      csrfToken: request.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = request.params;
  const { password } = request.body;

  //Identificar el usuario que hace el cambio

  const usuario = await Usuario.findOne({ where: { token } });

  //Hashear el nuevo password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  await usuario.save();

  response.render("auth/confirmar-cuenta", {
    pagina: "Password reestablecido",
    mensaje: "El password se guardo correctamente",
  });
};

export {
  formularioLogin,
  autenticar,
  formularioRegistro,
  formularioOlvidePassword,
  registrar,
  confirmar,
  resetPassword,
  comprobarToken,
  nuevoPassword,
};
