import { model, Schema } from "mongoose";


const ratingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
   rating:{
    type:Number,
    required:true,
    min:1,
    max:5
   } ,
   from:{type:Schema.Types.ObjectId,ref:"User"}
    
  })

  const Rating=model("Rating",ratingSchema)

  export default Rating