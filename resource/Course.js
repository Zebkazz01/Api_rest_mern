function formDateToYM(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2,'0');//07 08 09

    const day =  String(date.getDate()).padStart(2,'0');// 2 ,3 ,4
    return month+"/"+year; // 01/03/2023
}
export default {
    api_resource_course: (course,DISCOUNT_G=null,N_CLASES=0,
        N_STUDENTS = 0, N_REVIEWS = 0, AVG_RATING = 0) => {
        return {
            _id: course._id,
            title: course.title,
            slug: course.slug,
            imagen: process.env.URL_BACKEND+"/api/courses/imagen-course/"+course.imagen,
            categorie: {
                _id: course.categorie._id,
                title: course.categorie.title,
            },
            user: {
                _id: course.user._id,
                name: course.user.name,
                surname:course.user.surname,
                profession: course.user.profession,
                avatar: course.user.avatar ? process.env.URL_BACKEND+"/api/users/imagen-usuario/"+course.user.avatar : null,
            },
            subtitle: course.subtitle,
            description: course.description,
            vimeo_id: course.vimeo_id ? "https://player.vimeo.com/video/"+course.vimeo_id : null,
            level: course.level,
            idioma: course.idioma,
            price_soles: course.price_soles,
            price_usd: course.price_usd,
            state: course.state,
            requirements: JSON.parse(course.requirements),
            who_is_it_for: JSON.parse(course.who_is_it_for),
            discount_g : DISCOUNT_G,
            n_clases : N_CLASES,
            n_students: N_STUDENTS,
            n_reviews: N_REVIEWS,
            avg_rating: AVG_RATING,
        }
    },
    api_resource_course_landing: (course,DISCOUNT_G = null,MALLA_CURRICULAR = [],TIME_TOTAL_COURSE=0,
        FILES_TOTAL_SECTIONS = 0,COUNT_COURSE_INSTRUCTOR = 0,NUMERO_TOTAL_CLASES=0,N_STUDENTS = 0,
        AVG_RATING =0, NUM_REVIEW = 0,N_STUDENTS_SUM_TOTAL = 0,NUM_REVIEW_SUM_TOTAL= 0, AVG_RATING_INSTRUCTOR = 0) => {
        return {
            _id: course._id,
            title: course.title,
            slug: course.slug,
            imagen: process.env.URL_BACKEND+"/api/courses/imagen-course/"+course.imagen,
            categorie: {
                _id: course.categorie._id,
                title: course.categorie.title,
            },
            user: {
                _id: course.user._id,
                name: course.user.name,
                surname:course.user.surname,
                full_name: course.user.name + ' ' + course.user.surname,
                profession: course.user.profession,
                description: course.user.description,
                count_course: COUNT_COURSE_INSTRUCTOR,
                n_students: N_STUDENTS_SUM_TOTAL,
                num_review: NUM_REVIEW_SUM_TOTAL,
                avg_rating: AVG_RATING_INSTRUCTOR,
                avatar: course.user.avatar ? process.env.URL_BACKEND+"/api/users/imagen-usuario/"+course.user.avatar : null,
            },
            subtitle: course.subtitle,
            description: course.description,
            vimeo_id: course.vimeo_id ? "https://player.vimeo.com/video/"+course.vimeo_id : null,
            level: course.level,
            idioma: course.idioma,
            price_soles: course.price_soles,
            price_usd: course.price_usd,
            state: course.state,
            requirements: JSON.parse(course.requirements),
            who_is_it_for: JSON.parse(course.who_is_it_for),
            discount_g : DISCOUNT_G,
            malla_curricular: MALLA_CURRICULAR,
            time_parse : TIME_TOTAL_COURSE,
            files_count: FILES_TOTAL_SECTIONS,
            num_clases: NUMERO_TOTAL_CLASES,
            n_students: N_STUDENTS,
            avg_rating: AVG_RATING,
            num_review: NUM_REVIEW,
            updated_date: formDateToYM(course.updatedAt)
        };
    },
}