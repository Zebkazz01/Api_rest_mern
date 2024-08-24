import models from "../models";
import resource from "../resource";

import fs from 'fs'
import path from 'path'

const TOKEN_VIMEO = "48f30f67cab88cff9c7383ffe74f9cd9";
const CLIENT_ID_VIMEO = "9f3479857194c726c43951cad7f34400962c1a90";
const CLIENT_SECRET_VIMEO = "mJHH/4JQmh6XDVpQgEk2pIHynFP0XlKNb9xTc11SJ1woGhg/+3ZOwQMRjbYvxMKpOcPqkkZE6pa98nWqNAE0bZDnvu0BoihAQ+4rZTA1cZgBKUrrTeXrZZDGMlXc/KZl";

import { Vimeo } from '@vimeo/vimeo'

const CLIENT_VIMEO = new Vimeo(CLIENT_ID_VIMEO,CLIENT_SECRET_VIMEO,TOKEN_VIMEO);

async function UploadVideoVimeo(PathFile, VideoMetaDato) {
    return new Promise((resolve,reject) => {
        CLIENT_VIMEO.upload(
            PathFile,
            VideoMetaDato,
            function (url) {
                resolve({
                    message: 200,
                    value: url,
                });
            },
            // DEBE IR UNA FUNCION
            function (bytesUploaded, bytesTotal) {
                const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                console.log('Progreso de subida: ' + percentage + '%');
            },
            function (err) {
                console.log("Error al subir el video: ",err);
                reject({
                    message: 403,
                    message_text: "ERROR AL SUBIR EL VIDEO A VIMEO"
                });
            },
        )
    })
}

export default {
    register: async(req,res) => {
        try {
            
            let IS_VALID_COURSE = await models.Course.findOne({title: req.body.title});
            if(IS_VALID_COURSE){
                res.status(200).json({
                    message: 403,
                    message_text: "EL CURSO INGRESADO YA EXISTE, INTENTE CON OTRO TITULO"
                });
                return;
            }

            req.body.slug = req.body.title.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');

            if(req.files.portada){
                var img_path = req.files.portada.path;
                var name = '';
                if(process.env.PRODUCTION == 'FALSE'){
                    name = img_path.split("\\");
                }else{
                    name = img_path.split( /[/]/);
                }
                var imagen_name = name[2];
                req.body.imagen = imagen_name;
            }

            let NewCourse = await models.Course.create(req.body);

            res.status(200).json({
                message: "EL CURSO SE REGISTRO CORRECTAMENTE"
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    update: async(req,res) => {
        try {
            let IS_VALID_COURSE = await models.Course.findOne({title: req.body.title, _id: {$ne: req.body._id}});
            if(IS_VALID_COURSE){
                res.status(200).json({
                    message: 403,
                    message_text: "EL CURSO INGRESADO YA EXISTE, INTENTE CON OTRO TITULO"
                });
                return;
            }

            req.body.slug = req.body.title.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');

            if(req.files.portada){
                var img_path = req.files.portada.path;
                var name = '';
                if(process.env.PRODUCTION == 'FALSE'){
                    name = img_path.split("\\");
                }else{
                    name = img_path.split( /[/]/);
                }
                var imagen_name = name[2];
                req.body.imagen = imagen_name;
            }

            let EditCourse = await models.Course.findByIdAndUpdate({_id: req.body._id},req.body);

            res.status(200).json({
                message: "EL CURSO SE EDITO CORRECTAMENTE"
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    list: async(req,res) => {
        try {
            
            let search = req.query.search;
            let state = req.query.state;
            let categorie = req.query.categorie;

            let filter = [
                {"title": new RegExp('',"i") },
            ];

            if(search){
                filter = [];
                filter.push(
                    {"title": new RegExp(search,"i") },
                );
            }

            if(state){
                filter.push(
                    {"state": state },
                );
            }

            if(categorie){
                filter.push(
                    {"categorie": categorie },
                );
            }

            let courses = await models.Course.find({
                $and: filter,
            }).populate(["categorie","user"]);

            courses = courses.map((course) => {
                return resource.Course.api_resource_course(course);
            });

            res.status(200).json({
                courses: courses,//NECESITAMOS PASARLE EL API RESOURCE
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    config_all: async(req,res) => {
        try {
            
            let Categories = await models.Categorie.find({state: 1});

            Categories = Categories.map((categorie) => {
                return {
                    _id: categorie._id,
                    title: categorie.title,
                }
            })

            let Users = await models.User.find({state: 1,rol: 'instructor'});

            Users = Users.map((user) => {
                return {
                    _id: user._id,
                    name: user.name,
                    surname: user.surname,
                }
            })
            res.status(200).json({
                categories: Categories,
                users: Users,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    show_course: async(req,res) => {
        try {
            let course_id = req.params["id"];
            let Course = await models.Course.findById({_id: course_id});

            
            res.status(200).json({
                course: resource.Course.api_resource_course(Course),
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    remove: async(req,res) => {
        try {
            // EL CURSO NO SE PUEDE ELIMINAR SI YA TIENE UNA VENTA REALIZADA

            let Course = await models.Course.findByIdAndRemove({_id: req.params.id});

            // await models.SaleDetail.find({course: Course._id})
            let CourSale = null;
            if(CourSale){
                res.status(200).send({
                    message: 'EL CURSO NO SE PUEDE ELIMINAR, PORQUE YA TIENE VENTAS',
                    code: 403,
                });
            }else{
                res.status(200).send({
                    message: 'EL CURSO SE ELIMINO CORRECTAMENTE',
                    code: 200,
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    get_imagen: async(req,res) => {
        try {
            var img = req.params["img"];
            if(!img){
                res.status(500).send({
                    message: 'OCURRIO UN PROBLEMA'
                });
            }else{
                fs.stat('./uploads/course/'+img, function(err) {
                    if(!err){
                        let path_img = './uploads/course/'+img;
                        res.status(200).sendFile(path.resolve(path_img));
                    }else{
                        let path_img = './uploads/default.jpg';
                        res.status(200).sendFile(path.resolve(path_img));
                    }
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    upload_vimeo: async(req,res) => {
        try {
            let PathFile = req.files.video.path;
            console.log(PathFile);
            let VideoMetaDato = {
                name: 'Video de prueba',
                description: 'Es un video para saber si la integración es correcta',
                privacy:{
                    view: 'anybody'
                }
            }
            let vimeo_id_result = '';
            const result = await UploadVideoVimeo(PathFile,VideoMetaDato);
            if(result.message == 403){
                console.log(result);
                res.status(500).send({
                    message: 'HUBO UN ERROR'
                });
            }else{
                console.log(result);
                let ARRAY_VALUES = result.value.split("/");
                // /videos/852927231
                // ["","videos","852927231"]
                vimeo_id_result = ARRAY_VALUES[2];
                let Course = await models.Course.findByIdAndUpdate({_id: req.body._id},{
                    vimeo_id: vimeo_id_result
                })
    
                res.status(200).json({
                    message: 'LA PRUEBA FUE UN EXITO',
                    vimeo_id: "https://player.vimeo.com/video/"+vimeo_id_result,
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    }
}