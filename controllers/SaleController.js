import models from "../models";
import token from "../service/token";

import fs from 'fs';
import handlebars from 'handlebars';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';

async function send_email (sale_id) {
    try {
        
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };

        let SALE_ID = sale_id;

        let Orden = await models.Sale.findById({_id: SALE_ID}).populate("user");
        let OrdenDetail = await models.SaleDetail.find({sale: Orden._id}).populate({
            path: 'course',
            populate: {
                path: "categorie"
            }
        });

        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
            user: 'echodeveloper960@gmail.com',
            pass: 'esooqzvvcccrdfxw'
            }
        }));

        
        readHTMLFile(process.cwd() + '/mails/email_sale.html', (err, html)=>{
                
            OrdenDetail = OrdenDetail.map((detail) => {
                detail.portada = process.env.URL_BACKEND+"/api/courses/imagen-course/"+detail.course.imagen;
                return detail;
            });
            let rest_html = ejs.render(html, {Orden:Orden, Orden_detail:OrdenDetail });

            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});

            var mailOptions = {
                from: 'echodeveloper960@gmail.com',
                to: 'stackdevelopers29@gmail.com',//Orden.user.email
                subject: 'Finaliza tu compra '+Orden._id,
                html: htmlToSend
            };
        
            transporter.sendMail(mailOptions, function(error, info){
                if (!error) {
                    console.log('Email sent: ' + info.response);
                }
            });

        });

    } catch (error) {
        console.log(error);
    }
}
export default {
    send_email: async(req,res) => {
        try {
            
            var readHTMLFile = function(path, callback) {
                fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                    if (err) {
                        throw err;
                        callback(err);
                    }
                    else {
                        callback(null, html);
                    }
                });
            };

            let SALE_ID = req.params._id;

            let Orden = await models.Sale.findById({_id: SALE_ID}).populate("user");
            let OrdenDetail = await models.SaleDetail.find({sale: Orden._id}).populate({
                path: 'course',
                populate: {
                    path: "categorie"
                }
            });

            var transporter = nodemailer.createTransport(smtpTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                user: 'echodeveloper960@gmail.com',
                pass: 'esooqzvvcccrdfxw'
                }
            }));

            
            readHTMLFile(process.cwd() + '/mails/email_sale.html', (err, html)=>{
                    
                OrdenDetail = OrdenDetail.map((detail) => {
                    detail.portada = process.env.URL_BACKEND+"/api/courses/imagen-course/"+detail.course.imagen;
                    return detail;
                });
                let rest_html = ejs.render(html, {Orden:Orden, Orden_detail:OrdenDetail });

                var template = handlebars.compile(rest_html);
                var htmlToSend = template({op:true});

                var mailOptions = {
                    from: 'echodeveloper960@gmail.com',
                    to: 'stackdevelopers29@gmail.com',
                    subject: 'Finaliza tu compra '+Orden._id,
                    html: htmlToSend
                };
            
                transporter.sendMail(mailOptions, function(error, info){
                    if (!error) {
                        console.log('Email sent: ' + info.response);
                    }
                });

            });

            res.status(200).json({
                message: 'TODO OK'
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'HUBO UN ERROR',
            });
        }
    },
    register: async(req,res) => {
        try {
            
            let user = await token.decode(req.headers.token);

            req.body.user = user._id;
            let Sale = await models.Sale.create(req.body);

            let Carts = await models.Cart.find({user: user._id});

            for (let Cart of Carts) {
                Cart = Cart.toObject();
                Cart.sale = Sale._id;
                await models.SaleDetail.create(Cart);
                // LA HABILITACION DEL CURSO AL ESTUDIANTE QUE SE HA INSCRITO
                await models.CourseStudent.create({
                    user: user._id,
                    course: Cart.course
                });
                // 
                await models.Cart.findByIdAndDelete({_id: Cart._id});
            }

            // IRIA EL ENVIO DE EMAIL
            await send_email(Sale._id);

            res.status(200).json({
                message: 'LA ORDEN SE GENERO CORRECTAMENTE',
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'OCURRIO UN PROBLEMA'
            });
        }
    }
}