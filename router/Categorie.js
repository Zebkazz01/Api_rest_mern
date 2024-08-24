import routerx from 'express-promise-router'
import categorieController from '../controllers/CategorieController'
import auth from '../service/auth';
import multiparty from 'connect-multiparty'

var path = multiparty({uploadDir: './uploads/categorie'});
const router = routerx();

router.post("/register",[auth.verifyAdmin,path],categorieController.register);
router.post("/update",[auth.verifyAdmin,path],categorieController.update);
router.get("/list",[auth.verifyAdmin],categorieController.list);
router.delete("/remove/:id",[auth.verifyAdmin],categorieController.remove);

router.get("/imagen-categorie/:img",categorieController.get_imagen);

export default router;
