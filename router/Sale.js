import routerx from 'express-promise-router'
import saleController from '../controllers/SaleController'
import auth from '../service/auth'

const router = routerx();

router.post("/register",auth.verifyTienda,saleController.register);
// router.get("/email/:_id",saleController.send_email);

export default router;