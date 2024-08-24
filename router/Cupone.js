import routerx from 'express-promise-router'
import cuponeController from '../controllers/CuponeController'
import auth from '../service/auth'

const router = routerx();

router.post("/register",[auth.verifyAdmin],cuponeController.register);
router.post("/update",[auth.verifyAdmin],cuponeController.update);
router.get("/list",[auth.verifyAdmin],cuponeController.list);
router.get("/show/:id",[auth.verifyAdmin],cuponeController.show_cupone);
router.get("/config_all",[auth.verifyAdmin],cuponeController.config_all);
router.delete("/remove/:id",[auth.verifyAdmin],cuponeController.remove);

export default router;