import jwt from "jsonwebtoken"
import dotenv from  "dotenv"
dotenv.config(".env")
export default function generateToken(id){
    return jwt.sign({
        id
    },process.env.JWT_TOKEN,{expiresIn:"1d"})
}