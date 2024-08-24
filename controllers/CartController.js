import models from "../models";
import resource from "../resource";
import token from "../service/token";

export default {
    register: async(req,res) => {
        try {
            let user = await token.decode(req.headers.token);
        
            let CART_EXIST = await models.Cart.findOne({course: req.body.course,user: user._id});
            if(CART_EXIST){
                res.status(200).json({
                    message: 403,
                    message_text: 'EL CURSO YA SE AGREGO A LISTA'
                });
                return;
            }
            req.body.user = user._id;
            console.log(req.body);
            let Cart = await models.Cart.create(req.body);

            let NewCart = await models.Cart.findById({_id: Cart._id}).populate({
                path: 'course',
                populate: {
                    path: "categorie"
                }
            });

            res.status(200).json({
                cart: resource.Cart.api_cart_list(NewCart),
                message_text: 'EL CURSO SE AGREGO CORRECTAMENTE'
            });
        } catch (error) {
            console.log(error); 
            res.status(500).send({
                message: 'OCURRIO UN ERROR',
            })
        }
    },
    update: async(req,res) => {
        try {
            // PORQUE VA FUNCIONAR COMO APLICACION DE CUPON}
            let user = await token.decode(req.headers.token);
            let CUPON = await models.Cupone.findOne({code: req.body.cupon});
            if(!CUPON){
                res.status(200).json({
                    message: 403,
                    message_text: "EL CODIGO DEL CUPON NO EXISTE",
                });
                return;
            }
            let carts = await models.Cart.find({user: user._id}).populate("course");
            let courses = [];
            let categories = [];

            CUPON.courses.forEach((course) => {
                courses.push(course._id);
            });//["123","124"]

            CUPON.categories.forEach((categorie) => {
                categories.push(categorie._id);
            })
            // ["125","126","123"]
            for (const cart of carts) {
                if(courses.length > 0){
                    if(courses.includes(cart.course._id+"")){
                        // EL % O $ D DESCUENTO
                        let subtotal = 0;
                        let total = 0;
                        if(CUPON.type_discount == 1){//% 30 40
                            subtotal = cart.price_unit - cart.price_unit*(CUPON.discount*0.01);
                        }else{//$
                            subtotal = cart.price_unit - CUPON.discount;
                        }
                        total = subtotal;
                        await models.Cart.findByIdAndUpdate({_id: cart._id},{
                            subtotal: subtotal,
                            total: total,
                            type_discount: CUPON.type_discount,
                            discount: CUPON.discount,
                            code_cupon: req.body.cupon,
                            campaign_discount: null,
                            code_discount: null,
                        });
                    }
                }
                if(categories.length > 0){
                    if(categories.includes(cart.course.categorie+"")){
                        // EL % O $ D DESCUENTO
                        let subtotal = 0;
                        let total = 0;
                        if(CUPON.type_discount == 1){//% 30 40
                            subtotal = cart.price_unit - cart.price_unit*(CUPON.discount*0.01);
                        }else{//$
                            subtotal = cart.price_unit - CUPON.discount;
                        }
                        total = subtotal;
                        await models.Cart.findByIdAndUpdate({_id: cart._id},{
                            subtotal: subtotal,
                            total: total,
                            type_discount: CUPON.type_discount,
                            discount: CUPON.discount,
                            code_cupon: req.body.cupon,
                            campaign_discount: null,
                            code_discount: null,
                        });
                    }
                }
            }

            let newCarts = await models.Cart.find({user: user._id}).populate({
                path: 'course',
                populate: {
                    path: "categorie"
                }
            });

            newCarts = newCarts.map((cart) => {
                return resource.Cart.api_cart_list(cart);
            });
            res.status(200).json({
                carts: newCarts,
                message: 200,
                message_text: "EL CUPON SE APLICADO CORRECTAMENTE"
            });
        } catch (error) {
            console.log(error); 
            res.status(500).send({
                message: 'OCURRIO UN ERROR',
            })
        }
    },
    list: async(req,res) => { 
        try {
            let user = await token.decode(req.headers.token);
            
            let CARTS = await models.Cart.find({user: user._id}).populate({
                path: 'course',
                populate: {
                    path: "categorie"
                }
            });

            CARTS = CARTS.map((cart) => {
                return resource.Cart.api_cart_list(cart);
            });
            
            res.status(200).json({
                carts: CARTS,
            })
        } catch (error) {
            console.log(error); 
            res.status(500).send({
                message: 'OCURRIO UN ERROR',
            })
        }
    },
    remove: async(req,res) => {
        try {
            let ID = req.params.id;
            let CART = await models.Cart.findByIdAndRemove({_id: ID});

            res.status(200).json({
                message: ' EL CURSO SE HA ELIMINADO DEL CARRITO DE COMPRA'
            });
        } catch (error) {
            console.log(error); 
            res.status(500).send({
                message: 'OCURRIO UN ERROR',
            })
        }
    },
}