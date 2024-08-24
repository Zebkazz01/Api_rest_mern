import routerx from 'express-promise-router'
import courseSectionController from '../controllers/CourseSectionController'
import auth from '../service/auth';

const router = routerx();

router.post("/register",[auth.verifyAdmin],courseSectionController.register);
router.post("/update",[auth.verifyAdmin],courseSectionController.update);
router.get("/list",[auth.verifyAdmin],courseSectionController.list);
router.delete("/remove/:id",[auth.verifyAdmin],courseSectionController.remove);

export default router;
