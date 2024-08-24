import models from "../models";
import resource from "../resource";
import getVideoDurationInSeconds from 'get-video-duration';

const TOKEN_VIMEO = "48f30f67cab88cff9c7383ffe74f9cd9";
const CLIENT_ID_VIMEO = "9f3479857194c726c43951cad7f34400962c1a90";
const CLIENT_SECRET_VIMEO = "mJHH/4JQmh6XDVpQgEk2pIHynFP0XlKNb9xTc11SJ1woGhg/+3ZOwQMRjbYvxMKpOcPqkkZE6pa98nWqNAE0bZDnvu0BoihAQ+4rZTA1cZgBKUrrTeXrZZDGMlXc/KZl";

import { Vimeo } from '@vimeo/vimeo'

const CLIENT_VIMEO = new Vimeo(CLIENT_ID_VIMEO,CLIENT_SECRET_VIMEO,TOKEN_VIMEO);

import fs from 'fs'
import path from 'path'

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

function formatarDuracion(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);
  
    const formattedHours = String(hours).padStart(2, '0');//1 2 3 "03" "03:04:05"
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
// ["00:00:10","01:10:10","00:50:10"]
// "00:00:10" [00,00,10] 1 horas 2 minutos y 30 segundos
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
//   00:00:00
// 25 segundos
export default {
    register: async(req,res) => {
        try {
            // course 1
                // desarrollo del backend
            // course 2
                // desarrollo del backend
            var VALID_CLASE = await models.CourseClase.findOne({title: req.body.title,section: req.body.section});
            if(VALID_CLASE){
                res.status(200).json({
                    message: 403,
                    message_text: 'LA CLASE YA EXISTE'
                });
                return;
            }

            var NewClase = await models.CourseClase.create(req.body);

            res.status(200).json({
                clase: NewClase,
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
            // course 1
                // desarrollo del backend
            // course 2
                // desarrollo del backend
                 // STATUS  
            var VALID_CLASE = await models.CourseClase.findOne({
                title: req.body.title,
                section: req.body.section,
                _id: {$ne : req.body._id}
            });
            if(VALID_CLASE){
                res.status(200).json({
                    message: 403,
                    message_text: 'LA CLASE YA EXISTE'
                });
                return;
            }

            var EditCourseClase = await models.CourseClase.findByIdAndUpdate(
                                {_id: req.body._id},
                                req.body);

            var NEditCourseClase = await models.CourseClase.findById({_id: EditCourseClase._id});
            res.status(200).json({
                clase: NEditCourseClase,
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
            let section_id = req.query.section_id;
            var CourseClases = await models.CourseClase.find({
                section: section_id,
            }).sort({"createdAt": -1});

            var NewCourseClases = [];
            for (var CourseClase of CourseClases) {
                CourseClase = CourseClase.toObject();
                let ClaseFiles = await models.CourseClaseFile.find({clase: CourseClase._id});
                console.log(ClaseFiles);
                CourseClase.files = []
                for (const ClaseFile of ClaseFiles) {
                    CourseClase.files.unshift({
                        _id: ClaseFile._id,
                        file: process.env.URL_BACKEND+"/api/course_clase/file-clase/"+ClaseFile.file,
                        file_name: ClaseFile.file_name,
                        size: ClaseFile.size,
                        clase: ClaseFile.clase,
                    })
                }
                console.log(CourseClase.files);
                CourseClase.vimeo_id = CourseClase.vimeo_id ? "https://player.vimeo.com/video/"+CourseClase.vimeo_id : null;
                let time_clase = [CourseClase.time];//NUEVO
                const tiempoTotal = CourseClase.time ? sumarTiempos(...time_clase) : 0;
                CourseClase.time_parse = tiempoTotal;
                NewCourseClases.unshift(CourseClase);
            }
            // CourseClases = CourseClases.map((clase) => {
            //     clase.vimeo_id = clase.vimeo_id ? "https://player.vimeo.com/video/"+clase.vimeo_id : null;
            //     return clase;
            // })
            res.status(200).json({
                clases: NewCourseClases,
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
            var CourseClase = await models.CourseClase.findByIdAndRemove({_id: req.params["id"]});
            // Y ES VALIDAR SI EN CASO ESTA CATEGORIA YA ESTA ASIGNADA A UN CURSO ENTONCES NO SE PUEDE
            // ELIMINAR
            res.status(200).json({
                message: 'La clase se elimino correctamente'
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Hubo un error'
            });
        }
    },
    upload_vimeo: async(req,res) => {
        try {
            let PathFile = req.files.video.path;
            console.log(PathFile);

            getVideoDurationInSeconds(PathFile).then(async (duration) => {
                console.log(duration);
                console.log(formatarDuracion(duration))
                let DURATION = formatarDuracion(duration);
                let VideoMetaDato = {
                    name: 'Video de la clase',
                    description: 'El video de la clase seleccionada',
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
                    let Course = await models.CourseClase.findByIdAndUpdate({_id: req.body._id},{
                        vimeo_id: vimeo_id_result,
                        time: DURATION,
                    })
        
                    res.status(200).json({
                        message: 'LA PRUEBA FUE UN EXITO',
                        vimeo_id: "https://player.vimeo.com/video/"+vimeo_id_result,
                    });
                }

             })

        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR'
            });
        }
    },
    register_file: async(req,res) => {
        try {
            if(req.files && req.files.recurso){
                var img_path = req.files.recurso.path;
                var name = img_path.split('\\');
                var recurso_name = name[3];
                // console.log(img_path,name,recurso_name);
                req.body.file = recurso_name;
            }
            const ClaseFile = await models.CourseClaseFile.create(req.body);

            res.status(200).json({
                file : {
                    _id: ClaseFile._id,
                    file: process.env.URL_BACKEND+"/api/course_clase/file-clase/"+ClaseFile.file,
                    file_name: ClaseFile.file_name,
                    size: ClaseFile.size,
                    clase: ClaseFile.clase,
                },
                message: 'SE HA REGISTRADO EL RECURSO DESCARGABLE',
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN PROBLEMA'
            });
        }
    },
    delete_file: async(req,res) => {
        try {
            let file_id = req.params.id;

            const CLaseFile = await models.CourseClaseFile.findByIdAndDelete({_id: file_id});

            res.status(200).json({
                message: 'SE HA ELIMINADO EL RECURSO DESCARGABLE',
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN PROBLEMA'
            });
        }
    },
    get_file_clase:async(req,res) => {
        try {
            var fileT = req.params["file"];
            if(!fileT){
                res.status(500).send({
                    message: 'OCURRIO UN PROBLEMA'
                });
            }else{
                fs.stat('./uploads/course/files/'+fileT, function(err) {
                    if(!err){
                        let path_img = './uploads/course/files/'+fileT;
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