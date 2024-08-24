import routerx from 'express-promise-router'
import homeController from '../controllers/HomeController'

const router = routerx();

router.get("/list",homeController.list);
router.get("/config-all",homeController.config_all);

router.get("/landing-curso/:slug",homeController.show_course);

router.post("/search-course",homeController.search_course);

export default router;