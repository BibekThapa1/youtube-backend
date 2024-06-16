import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken" 

export const verifyJwtToken = asyncHandler(async (req, _,next)=>{
   try {
     const ascessToken = req.cookies?.ascessToken || req.header("Authorization")?.replace("Bearer ","");
    //  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 
     if(!ascessToken){
         throw new ApiError(401,"Token not found");
     }
     const decodedToken = jwt.verify(ascessToken,process.env.ACCESS_TOKEN_SECRET)
      
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
     
     if(!user){
         throw new ApiError(401,"Invalid Ascess Token");
     }
 
     req.user = user;
     next()
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid ascess token")
   }
})

