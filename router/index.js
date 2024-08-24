import routerx from 'express-promise-router'
import User from './User'
import Categorie from './Categorie'
import Course from './Course'
import CourseSection from './CourseSection'
import CourseClase from './CourseClase'
import Cupone from './Cupone'
import Discount from './Discount'
import Home from './Home'
import Cart from './Cart'
import Sale from './Sale'
import ProfileStudent from './ProfileStudent'

// http://localhost:3000/api/users/register
const router = routerx();

router.use('/users',User);
router.use('/categories',Categorie);
router.use('/courses',Course);
router.use('/course_section',CourseSection);
router.use('/course_clase',CourseClase);
router.use('/cupone',Cupone);
router.use('/discount',Discount);
router.use('/home',Home);
router.use('/cart',Cart);
router.use('/checkout',Sale);
router.use('/profile',ProfileStudent);
export default router;