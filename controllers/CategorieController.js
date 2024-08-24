import models from "../models";
import resource from "../resource";

import fs from 'fs'
import path from 'path'

export default {
    register: async(req,res) => {
        try {
            
            var VALID_CATEGORIE = await models.Categorie.findOne({title: req.body.title});
            if(VALID_CATEGORIE){
                res.status(200).json({
                    message: 403,
                    message_text: 'LA CATEGORIA YA EXISTE'
                });
                return;
            }

            if(req.files && req.files.imagen){
                var img_path = req.files.imagen.path;// uploads\\carpeta\\fdfdfd.jpg uploads/carpeta//fdfdfd.jpg
                var name = '';
                if(process.env.PRODUCTION == 'FALSE'){
                    name = img_path.split("\\");
                }else{
                    name = img_path.split( /[/]/);
                }
                var imagen_name = name[2];
                req.body.imagen = imagen_name;
            }

            var NewCategorie = await models.Categorie.create(req.body);

            res.status(200).json({
                categorie: resource.Categorie.api_resource_categorie(NewCategorie),
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Hubo un error'
            });
        }
    },
    update: async(req,res) => {
        try {
            // TITLE
            // NUEVA IMAGEN
            // _ID
            // STATE
            var VALID_CATEGORIE = await models.Categorie.findOne({title: req.body.title, _id: {$ne: req.body._id}});
            if(VALID_CATEGORIE){
                res.status(200).json({
                    message: 403,
                    message_text: 'LA CATEGORIA YA EXISTE'
                });
                return;
            }

            if(req.files && req.files.imagen){
                var img_path = req.files.imagen.path;// uploads\\carpeta\\fdfdfd.jpg
                var name = '';
                if(process.env.PRODUCTION == 'FALSE'){
                    name = img_path.split("\\");
                }else{
                    name = img_path.split( /[/]/);
                }
                var imagen_name = name[2];
                req.body.imagen = imagen_name;
            }

            var EditCategorie = await models.Categorie.findByIdAndUpdate({_id: req.body._id},req.body);

            var NEditCategorie = await models.Categorie.findById({_id: EditCategorie._id});
            res.status(200).json({
                categorie: resource.Categorie.api_resource_categorie(NEditCategorie),
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Hubo un error'
            });
        }
    },
    list: async(req,res) => {
        try {
            var search = req.query.search;
            var state = req.query.state;
            
            var filter = [
                {"title": new RegExp('', "i")},
            ];

            if(search){
                filter = [
                    {"title": new RegExp(search, "i")},
                ];
            }
            if(state){
                if(!search){
                    filter = [];
                }
                filter = [
                    {"state": state},
                ];
            }
            var CategorieList = await models.Categorie.find({
                $or: filter
            }).sort({"createdAt": -1});

            CategorieList = await CategorieList.map((categorie) => {
                return resource.Categorie.api_resource_categorie(categorie);
            });

            res.status(200).json({
                categories: CategorieList,
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Hubo un error'
            });
        }
    },
    remove: async(req,res) => {
        try {
            var Categorie = await models.Categorie.findByIdAndRemove({_id: req.params["id"]});
            // Y ES VALIDAR SI EN CASO ESTA CATEGORIA YA ESTA ASIGNADA A UN CURSO ENTONCES NO SE PUEDE
            // ELIMINAR
            res.status(200).json({
                message: 'La categoria se elimino correctamente'
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Hubo un error'
            });
        }
    },
    get_imagen:async(req,res) => {
        try {
            var img = req.params["img"];
            if(!img){
                res.status(500).send({
                    message: 'OCURRIO UN PROBLEMA'
                });
            }else{
                fs.stat('./uploads/categorie/'+img, function(err) {
                    if(!err){
                        let path_img = './uploads/categorie/'+img;
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
                message: 'OCURRIO UN PROBLEMA'
            });
        }
    },
}