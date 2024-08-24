export default {
    api_resource_categorie: (categorie,count_courses=0) => {
        return {
            _id: categorie._id,
            title:categorie.title,
            imagen: categorie.imagen ? process.env.URL_BACKEND+"/api/categories/imagen-categorie/"+categorie.imagen : null,
            state:categorie.state,
            count_courses: count_courses,
        }
    },
}