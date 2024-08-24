import mongoose, {Schema} from "mongoose";

const DiscountSchema = new Schema({
    type_campaign: {type:Number,required:true,default: 1}, //1 es campaña normal , 2 es campaña flash y 3 campaña banner
    type_discount: {type:Number,required:true,default: 1}, //por porcentaje es 1 y 2 seria por monto
    discount:{type: Number,required:true},
    start_date: {type: Date,required:true},
    end_date: {type: Date,required:true},
    start_date_num: {type: Number,required:true},
    end_date_num: {type: Number,required:true},
    type_segment:{type:Number,required:true,default:1},// 1 es cuando el descuento es por curso y 2 es cuando es por categoria
    state: {type: Number,required:true,default: 1}, // 1 es activo y 2 inactivo
    courses: [{type:Object}],//[{_id: laravel y angular },{_id: vue y laravel}]
    categories: [{type:Object}],
},{
    timestamps: true,
}); 

const Discount = mongoose.model("discount",DiscountSchema);
export default Discount;