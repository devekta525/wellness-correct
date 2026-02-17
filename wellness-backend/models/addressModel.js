import { model, Schema } from "mongoose";

const addressSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    addresses:[{
        name:{type:String,required:true},
        address:{type:String,required:true},
        state:{type:String,required:true},
        city:{type:String,required:true},
        landMark:{type:String},
        pinCode:{type:String,required:true},
        phone: { type: String },
        isDefault:{
        type:Boolean,
    },
    addressType:{
        type:String,enum:["Home","Work","Other"],
        default:"Home"
    },
    addressLabel:{type:String}
    }],
    
},{timestamps:true})

const Address = model('Address', addressSchema);

export default Address;
