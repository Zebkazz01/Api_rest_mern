export default {
    api_cart_list: (cart) => {
        return {
            _id: cart._id,
            user: cart.user,
            course: {
                _id: cart.course._id,
                title: cart.course.title,
                slug: cart.course.slug,
                imagen: process.env.URL_BACKEND+"/api/courses/imagen-course/"+cart.course.imagen,
                categorie: {
                    _id: cart.course.categorie._id,
                    title: cart.course.categorie.title,
                },
                price_soles: cart.course.price_soles,
                price_usd: cart.course.price_usd,
            },
            type_discount: cart.type_discount,
            discount: cart.discount,
            campaign_discount: cart.campaign_discount,
            code_cupon: cart.code_cupon,
            code_discount: cart.code_discount,
            price_unit: cart.price_unit,
            subtotal: cart.subtotal,
            total: cart.total,
        }
    },
}