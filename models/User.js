import mongoose, {Schema} from "mongoose";

const UserSchema = new Schema({
    rol:{type:String,maxlength: 30,required:true},
    name:{type:String,maxlength: 250,required:true},
    surname:{type:String,maxlength: 250,required:true},
    email:{type:String,maxlength: 250,required:true,unique:true},
    password:{type:String,maxlength: 250,required:true},
    avatar:{type:String,maxlength: 250,required:false},
    state:{type:Number,default: 1},//1 ES ACTIVO 2 ES INACTIVO
    phone: {type: String, maxlength: 30,required:false},
    birthday: {type: String, maxlength: 30,required:false},
    // is_instructor:{type:Number,required:false,default: null},// 1 es instructor
    profession: {type: String, maxlength: 250,required:false},
    description: {type: String,required:false},
},{
    timestamps: true
});

const User = mongoose.model("user",UserSchema);
export default User;