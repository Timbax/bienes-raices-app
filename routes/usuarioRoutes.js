import express from "express";
import {
  formularioLogin,
  autenticar,
  formularioRegistro,
  formularioOlvidePassword,
  registrar,
  confirmar,
  resetPassword,
  comprobarToken,
  nuevoPassword,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/login", formularioLogin);
router.post("/login", autenticar);

router.get("/registro", formularioRegistro);
router.post("/registro", registrar);

router.get("/confirmar/:token", confirmar);

router.get("/olvide-password", formularioOlvidePassword);
router.post("/olvide-password", resetPassword);
//ALMACENA EL NUEVO PASSWORD
router.get("/olvide-password/:token", comprobarToken);
router.post("/olvide-password/:token", nuevoPassword);

//AGRUPACION DE RUTAS
/* router
  .route("/")
  .get((request, response) => {
    response.json({ message: "Hola Mundo con Express" });
  })
  .post((request, response) => {
    response.json({ message: "Respuesta de tipo POST" });
  });
 */
export default router;
