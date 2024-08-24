import routerx from 'express-promise-router'
import cartController from '../controllers/CartController'
import auth from '../service/auth'

const router = routerx();

router.post("/register",[auth.verifyTienda],cartController.register);
router.post("/update",[auth.verifyTienda],cartController.update);
router.get("/list",[auth.verifyTienda],cartController.list);
router.delete("/remove/:id",[auth.verifyTienda],cartController.remove);

export default router;