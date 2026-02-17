import bcrypt from "bcrypt"

export default async function passwordCheck(password,thisPassword){
 return await bcrypt.compare(password,thisPassword)
 
}