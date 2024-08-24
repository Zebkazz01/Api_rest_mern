import models from "../models";

export default {
    register: async(req,res) => {
        try {
            
            let valid_cupone = await models.Cupone.findOne({code: req.body.code});

            if(valid_cupone){
                res.status(200).json({
                    message: 403,
                    message_text: "EL CODIGO DEL CUPON YA EXISTE",
                });
                return;
            }

            let cupone = await models.Cupone.create(req.body);

            res.status(200).json({
                message_text: "EL CUPON SE REGISTRO CORRECTAMENTE",
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'Hubo un error'
            });
        }
    },
    update: async(req,res) => {
        try {
            let valid_cupone = await models.Cupone.findOne({
                code: req.body.code,
                _id: {$ne: req.body._id}
            });

            if(valid_cupone){
                res.status(200).json({
                    message: 403,
                    message_text: "EL CODIGO DEL CUPON YA EXISTE",
                });
                return;
            }

            let cupone = await models.Cupone.findByIdAndUpdate({_id: req.body._id},req.body);

            res.status(200).json({
                message_text: "EL CUPON SE ACTUALIZO CORRECTAMENTE",
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'Hubo un error'
            });
        }
    },
    list: async(req,res) => {
        try {
            let search = req.query.search;
            let state = req.query.state;

            let filter = [
                {"code": new RegExp('', "i")},
            ];

            if(search){
                filter = [
                    {"code": new RegExp(search, "i")},
                ];
            }

            if(state){
                if(!search){
                    filter = [];
                }
                filter.push({
                    "state": state,
                });
            }

            let cupones = await models.Cupone.find({
                $and: filter,
                // [
                //     {"code": new RegExp(search, "i")},
                // ]
            }).sort({"createdAt": -1});

            res.status(200).json({
                cupones: cupones,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'Hubo un error'
            });
        }
    },
    show_cupone: async(req,res) => {
        try {
            let cupone_id = req.params.id ;
            let cupon = await models.Cupone.findOne({_id: cupone_id});

            res.status(200).json({
                cupon: cupon
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'Hubo un error'
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
                message: 'Hubo un error'
            });
        }
    },
    remove: async(req,res) => {
        try {
            let _id = req.params.id;
            let cupone = await models.Cupone.findByIdAndDelete({_id: _id});

            res.status(200).json({
                message: "EL CUPON  SE HA ELIMINADO CORRECTAMENTE",
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'Hubo un error'
            });
        }
    },
}