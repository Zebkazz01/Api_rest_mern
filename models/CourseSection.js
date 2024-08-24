import mongoose,{Schema} from "mongoose";

const CourseSectionSchema = new Schema({
    title: {type: String,maxlength: 250,required:true},
    course: {type: Schema.ObjectId, ref: 'course',required:true},
    state: {type:Number,maxlength: 1,default: 1}, // 1 es activo y 2 inactivo
},{
    timestamps: true
});

const CourseSection = mongoose.model("course_section",CourseSectionSchema);
export default CourseSection;