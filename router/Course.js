import routerx from 'express-promise-router'
import courseController from '../controllers/CourseController'
import auth from '../service/auth'

import multipart from 'connect-multiparty';
var path = multipart({uploadDir: './uploads/course'});

var path2 = multipart();

const router = routerx();

router.post("/register",[auth.verifyAdmin,path],courseController.register);
router.post("/update",[auth.verifyAdmin,path],courseController.update);

router.post("/upload_vimeo",[auth.verifyAdmin,path2],courseController.upload_vimeo);

router.get("/list",[auth.verifyAdmin],courseController.list);

router.get("/show/:id",[auth.verifyAdmin],courseController.show_course);

router.get("/config_all",[auth.verifyAdmin],courseController.config_all);


router.delete("/remove/:id",[auth.verifyAdmin],courseController.remove);

router.get("/imagen-course/:img",courseController.get_imagen);

export default router;