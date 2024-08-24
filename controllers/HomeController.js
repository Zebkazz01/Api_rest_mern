import models from "../models";
import resource from "../resource";
import {ObjectId} from "mongodb";
import token from '../service/token';

function formDateToYMD(date,type=1) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2,'0');//07 08 09

    const day =  String(date.getDate()).padStart(2,'0');// 2 ,3 ,4
    if(type == 1){
        return day+"/"+month+"/"+year; // 01/03/2023
    }
    return year+"-"+month+"-"+day; // 01/03/2023
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

 function DISCOUNT_G_F(Campaing_Normal,COURSE) {
    let DISCOUNT_G = null;
    if(Campaing_Normal){
        if(Campaing_Normal.type_segment == 1){//CURSOS
            let courses_a = [];//[{_id: }]
            Campaing_Normal.courses.forEach((course) => {
                courses_a.push(course._id);
            });//["2","dasdasdas","dasdas"]
            if(courses_a.includes(COURSE._id+"")){
                // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                DISCOUNT_G = Campaing_Normal;
            }
        }
        if(Campaing_Normal.type_segment == 2){//CATEGORIAS
            let categorie_a = [];//[{_id: }]
            Campaing_Normal.categorie.forEach((categorie) => {
                categorie_a.push(categorie._id);
            });//["dsdsds","dsdsds"]
            if(categorie_a.includes(COURSE.categorie._id+"")){
                // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                DISCOUNT_G = Campaing_Normal;
            }
        }
    }
    return DISCOUNT_G;
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
 async function COURSE_META_INFO(courseT) {
    let META_INFO = {};
    let N_STUDENTS = await models.CourseStudent.count({course: courseT._id});
    let REVIEWS = await models.Review.find({course: courseT._id});
    let AVG_RATING = REVIEWS.length > 0 ? (REVIEWS.reduce((sum,review) => sum + review.rating,0)/REVIEWS.length).toFixed(2) : 0;
    
    META_INFO.N_STUDENTS = N_STUDENTS;
    META_INFO.N_REVIEWS = REVIEWS.length;
    META_INFO.AVG_RATING = AVG_RATING;
    return META_INFO;
 }
export default {
    list: async(req,res) => {
        try {
            let TIME_NOW = req.query.TIME_NOW;
            // CATEGORIAS
            let categories = await models.Categorie.find({state: 1});
            let CATEGORIES_LIST = [];
            for (const categorie of categories) {
                let count_courses = await models.Course.count({categorie: categorie._id});
                CATEGORIES_LIST.push(resource.Categorie.api_resource_categorie(categorie,count_courses));
            }

            // CAMPAING NORMAL
            let Campaing_home = await models.Discount.findOne({
                type_campaign: 1,
                start_date_num:  {$lte : TIME_NOW},// TIME_NOW >= start_date_num 10
                end_date_num: {$gte : TIME_NOW} ,// TIME_NOW <= end_date_num 20
            });

            // COURSES TOP
            let courses_tops = await models.Course.aggregate([
                {$match : { state : 2 }},
                {$sample: {size: 3}},
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user',
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categorie',
                        foreignField: '_id',
                        as: 'categorie'
                    }
                },
                {
                    $unwind: '$categorie',
                }
            ]);
            let COURSES_TOPS = [];
            for (const courses_top of courses_tops) {
                let DISCOUNT_G = null;
                if(Campaing_home){
                    if(Campaing_home.type_segment == 1){//CURSOS
                        let courses_a = [];//[{_id: }]
                        Campaing_home.courses.forEach((course) => {
                            courses_a.push(course._id);
                        });//["2","dasdasdas","dasdas"]
                        if(courses_a.includes(courses_top._id+"")){
                            // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                            DISCOUNT_G = Campaing_home;
                        }
                    }
                    if(Campaing_home.type_segment == 2){//CATEGORIAS
                        let categorie_a = [];//[{_id: }]
                        Campaing_home.categorie.forEach((categorie) => {
                            categorie_a.push(categorie._id);
                        });//["dsdsds","dsdsds"]
                        if(categorie_a.includes(courses_top.categorie+"")){
                            // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                            DISCOUNT_G = Campaing_home;
                        }
                    }
                }
                let N_CLASES = await N_CLASES_OF_COURSES(courses_top);
                let META_INFO = await COURSE_META_INFO(courses_top);
                COURSES_TOPS.push(resource.Course.api_resource_course(
                    courses_top,
                    DISCOUNT_G,
                    N_CLASES,
                    META_INFO.N_STUDENTS,
                    META_INFO.N_REVIEWS,
                    META_INFO.AVG_RATING
                ));
            }

            // CATEGORIAS SECTIONS
            let categories_sections = await models.Categorie.aggregate([
                {$match: {
                    state: 1,
                }},
                {$sample: {size: 5}}
            ]);
            let CATEGORIES_SECTIONS = [];
            for (const categories_section of categories_sections) {
                let courses = await models.Course.find({categorie: categories_section._id})
                .populate(['categorie','user']);
                let COURSES_C = [];
                for (const course_map of courses) {
                    let DISCOUNT_G = null;
                    if(Campaing_home){
                        if(Campaing_home.type_segment == 1){//CURSOS
                            let courses_a = [];
                            Campaing_home.courses.forEach((course) => {
                                courses_a.push(course._id);
                            });
                            if(courses_a.includes(course_map._id+"")){
                                // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                                DISCOUNT_G = Campaing_home;
                            }
                        }
                        if(Campaing_home.type_segment == 2){//CATEGORIAS
                            let categorie_a = [];
                            Campaing_home.categorie.forEach((categorie) => {
                                categorie_a.push(categorie._id);
                            });
                            if(categorie_a.includes(course_map.categorie+"")){
                                // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                                DISCOUNT_G = Campaing_home;
                            }
                        }
                    }
                    let N_CLASES = await N_CLASES_OF_COURSES(course_map);
                    let META_INFO = await COURSE_META_INFO(course_map);
                    COURSES_C.push(resource.Course.api_resource_course(
                        course_map,DISCOUNT_G,N_CLASES,
                        META_INFO.N_STUDENTS,
                        META_INFO.N_REVIEWS,
                        META_INFO.AVG_RATING
                        ));
                }
                CATEGORIES_SECTIONS.push(
                    {
                        _id: categories_section._id,
                        title:categories_section.title,
                        title_empty: categories_section.title.replace(/\s+/g, ''),
                        count_courses: courses.length,
                        courses: COURSES_C,
                    }
                );
            }   

            // CAMPAING BANNER 15
            let Campaing_banner = await models.Discount.findOne({
                type_campaign: 3,
                start_date_num:  {$lte : TIME_NOW},// TIME_NOW >= start_date_num 10
                end_date_num: {$gte : TIME_NOW} ,// TIME_NOW <= end_date_num 20
            });

            let COURSES_BANNERS = [];
            if(Campaing_banner){
                for (const course of Campaing_banner.courses) {
                    let MODEL_COURSE = await models.Course.findById({_id: course._id});
                    let N_CLASES = await N_CLASES_OF_COURSES(MODEL_COURSE);
                    let META_INFO = await COURSE_META_INFO(course);
                    COURSES_BANNERS.push(resource.Course.api_resource_course(
                        MODEL_COURSE,null,N_CLASES,
                        META_INFO.N_STUDENTS,
                        META_INFO.N_REVIEWS,
                        META_INFO.AVG_RATING
                        ));
                }
            }

            // CAMPAING FLASH 15
            let Campaing_flash = await models.Discount.findOne({
                type_campaign: 2,
                start_date_num:  {$lte : TIME_NOW},// TIME_NOW >= start_date_num 10
                end_date_num: {$gte : TIME_NOW} ,// TIME_NOW <= end_date_num 20
            });

            let COURSES_FLASH = [];
            if(Campaing_flash){
                for (const course of Campaing_flash.courses) {
                    let MODEL_COURSE = await models.Course.findById({_id: course._id});
                    let N_CLASES = await N_CLASES_OF_COURSES(MODEL_COURSE);
                    let META_INFO = await COURSE_META_INFO(course);
                    COURSES_FLASH.push(resource.Course.api_resource_course(
                        MODEL_COURSE,null,N_CLASES,
                        META_INFO.N_STUDENTS,
                        META_INFO.N_REVIEWS,
                        META_INFO.AVG_RATING
                        ));
                }
                Campaing_flash = Campaing_flash.toObject();

                // Campaing_flash.new_start_date = formDateToYMD(Campaing_flash.start_date);
                // Campaing_flash.new_end_date = formDateToYMD(Campaing_flash.end_date)//Campaing_flash.end_date);
                // Campaing_flash.format_end_date = formDateToYMD(Campaing_flash.end_date,2)//Campai
                // 2023-08-21T00:00:00.000Z "2023-08-21 00:00:00"
                let format_start_date = new Date(Campaing_flash.start_date).toISOString()
                                        .slice(0, 19)
                                        .replace('T', ' ');
                let format_end_date = new Date(Campaing_flash.end_date).toISOString()
                                        .slice(0, 19)
                                        .replace('T', ' ');
                Campaing_flash.new_start_date = formDateToYMD(new Date(format_start_date));
                Campaing_flash.new_end_date = formDateToYMD(new Date(format_end_date))//Campaing_flash.end_date);
                Campaing_flash.format_end_date = formDateToYMD(new Date(format_end_date),2)//Campaing_flash.end_date,2);
            }
            res.status(200).json({
                categories: CATEGORIES_LIST,
                courses_top: COURSES_TOPS,
                categories_sections: CATEGORIES_SECTIONS,
                courses_banners: COURSES_BANNERS,
                campaing_banner: Campaing_banner,
                
                courses_flash: COURSES_FLASH,
                campaing_flash: Campaing_flash,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'Ocurrio un error'
            });
        }
    },
    show_course: async(req,res) => {
        try {
            let user = await token.decode(req.headers.token);
            // OBTENEMOS EL VALOR DEL SLUG
            let SLUG = req.params.slug;
            let TIME_NOW = req.query.TIME_NOW;
            let CAMPAING_SPECIAL = req.query.CAMPAING_SPECIAL;
            // EXISTE UNA CAMPAÑA DE DESCUENTO ?

            let Campaing_Normal = null;
            if(CAMPAING_SPECIAL){
                Campaing_Normal = await models.Discount.findOne({_id: CAMPAING_SPECIAL});
            }else{
                Campaing_Normal = await models.Discount.findOne({
                    type_campaign: 1,
                    start_date_num:  {$lte : TIME_NOW},// TIME_NOW >= start_date_num 10
                    end_date_num: {$gte : TIME_NOW} ,// TIME_NOW <= end_date_num 20
                });
            }

            // ENCONTRAMOS EL CURSO
            let COURSE = await models.Course.findOne({slug: SLUG}).populate(["categorie","user"]);

            if(!COURSE){
                res.status(200).json({
                    message: 404,
                    message_text: 'EL CURSO NO EXISTE',
                });
            }
            let STUDENT_HAVE_COURSE = false;
            if(user){
                let IS_HAVE_COUSE = await models.CourseStudent.findOne({course: COURSE._id,user: user._id});
                if(IS_HAVE_COUSE){
                    // que el curso ya esta adquirido por el usuario o cliente;
                    STUDENT_HAVE_COURSE = true;
                }
            }

            let MALLA_CURRICULAR = [];
            let DISCOUNT_G = null;

            if(Campaing_Normal){
                if(Campaing_Normal.type_segment == 1){//CURSOS
                    let courses_a = [];//[{_id: }]
                    Campaing_Normal.courses.forEach((course) => {
                        courses_a.push(course._id);
                    });//["2","dasdasdas","dasdas"]
                    if(courses_a.includes(COURSE._id+"")){
                        // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                        DISCOUNT_G = Campaing_Normal;
                    }
                }
                if(Campaing_Normal.type_segment == 2){//CATEGORIAS
                    let categorie_a = [];//[{_id: }]
                    Campaing_Normal.categorie.forEach((categorie) => {
                        categorie_a.push(categorie._id);
                    });//["dsdsds","dsdsds"]
                    if(categorie_a.includes(COURSE.categorie._id+"")){
                        // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                        DISCOUNT_G = Campaing_Normal;
                    }
                }
            }

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
            // //NUMERO DE CURSOS DEL INSTRUCTOR
            // let COUNT_COURSE_INSTRUCTOR = await models.Course.count({user: COURSE.user,state: 2});

            //CURSOS RELACIONADOS CON EL INSTRUCTOR DEL CURSO PRINCIPAL
            let COURSE_INSTRUCTOR = await models.Course.aggregate([
                {$match: { state: 2, user: COURSE.user._id,}},
                { $sample : { size : 2}},
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user',
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categorie',
                        foreignField: '_id',
                        as: 'categorie'
                    }
                },
                {
                    $unwind: '$categorie',
                }
            ]);
            let N_COURSE_INSTRUCTOR = [];
            for (const COURSE_INS of COURSE_INSTRUCTOR) {
                let DISCOUNT_G = DISCOUNT_G_F(Campaing_Normal,COURSE_INS);
                let N_CLASES = await N_CLASES_OF_COURSES(COURSE_INS);
                let META_INFO = await COURSE_META_INFO(COURSE_INS);
                N_COURSE_INSTRUCTOR.push(resource.Course.api_resource_course(
                    COURSE_INS,DISCOUNT_G,N_CLASES,
                    META_INFO.N_STUDENTS,META_INFO.N_REVIEWS,META_INFO.AVG_RATING
                    ));
            }

            //CURSOS RELACIONADOS CON LA CATEGORIA DEL CURSO PRINCIPAL
            let COURSE_RELATEDS = await models.Course.aggregate([
                {$match : { categorie : COURSE.categorie._id , _id: {$ne : COURSE._id} }},
                { $sample : {size : 4}},
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user',
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categorie',
                        foreignField: '_id',
                        as: 'categorie'
                    }
                },
                {
                    $unwind: '$categorie',
                }
            ])

            let N_COURSE_RELATEDS = [];
            for (const COURSE_INS of COURSE_RELATEDS) {
                let DISCOUNT_G = DISCOUNT_G_F(Campaing_Normal,COURSE_INS);
                let N_CLASES = await N_CLASES_OF_COURSES(COURSE_INS);
                let META_INFO = await COURSE_META_INFO(COURSE_INS);
                N_COURSE_RELATEDS.push(resource.Course.api_resource_course(
                    COURSE_INS,DISCOUNT_G,N_CLASES,
                    META_INFO.N_STUDENTS,META_INFO.N_REVIEWS,META_INFO.AVG_RATING
                    ));
            }
            
            let META_INFO = await COURSE_META_INFO(COURSE);
            let REVIEWS = await models.Review.find({course: COURSE._id}).populate("user");
            
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

            res.status(200).json({
                course: resource.Course.api_resource_course_landing(
                    COURSE,DISCOUNT_G,
                    MALLA_CURRICULAR,
                    TIME_TOTAL_COURSE,
                    FILES_TOTAL_SECTIONS,
                    COUNT_COURSE_INSTRUCTOR,
                    NUMERO_TOTAL_CLASES,
                    META_INFO.N_STUDENTS,
                    META_INFO.AVG_RATING,
                    META_INFO.N_REVIEWS,
                    N_STUDENTS_SUM_TOTAL,
                    NUM_REVIEW_SUM_TOTAL,
                    AVG_RATING_INSTRUCTOR,
                ),
                reviews: REVIEWS.map((review) => {
                    review = review.toObject();
                    review.user_info = {
                        _id: review.user._id,
                        full_name: review.user.name + ' ' + review.user.surname,
                        avatar: review.user.avatar ? process.env.URL_BACKEND+"/api/users/imagen-usuario/"+review.user.avatar : null,
                    }
                    review.user = null;
                    return review;
                }),
                course_instructor: N_COURSE_INSTRUCTOR,
                course_relateds : N_COURSE_RELATEDS,
                student_have_course: STUDENT_HAVE_COURSE,
            });

        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN ERROR',
            });
        }
    },
    search_course: async(req,res) => {
        try {
            let TIME_NOW = req.query.TIME_NOW;
            let search_course = req.body.search;

            let selected_categories = req.body.selected_categories;
            if(selected_categories){
                selected_categories = selected_categories.map((str) => new ObjectId(str));
            }
            let selected_instructors = req.body.selected_instructors;
            if(selected_instructors){
                selected_instructors = selected_instructors.map((str) => new ObjectId(str));
            }

            let selected_levels = req.body.selected_levels;//["Basico","Intermedio"]
            let selected_idiomas = req.body.selected_idiomas;

            let min_price = req.body.min_price;
            let max_price = req.body.max_price;
            let rating_selected = req.body.rating_selected;//2

            let filters = [
                {$match: { state: 2}},
            ];
            if(search_course){
                filters.push(
                    {$match: { title: new RegExp(search_course,'i')}}
                );
            }
            if(selected_categories && selected_categories.length > 0){
                filters.push(
                    {$match: { categorie: {$in: selected_categories } }},
                );
            }
            if(selected_instructors && selected_instructors.length > 0){
                filters.push(
                    {$match: { user: {$in: selected_instructors } }},
                );
            }
            if(selected_levels && selected_levels.length > 0){
                filters.push(
                    {$match: { level: {$in: selected_levels } }},
                );
            }
            if(selected_idiomas && selected_idiomas.length > 0){
                filters.push(
                    {$match: { idioma: {$in: selected_idiomas } }},
                );
            }
            if(min_price > 0 && max_price > 0){
                filters.push(
                    {$match: { price_usd: {$gte: min_price, $lte: max_price } }},
                );
            }
            if(rating_selected && rating_selected > 0){
                filters.push(
                    {
                        $lookup: {
                            from: 'reviews',
                            localField: '_id',
                            foreignField: 'course',
                            as: 'reviews'
                        }
                    }
                );
                filters.push(
                    {
                        $addFields: {
                            avgRanting: {
                                $avg : "$reviews.rating"
                            }
                        }
                    }
                );
                filters.push(
                    {
                        $match: {
                            avgRanting: { $gt : rating_selected - 1, $lte : rating_selected },
                        }
                    }
                );
            }
            filters.push(
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                }
            );
            filters.push({
                $unwind: '$user',
            });
            filters.push({
                $lookup: {
                    from: 'categories',
                    localField: 'categorie',
                    foreignField: '_id',
                    as: 'categorie'
                }
            });
            filters.push({
                $unwind: '$categorie',
            });
            let Courses = await models.Course.aggregate(
                filters
                // [
                // {$match: { state: 2, title: new RegExp(search_course,'i')}},
                // {$match: { categorie: {$in: selected_categories } }},
                // ]
            );

            // CAMPAING NORMAL
            let Campaing_home = await models.Discount.findOne({
                type_campaign: 1,
                start_date_num:  {$lte : TIME_NOW},// TIME_NOW >= start_date_num 10
                end_date_num: {$gte : TIME_NOW} ,// TIME_NOW <= end_date_num 20
            });
                        
            let COURSES = [];
            for (const Course of Courses) {
                let DISCOUNT_G = null;
                if(Campaing_home){
                    if(Campaing_home.type_segment == 1){
                        let courses_a = [];
                        Campaing_home.courses.forEach((course) => {
                            courses_a.push(course._id);
                        });
                        if(courses_a.includes(Course._id+"")){
                            // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                            DISCOUNT_G = Campaing_home;
                        }
                    }
                    if(Campaing_home.type_segment == 2){//CATEGORIAS
                        let categorie_a = [];
                        Campaing_home.categorie.forEach((categorie) => {
                            categorie_a.push(categorie._id);
                        });
                        if(categorie_a.includes(Course.categorie+"")){
                            // TIENE UNA CAMPAÑA DE DESCUENTO ACTIVA
                            DISCOUNT_G = Campaing_home;
                        }
                    }
                }
                let N_CLASES = await N_CLASES_OF_COURSES(Course);
                COURSES.push(resource.Course.api_resource_course(Course,DISCOUNT_G,N_CLASES));
            }

            res.status(200).json({
                courses: COURSES,
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN ERROR'
            });
        }
    },
    config_all: async(req,res) => {
        try {

            let categories = await models.Categorie.find({state: 1});
            let N_CATEGORIES = [];
            for (let categorie of categories) {
                categorie = categorie.toObject();
                categorie.count_course = await models.Course.count({categorie: categorie._id});
                N_CATEGORIES.push(categorie);
            }
            let instructores = await models.User.find({rol: 'instructor',state: 1});
            let N_INSTRUCTORS = [];
            for (let instructor of instructores) {
                instructor = instructor.toObject();
                instructor.count_course = await models.Course.count({user: instructor._id});
                N_INSTRUCTORS.push(instructor);
            }
            let levels = ['Basico',
                'Intermedio',
                'Avanzado'];
            let N_LEVELS = [];
            for (const level of levels) {
                let count_course = await models.Course.count({level: level});
                N_LEVELS.push({
                    name: level,
                    count_course: count_course,
                });
            }
            let idiomas = ['Ingles',
                'Español',
                'Portugues',
                'Aleman'];
            let N_IDIOMAS = [];
            for (const idioma of idiomas) {
                let count_course = await models.Course.count({idioma: idioma});
                N_IDIOMAS.push({
                    name: idioma,
                    count_course: count_course,
                });
            }
            res.status(200).json({
                categories: N_CATEGORIES,
                instructores: N_INSTRUCTORS,
                levels: N_LEVELS,
                idiomas: N_IDIOMAS,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN ERROR'
            });
        }
    }
}