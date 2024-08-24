import routerx from 'express-promise-router'
import courseClaseController from '../controllers/CourseClaseController'
import auth from '../service/auth';

import multipart from 'connect-multiparty';
var path2 = multipart();

var path1 = multipart({uploadDir: './uploads/course/files'});

const router = routerx();

router.post("/register",[auth.verifyAdmin],courseClaseController.register);
router.post("/update",[auth.verifyAdmin],courseClaseController.update);
router.get("/list",[auth.verifyAdmin],courseClaseController.list);
router.delete("/remove/:id",[auth.verifyAdmin],courseClaseController.remove);

router.post("/upload_vimeo",[auth.verifyAdmin,path2],courseClaseController.upload_vimeo);

// recursos descargables
router.post("/register_file",[auth.verifyAdmin,path1],courseClaseController.register_file);
router.delete("/delete_file/:id",[auth.verifyAdmin],courseClaseController.delete_file);
router.get("/file-clase/:file",courseClaseController.get_file_clase);

export default router;