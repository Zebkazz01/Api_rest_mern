import mongoose, {Schema} from "mongoose";

const SaleDetailSchema = new Schema({
    sale: {type: Schema.ObjectId, ref: 'sale',required:true},
    course: {type: Schema.ObjectId, ref: 'course',required:true},
    type_discount: {type: Number,required: false}, //1 es porcentaje y 2 es monto fijo
    discount: {type: Number, required: false},
    campaign_discount: {type: Number, required:false},// 1 es normal , 2 es flash y 3 es banner
    code_cupon: {type:String,required:false},
    code_discount: {type:String,required:false},

    price_unit: {type:String,required:true},
    subtotal: {type:String,required:true},
    total: {type:String,required:true},
},{
    timestamps: true
});

const SaleDetail = mongoose.model("sale_detail",SaleDetailSchema);
export default SaleDetail;