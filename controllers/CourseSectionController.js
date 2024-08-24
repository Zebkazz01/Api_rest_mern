import models from "../models";
import resource from "../resource";

export default {
    register: async(req,res) => {
        try {
            // course 1
                // desarrollo del backend
            // course 2
                // desarrollo del backend
            var VALID_SECTION = await models.CourseSection.findOne({title: req.body.title,course: req.body.course});
            if(VALID_SECTION){
                res.status(200).json({
                    message: 403,
                    message_text: 'LA SECCIÓN YA EXISTE'
                });
                return;
            }

            var NewSection = await models.CourseSection.create(req.body);

            res.status(200).json({
                section: NewSection,
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
            var VALID_SECTION = await models.CourseSection.findOne({
                title: req.body.title,
                course: req.body.course,
                _id: {$ne : req.body._id}
            });
            if(VALID_SECTION){
                res.status(200).json({
                    message: 403,
                    message_text: 'LA SECCIÓN YA EXISTE'
                });
                return;
            }

            var EditCourseSection = await models.CourseSection.findByIdAndUpdate(
                                {_id: req.body._id},
                                req.body);

            var NEditCourseSection = await models.CourseSection.findById({_id: EditCourseSection._id});
            res.status(200).json({
                section: NEditCourseSection,
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
            let course_id = req.query.course_id;
            var CourseSections = await models.CourseSection.find({
                course: course_id
            }).sort({"createdAt": -1});

            var FormatCourseSection = [];
            for (var CourseSection of CourseSections) {
                CourseSection = CourseSection.toObject();

                var Clases = await models.CourseClase.find({section: CourseSection._id});
                CourseSection.num_clases = Clases.length;
                FormatCourseSection.push(CourseSection);
            }

            res.status(200).json({
                sections: FormatCourseSection,
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
            var CourseSection = await models.CourseSection.findByIdAndRemove({_id: req.params["id"]});
            // Y ES VALIDAR SI EN CASO ESTA CATEGORIA YA ESTA ASIGNADA A UN CURSO ENTONCES NO SE PUEDE
            // ELIMINAR
            res.status(200).json({
                message: 'La sección se elimino correctamente'
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Hubo un error'
            });
        }
    },
}