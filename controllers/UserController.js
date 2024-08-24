import models from '../models'
import bcrypt from 'bcryptjs'
import token from '../service/token'
import resource from '../resource'

import fs from 'fs'
import path from 'path'

export default {
    register: async(req,res) => {
        try {

            const VALID_USER = await models.User.findOne({email: req.body.email});

            if(VALID_USER){
                res.status(200).json({
                    message: 403,
                    message_text: "EL USUARIO INGRESADO YA EXISTE",
                });
            }

            // ENCRIPTACIÓN DE CONTRASEÑA 12345678 -> fhjsdhf34j534jbj34bf34
            req.body.password = await bcrypt.hash(req.body.password,10);

            // const newUser = new models.User();
            // newUser.rol = req.body.role
            // newUser.name = req.body.nombre
            // newUser.surname = req.body.apellido
            // newUser.email = req.body.correo
            // newUser.password = req.body.contraseña
            // newUser.save();

            const User = await models.User.create(req.body);
            res.status(200).json({
                user: User,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "OCURRIO UN PROBLEMA"
            });
        }
    },
    login: async(req,res) => {
        try {
            // email y contraseña
            // req.body.email y req.body.password
            const user = await models.User.findOne({
                email: req.body.email,
                state: 1,
            });
            if(user){
                // COMPARAR LAS CONTRASEÑA
                let compare = await bcrypt.compare(req.body.password,user.password);
                if(compare){
                    // UN USUARIO EXISTENTE Y ACTIVO
                    let tokenT = await token.encode(user._id,user.rol,user.email);

                    const USER_BODY = {
                        token: tokenT,
                        user: {
                            name: user.name,
                            surname: user.surname,
                            email: user.email,
                            // avatar: user.avatar 
                        }
                    }
                    res.status(200).json({
                        USER: USER_BODY,
                    });
                }else{
                    res.status(500).send({
                        message: 'EL USUARIO INGRESADO NO EXISTE',
                    });
                }
            }else{
                res.status(500).send({
                    message: 'EL USUARIO INGRESADO NO EXISTE',
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR',
            });
        }
    },
    login_admin: async(req,res) => {
        try {
            // email y contraseña
            // req.body.email y req.body.password
            const user = await models.User.findOne({
                email: req.body.email,
                state: 1,
                rol: 'admin'
            });
            if(user){
                // COMPARAR LAS CONTRASEÑA
                let compare = await bcrypt.compare(req.body.password,user.password);
                if(compare){
                    // UN USUARIO EXISTENTE Y ACTIVO
                    let tokenT = await token.encode(user._id,user.rol,user.email);

                    const USER_BODY = {
                        token: tokenT,
                        user: {
                            name: user.name,
                            surname: user.surname,
                            email: user.email,
                            // avatar: user.avatar 
                        }
                    }
                    res.status(200).json({
                        USER: USER_BODY,
                    });
                }else{
                    res.status(500).send({
                        message: 'EL USUARIO INGRESADO NO EXISTE',
                    });
                }
            }else{
                res.status(500).send({
                    message: 'EL USUARIO INGRESADO NO EXISTE',
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR',
            });
        }
    },
    register_admin: async(req,res) => {
        try {
            const VALID_USER = await models.User.findOne({email: req.body.email});

            if(VALID_USER){
                res.status(200).json({
                    message: 403,
                    message_text: "EL USUARIO INGRESADO YA EXISTE",
                });
            }

            req.body.password = await bcrypt.hash(req.body.password,10);
            if(req.files && req.files.avatar){
                var img_path = req.files.avatar.path;// uploads\\carpeta\\fdfdfd.jpg
                var name = img_path.split("\\");
                var avatar_name = name[2];
                req.body.avatar = avatar_name;
            }
            const User = await models.User.create(req.body);
            res.status(200).json({
                user: resource.User.api_resource_user(User),
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN PROBLEMA'
            });
        }
    },
    update: async(req,res) => {
        try {
            // echo@gmail.com
            const VALID_USER = await models.User.findOne({email: req.body.email, _id: {$ne : req.body._id}});

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
                var name = '';
                if(process.env.PRODUCTION == 'FALSE'){
                    name = img_path.split("\\");
                }else{
                    name = img_path.split( /[/]/);
                }


                var avatar_name = name[2];
                req.body.avatar = avatar_name;
            }

            const User = await models.User.findByIdAndUpdate({_id: req.body._id},req.body);

            const NUser = await models.User.findById({_id: req.body._id});
            res.status(200).json({
                message: 'EL USUARIO SE EDITO CORRECTAMENTE',
                user: resource.User.api_resource_user(NUser),
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN PROBLEMA'
            });
        }
    },
    list: async(req,res) => {
        try {
            // jose
            // localhost:3000?search=JOSE( JosE)
            var search = req.query.search;
            var rol = req.query.rol;
            var filter = [
                {'name': new RegExp('', 'i')},
            ];
            if(search){
                filter = [
                    {'name': new RegExp(search, 'i')},
                    {'surname': new RegExp(search, 'i')},
                    {'email': new RegExp(search, 'i')},
                ];
            }
            if(rol){
                if(!search){
                    filter = [];
                }
                filter.push({
                    'rol': rol
                });
            }
            let USERS = await models.User.find({
                $or : filter,
                "rol": {$in: ["admin","instructor"]}
            }).sort({'createdAt': -1});

            // USERS = await USERS.map((user) => {
            //     console.log(resource.User.api_resource_user(user));
            //     return resource.User.api_resource_user(user);
            // });
            let FormatUsers = [];
            for (const USER of USERS) {
                FormatUsers.push(resource.User.api_resource_user(USER))
            }
            res.status(200).json({
                users: FormatUsers,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN PROBLEMA'
            });
        }
    },
    remove: async(req,res) => {
        try {
            let _id = req.params["id"];

            const User = await models.User.findByIdAndDelete({_id: _id});
            res.status(200).json({
                message: 'EL USUARIO SE ELIMINO CORRECTAMENTE',
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN PROBLEMA'
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
                fs.stat('./uploads/user/'+img, function(err) {
                    if(!err){
                        let path_img = './uploads/user/'+img;
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