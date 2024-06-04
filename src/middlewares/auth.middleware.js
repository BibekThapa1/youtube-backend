import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyJwtToken = asyncHandler(async (req, _,next)=>{
   try {
     const ascessToken = req.cookies?.ascessToken || req.header("Authorization").replace("Bearer ","");
 
     if(!token){
         throw new ApiError(401,"Token not found");
     }
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
      
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

