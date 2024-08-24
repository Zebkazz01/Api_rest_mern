import mongoose, {Schema} from "mongoose";

const CuponeSchema = new Schema({
    code: {type: String,maxlength: 50,required:true},
    type_discount: {type:Number,required:true,default: 1}, //por porcentaje es 1 y 2 seria por monto
    discount:{type: Number,required:true},
    type_count:{type:Number,required:true,default:1},// ilimitado es 1 y 2 es limitado
    num_use:{type: Number,required:true},
    type_cupon:{type:Number,required:true,default:1},// 1 es cuando el cupon es por curso y 2 es cuando es por categoria
    state: {type: Number,required:true,default: 1}, // 1 es activo y 2 inactivo
    courses: [{type:Object}],//[{_id: laravel y angular },{_id: vue y laravel}]
    categories: [{type:Object}],
},{
    timestamps: true,
}); 

const Cupone = mongoose.model("cupones",CuponeSchema);
export default Cupone;