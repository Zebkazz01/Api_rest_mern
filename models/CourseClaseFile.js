import mongoose,{Schema} from "mongoose";

const CourseClaseFileSchema = new Schema({
    file: {type: String,maxlength: 250,required:true},
    file_name: {type: String,maxlength: 250,required:true},
    clase: {type: Schema.ObjectId, ref: 'course_clase',required:true},
    size: {type: Number,required:true},
},{
    timestamps: true
});

const CourseClaseFile = mongoose.model("course_clase_file",CourseClaseFileSchema);
export default CourseClaseFile;