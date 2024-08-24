export default {
    api_resource_user: (user) => {
        return {
            _id: user._id,
            name:user.name,
            surname:user.surname,
            email:user.email,
            profession:user.profession,
            description:user.description,
            rol:user.rol,
            avatar: user.avatar ? process.env.URL_BACKEND+"/api/users/imagen-usuario/"+user.avatar : null,
        }
    },
}