import mongoose,{Schema} from "mongoose";

const CourseClaseSchema = new Schema({
    title: {type: String,maxlength: 250,required:true},
    section: {type: Schema.ObjectId, ref: 'course_section',required:true},
    vimeo_id: {type: String,required:false},
    time: {type: String,required:false},//YA QUE ES LA DURACIÓN DE LA CLASE Y VA ESTAR GUARDAD EN ESTE FORMATO 00:00:00
    description: {type: String,required:true},
    state: {type:Number,maxlength: 1,default: 1}, // 1 es activo y 2 inactivo
},{
    timestamps: true
});

const CourseClase = mongoose.model("course_clase",CourseClaseSchema);
export default CourseClase;