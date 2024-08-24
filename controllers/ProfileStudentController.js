import models from "../models";
import resource from "../resource";
import token from "../service/token";
import bcrypt from 'bcryptjs';

function formDateToYMD(date,type=1) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2,'0');//07 08 09

    const day =  String(date.getDate()).padStart(2,'0');// 2 ,3 ,4
    if(type == 1){
        return day+"/"+month+"/"+year; // 01/03/2023
    }
    return year+"-"+month+"-"+day; // 01/03/2023
}
async function N_CLASES_OF_COURSES(Course){
    // SON LAS SECCIONES QUE TIENE UN CURSO
    let SECTIONS = await models.CourseSection.find({course: Course._id});
    let N_CLASES = 0;
    for (const SECTION of SECTIONS) {
        let CLASES = await models.CourseClase.count({section: SECTION._id});
        N_CLASES += CLASES;
    }
    return N_CLASES;
 }

function sumarTiempos(...tiempos) {
    // Convierte cada tiempo en formato "hh:mm:ss" a segundos y suma todos los segundos.
    const totalSegundos = tiempos.reduce((total, tiempo) => {
        const [horas, minutos, segundos] = tiempo.split(':').map(Number);
        return total + horas * 3600 + minutos * 60 + segundos;
    }, 0);

    // Convierte los segundos totales a formato "hh:mm:ss".
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    // Retorna el resultado formateado.
    return `${horas} horas ${minutos} minutos ${segundos} segundos`;
}
export default {
    profile_student: async(req,res) => {
        try {
            
            let user = await token.decode(req.headers.token);//_id, role ,email
            let enrolled_course_count = await models.CourseStudent.count({user: user._id});
            // TODOS LOS CURSOS QUE AL MENOS SE HA VISTO UNA CLASE
            let actived_course_count = await models.CourseStudent.count({user: user._id,clases_checked: {$ne : []},state: 1});
            let termined_course_count = await models.CourseStudent.count({user: user._id,state: 2});

            let Student = await models.User.findById({_id: user._id});

            let enrolled_course_news = [];
            let actived_course_news = [];
            let termined_course_news = [];

            let enrolled_courses = await models.CourseStudent.find({user: user._id});

            for (const enrolled_course of enrolled_courses) {
                let course = await models.Course.findOne({_id: enrolled_course.course});
                let N_CLASES = await N_CLASES_OF_COURSES(course);
                enrolled_course_news.push({
                    clases_checked: enrolled_course.clases_checked,
                    percentage: ((enrolled_course.clases_checked.length/N_CLASES)*100).toFixed(2),// 2/10 => 0.2 * 100 => 20
                    course: resource.Course.api_resource_course(course,null,N_CLASES),
                });
            }

            let actived_courses = await models.CourseStudent.find({user: user._id,clases_checked: {$ne : []},state: 1});

            for (const actived_course of actived_courses) {
                let course = await models.Course.findOne({_id: actived_course.course});
                let N_CLASES = await N_CLASES_OF_COURSES(course);
                actived_course_news.push({
                    clases_checked: actived_course.clases_checked,
                    percentage: ((actived_course.clases_checked.length/N_CLASES)*100).toFixed(2),// 2/10 => 0.2 * 100 => 20
                    course: resource.Course.api_resource_course(course,null,N_CLASES),
                });
            }

            let termined_courses = await models.CourseStudent.find({user: user._id,state: 2});

            for (const termined_course of termined_courses) {
                let course = await models.Course.findOne({_id: termined_course.course});
                let N_CLASES = await N_CLASES_OF_COURSES(course);
                termined_course_news.push({
                    clases_checked: termined_course.clases_checked,
                    percentage: ((termined_course.clases_checked.length/N_CLASES)*100).toFixed(2),// 2/10 => 0.2 * 100 => 20
                    course: resource.Course.api_resource_course(course,null,N_CLASES),
                });
            }

            let sales = await models.Sale.find({user: user._id});
            let sales_collection = [];
            let sales_details_collection = [];
            for (let sale of sales) {
                sale = sale.toObject();
                let sale_details = await models.SaleDetail.find({sale: sale._id}).populate({
                    path: 'course',
                    populate: {
                        path: 'categorie'
                    }
                });
                // TAMBIEN NECESITAMOS ITERAR EL SALE DETAIL
                let sales_detail_collection = [];
                for (let sale_detail of sale_details) {
                    sale_detail = sale_detail.toObject();
                    sales_detail_collection.push({
                        course: {
                            _id: sale_detail.course._id,
                            title: sale_detail.course.title,
                            imagen: process.env.URL_BACKEND+"/api/courses/imagen-course/"+sale_detail.course.imagen,
                            categorie: sale_detail.course.categorie,
                        },
                        type_discount: sale_detail.type_discount,
                        discount: sale_detail.discount,
                        campaign_discount: sale_detail.campaign_discount,
                        code_cupon: sale_detail.code_cupon,
                        code_discount: sale_detail.code_discount,
                        price_unit: sale_detail.price_unit,
                        subtotal: sale_detail.subtotal,
                        total: sale_detail.total,
                    });
                    let review = await models.Review.findOne({sale_detail: sale_detail._id});
                    sales_details_collection.push({
                        course: {
                            _id: sale_detail.course._id,
                            title: sale_detail.course.title,
                            imagen: process.env.URL_BACKEND+"/api/courses/imagen-course/"+sale_detail.course.imagen,
                            categorie: sale_detail.course.categorie,
                        },
                        type_discount: sale_detail.type_discount,
                        discount: sale_detail.discount,
                        campaign_discount: sale_detail.campaign_discount,
                        code_cupon: sale_detail.code_cupon,
                        code_discount: sale_detail.code_discount,
                        price_unit: sale_detail.price_unit,
                        subtotal: sale_detail.subtotal,
                        total: sale_detail.total,
                        _id: sale_detail._id,
                        review: review,
                    });
                }
                sales_collection.push({
                    _id: sale._id,
                    method_payment: sale.method_payment,
                    currency_total: sale.currency_total,
                    currency_payment: sale.currency_payment,
                    total: sale.total,
                    price_dolar: sale.price_dolar,
                    n_transaccion: sale.n_transaccion,
                    sales_details: sales_detail_collection,
                    created_at: formDateToYMD(sale.createdAt),
                });
            }

            res.status(200).json({
                enrolled_course_count: enrolled_course_count,
                actived_course_count: actived_course_count,
                termined_course_count: termined_course_count,
                profile: {
                    name: Student.name,
                    surname: Student.surname,
                    email: Student.email,
                    profession: Student.profession,
                    description: Student.description,
                    phone: Student.phone,
                    birthday: Student.birthday ? formDateToYMD(new Date(Student.birthday)) : null,
                    birthday_format: Student.birthday ? Student.birthday : null,
                    avatar: Student.avatar ? process.env.URL_BACKEND+"/api/users/imagen-usuario/"+Student.avatar : null,
                },
                enrolled_course_news: enrolled_course_news,
                actived_course_news: actived_course_news,
                termined_course_news: termined_course_news,
                sales: sales_collection,
                sales_details: sales_details_collection,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    update_student: async(req,res) => {
        try {
            // echo@gmail.com
            let user = await token.decode(req.headers.token);

            const VALID_USER = await models.User.findOne({email: req.body.email, _id: {$ne : user._id}});

            if(VALID_USER){
                res.status(200).json({
                    message: 403,
                    message_text: "EL USUARIO INGRESADO YA EXISTE",
                });
            }

            if(req.body.password){
                req.body.password = await bcrypt.hash(req.body.password,10);
            }

            if(req.files && req.files.avatar){
                var img_path = req.files.avatar.path;// uploads\\carpeta\\fdfdfd.jpg
                var name = img_path.split("\\");
                var avatar_name = name[2];
                req.body.avatar = avatar_name;
            }

            const User = await models.User.findByIdAndUpdate({_id: user._id},req.body);

            const NUser = await models.User.findById({_id: user._id});
            res.status(200).json({
                message: 'EL USUARIO SE EDITO CORRECTAMENTE',
                user: resource.User.api_resource_user(NUser),
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    review_register: async(req,res) => {
        try {
            let user = await token.decode(req.headers.token);

            req.body.user = user._id;
            let review = await models.Review.create(req.body);

            res.status(200).json({
                message: 'LA RESEÑA SE HA REGISTRADO CORRECTAMENTE',
                review: review
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR',
            });
        }
    },
    review_update: async(req,res) => {
        try {
           
            await models.Review.findByIdAndUpdate({_id: req.body._id},req.body);

            
            let review = await models.Review.findById({_id: req.body._id});

            res.status(200).json({
                message: 'LA RESEÑA SE HA EDITADO CORRECTAMENTE',
                review: review
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR',
            });
        }
    },
    course_leason: async(req,res) => {
        try {
            let SLUG = req.params.slug;
            let user = await token.decode(req.headers.token);

            let COURSE = await models.Course.findOne({slug: SLUG}).populate(["categorie","user"]);
            if(!COURSE){
                res.status(200).json({
                    message: 403,
                    message_text: 'EL CURSO NO EXISTE'
                });
                return;
            }

            let course_student = await models.CourseStudent.findOne({course: COURSE._id,user: user._id});

            if(!course_student){
                res.status(200).json({
                    message: 403,
                    message_text: 'TU NO ESTAS INSCRITO EN ESTE CURSO'
                });
                return;
            }

            let MALLA_CURRICULAR = [];
            // TODAS LAS SECCIONES DEL CURSO
            let SECTIONS = await models.CourseSection.find({course: COURSE._id});
            let TIME_TOTAL_SECTIONS = [];
            let FILES_TOTAL_SECTIONS = 0;
            let NUMERO_TOTAL_CLASES = 0;
            for (let SECTION of SECTIONS) {
                //PASAMOS EL MODELO SECTION A UN OBJETO
                SECTION = SECTION.toObject();
                // TODAS LAS CLASES QUE CORRESPONDA A ESTA SECCIÓN
                let CLASES_SECTION = await models.CourseClase.find({section: SECTION._id});

                let CLASES_NEWS = [];
                let TIME_CLASES = [];
                //ITERAMOS TODAS LAS CLASES DE LA SECCIÓN
                for (var CLASE of CLASES_SECTION) {
                    //PASAMOS EL MODELO CLASE A UN OBJETO
                    CLASE = CLASE.toObject();
                    // TODAS LOS ARCHIVOS QUE CORRESPONDA A ESTA CLASE
                    let ClaseFiles = await models.CourseClaseFile.find({clase: CLASE._id});
                    CLASE.files = []
                    //ITERAMOS TODOS LOS ARCHIVOS PARA DARLE UN FORMATO ADECUADO
                    for (let ClaseFile of ClaseFiles) {
                        CLASE.files.unshift({
                            _id: ClaseFile._id,
                            file: process.env.URL_BACKEND+"/api/course_clase/file-clase/"+ClaseFile.file,
                            file_name: ClaseFile.file_name,
                            size: ClaseFile.size,
                            clase: ClaseFile.clase,
                        })
                    }
                    // SUMAMOS EL NUMERO DE ARCHIVOS QUE ADJUNTA PARA TENER UN REPORTE TOTAL
                    FILES_TOTAL_SECTIONS += CLASE.files.length;
                    // SETEAMOS EL VIMEO_ID CON EL VALOR DE LA URL QUE DEBE TENER
                    CLASE.vimeo_id = CLASE.vimeo_id ? "https://player.vimeo.com/video/"+CLASE.vimeo_id : null;
                    let time_clase = [CLASE.time];//NUEVO
                    // ADJUNTAMOS EL TIEMPO DE LA CLASE PARA UN REPORTE DE DURACIÓN POR SECCIÓN
                    TIME_CLASES.push(CLASE.time);
                    // ADJUNTAMOS EL TIEMPO DE LA CLASE PARA UN REPORTE DE DURACIÓN POR CURSO
                    TIME_TOTAL_SECTIONS.push(CLASE.time);
                    const tiempoTotal = CLASE.time ? sumarTiempos(...time_clase) : 0;
                    // EL TIEMPO DE LA CLASE
                    CLASE.time_parse = tiempoTotal;
                    CLASES_NEWS.unshift(CLASE);
                }
                NUMERO_TOTAL_CLASES += (CLASES_NEWS.length)
                // ADJUNTAMOS TODA LA INFORMACIÓN DE LAS CLASES DE LA SECCIÓN
                SECTION.clases = CLASES_NEWS;
                // EL TIEMPO TOTAL POR SECCIÓN
                SECTION.time_parse = sumarTiempos(...TIME_CLASES);
                MALLA_CURRICULAR.push(SECTION);
            }

            //DURACIÓN TOTAL DEL CURSO
            let TIME_TOTAL_COURSE = sumarTiempos(...TIME_TOTAL_SECTIONS);
            //NUMERO DE CURSOS DEL INSTRUCTOR
            // INFORMACION DEL INSTRUCTOR
            let COURSES_INSTRUCTOR = await models.Course.find({user: COURSE.user,state: 2});
            let COUNT_COURSE_INSTRUCTOR = COURSES_INSTRUCTOR.length;
            
            let N_STUDENTS_SUM_TOTAL = 0;
            let AVG_RATING_SUM_TOTAL = 0;
            let NUM_REVIEW_SUM_TOTAL = 0;
            let AVG_RATING_INSTRUCTOR = 0;// 5 4 3  = 12 / 3 = 4
            for (const COURSES_INSTRUC of COURSES_INSTRUCTOR) {
                let N_STUDENTS_C = await models.CourseStudent.count({course: COURSES_INSTRUC._id});
                let REVIEWS_C = await models.Review.find({course: COURSES_INSTRUC._id});
                let AVG_RATING_C = REVIEWS_C.length > 0 ? REVIEWS_C.reduce((sum,review) => sum + review.rating, 0)/REVIEWS_C.length : 0; 
                let NUM_REVIEW_C = REVIEWS_C.length;
                N_STUDENTS_SUM_TOTAL += N_STUDENTS_C;
                NUM_REVIEW_SUM_TOTAL += NUM_REVIEW_C;
                AVG_RATING_SUM_TOTAL += AVG_RATING_C;
            }
            AVG_RATING_INSTRUCTOR = (AVG_RATING_SUM_TOTAL / NUM_REVIEW_SUM_TOTAL).toFixed(2);

            // REVIEWS DEL CURSO SELECCIONADO
            let N_STUDENTS = await models.CourseStudent.count({course: COURSE._id});
            let REVIEWS = await models.Review.find({course: COURSE._id});
            // 2 5 , 3
            // 5 + 3 = 8 / 2 = 4
            let AVG_RATING = REVIEWS.length > 0 ? (REVIEWS.reduce((sum,review) => sum + review.rating, 0)/REVIEWS.length).toFixed(2) : 0; 
            let NUM_REVIEW = REVIEWS.length;
            // 
            res.status(200).json({
                course: resource.Course.api_resource_course_landing(COURSE,null,
                    MALLA_CURRICULAR,
                    TIME_TOTAL_COURSE,
                    FILES_TOTAL_SECTIONS,
                    COUNT_COURSE_INSTRUCTOR,
                    NUMERO_TOTAL_CLASES,
                    N_STUDENTS,
                    AVG_RATING,
                    NUM_REVIEW,
                    N_STUDENTS_SUM_TOTAL,
                    NUM_REVIEW_SUM_TOTAL,
                    AVG_RATING_INSTRUCTOR
                ),
                course_student: course_student,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR',
            });
        }
    },
    course_student: async(req,res) => {
        try {
            let COURSE_STUDENT_ID = req.body._id;

            let course_student = await models.CourseStudent.findByIdAndUpdate({_id: COURSE_STUDENT_ID},{
                clases_checked: req.body.clases_checked,
                state: req.body.state,
            });

            res.status(200).json({
                message: 'SE GUARDO LA SELECCION DE LA CLASE'
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR',
            });
        }
    }
}