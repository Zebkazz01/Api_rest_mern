import routerx from 'express-promise-router'
import userController from '../controllers/UserController'
import auth from '../service/auth'

import multiparty from 'connect-multiparty'

var path = multiparty({uploadDir : './uploads/user'})

const router = routerx();
// ,auth.verifyAdmin
router.post("/register",userController.register)
router.post("/login_tienda",userController.login)
router.post("/login_admin",userController.login_admin)
//CRUD ADMIN 
router.post("/register_admin",[auth.verifyAdmin,path],userController.register_admin)
router.post("/update",[auth.verifyAdmin,path],userController.update)
router.get("/list",[auth.verifyAdmin],userController.list)
router.delete("/delete/:id",[auth.verifyAdmin],userController.remove)

router.get("/imagen-usuario/:img",userController.get_imagen);
export default router;