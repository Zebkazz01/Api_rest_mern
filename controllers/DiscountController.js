import models from "../models";

export default {
    register: async(req,res) => {
        try {
            let data = req.body;
            let filterA = [];// PARA ENCONTRAR CONCIDENCIA A NIVEL DE FECHA DE INICIO
            let filterB = [];// PARA ENCONTRAR CONCIDENCIA A NIVEL DE FECHA DE FIN
            // courses_s = ["dasdasdasd","dasdasdasdas"] [{_id: laravel y angular },{_id: vue y laravel}]
            // categories_s = ["dasdasdasd","dasdasdasdas"]
            if(data.type_segment == 1){//CURSOS
                // FILTRAR POR CURSOS EXISTENTE EN OTRAS CAMPAÑA DE DESCUENTO
                filterA.push({
                    "courses" : {$elemMatch: {_id: {$in: data.courses_s} }}
                })
                filterB.push({
                    "courses" : {$elemMatch: {_id: {$in: data.courses_s} }}
                })
            }else{//CATEGORIAS
                // FILTRAR POR CATEGORIAS EXISTENTE EN OTRAS CAMPAÑA DE DESCUENTO
                filterA.push({
                    "categories" : {$elemMatch: {_id: {$in: data.categories_s} }}
                })
                filterB.push({
                    "categories" : {$elemMatch: {_id: {$in: data.categories_s} }}
                })
            }

            // nos falta
            filterA.push({
                type_campaign: data.type_campaign,
                start_date_num: {$gte: data.start_date_num,$lte: data.end_date_num},
            });

            filterB.push({
                type_campaign: data.type_campaign,
                end_date_num: {$gte: data.start_date_num,$lte: data.end_date_num},
            });

            let exists_start_date = await models.Discount.find({$and: filterA});

            let exists_end_date = await models.Discount.find({$and: filterB});

            if(exists_start_date.length > 0 || exists_end_date.length > 0){
                res.status(200).json({
                    message: 403,
                    message_text: "EL DESCUENTO NO SE PUEDE REGISTRAR PORQUE HAY DUPLICIDAD"
                });
                return;
            }
            // registrar el descuento

            let discount = await models.Discount.create(data);

            res.status(200).json({
                message: 200,
                message_text: "EL DESCUENTO SE REGISTRO CORRECTAMENTE",
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
        }
    },
    update: async(req,res) => {
        try {
            let data = req.body;
            let filterA = [];// PARA ENCONTRAR CONCIDENCIA A NIVEL DE FECHA DE INICIO
            let filterB = [];// PARA ENCONTRAR CONCIDENCIA A NIVEL DE FECHA DE FIN
            // courses_s = ["dasdasdasd","dasdasdasdas"] [{_id: laravel y angular },{_id: vue y laravel}]
            // categories_s = ["dasdasdasd","dasdasdasdas"]
            if(data.type_segment == 1){//CURSOS
                // FILTRAR POR CURSOS EXISTENTE EN OTRAS CAMPAÑA DE DESCUENTO
                filterA.push({
                    "courses" : {$elemMatch: {_id: {$in: data.courses_s} }}
                })
                filterB.push({
                    "courses" : {$elemMatch: {_id: {$in: data.courses_s} }}
                })
            }else{//CATEGORIAS
                // FILTRAR POR CATEGORIAS EXISTENTE EN OTRAS CAMPAÑA DE DESCUENTO
                filterA.push({
                    "categories" : {$elemMatch: {_id: {$in: data.categories_s} }}
                })
                filterB.push({
                    "categories" : {$elemMatch: {_id: {$in: data.categories_s} }}
                })
            }

            // nos falta
            filterA.push({
                type_campaign: data.type_campaign,
                _id: {$ne: data._id},
                start_date_num: {$gte: data.start_date_num,$lte: data.end_date_num},
            });

            filterB.push({
                type_campaign: data.type_campaign,
                _id: {$ne: data._id},
                end_date_num: {$gte: data.start_date_num,$lte: data.end_date_num},
            });

            let exists_start_date = await models.Discount.find({$and: filterA});

            let exists_end_date = await models.Discount.find({$and: filterB});

            if(exists_start_date.length > 0 || exists_end_date.length > 0){
                res.status(200).json({
                    message: 403,
                    message_text: "EL DESCUENTO NO SE PUEDE REGISTRAR PORQUE HAY DUPLICIDAD"
                });
                return;
            }
            // registrar el descuento

            let discount = await models.Discount.findByIdAndUpdate({_id: data._id},data);

            res.status(200).json({
                message: 200,
                message_text: "EL DESCUENTO SE EDITO CORRECTAMENTE",
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
        }
    },
    list: async(req,res) => {
        try {

            let discounts = await models.Discount.find().sort({"createdAt": -1});

            res.status(200).json({
                discounts: discounts,
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
        }
    },
    show_discount: async(req,res) => {
        try {
            let discount_id = req.params.id;

            let discount = await models.Discount.findById({_id: discount_id});

            res.status(200).json({
                discount: discount
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
        }
    },
    config_all: async(req,res) => {
        try {
            let courses = await models.Course.find({state: 2}).populate("categorie");
            let categories = await models.Categorie.find({state : 1});

            courses = courses.map((course) => {
                return {
                    _id: course._id,
                    title: course.title,
                    price_usd: course.price_usd,
                    imagen: process.env.URL_BACKEND+"/api/courses/imagen-course/"+course.imagen,
                    categorie: {
                        _id: course.categorie._id,
                        title: course.categorie.title,
                    },
                };
            })
            categories = categories.map((categorie) => {
                return {
                    _id: categorie._id,
                    title:categorie.title,
                    imagen: categorie.imagen ? process.env.URL_BACKEND+"/api/categories/imagen-categorie/"+categorie.imagen : null,
                };
            })

            res.status(200).json({
                courses: courses,
                categories: categories,
            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
        }
    },
    remove: async(req,res) => {
        try {
            let discount_id = req.params.id;

            await models.Discount.findByIdAndDelete({_id: discount_id});

            res.status(200).json({
                message: "EL DESCUENTO SE HA ELIMINADO EXITOSAMENTE",
            });

        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN ERROR"
            });
        }
    },
}