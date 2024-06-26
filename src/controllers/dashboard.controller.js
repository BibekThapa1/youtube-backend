import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    //  Algorithm to get channel stats
    // Get channel id 
    // Group the data based on videos and count
    // Search for likes modal and count the total no.of like related to video and total views
    // Get the subscriber count from subscription modal

    const {channelId} = req.body;

    console.log(channelId);

    if(!channelId){
        throw new ApiError(400,"Invalid channel Id")
    }

    const video = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(channelId),
               
            }
        },
        {
            $group:{
                _id:null,
                totalViews:{
                    $sum:"$views",
                },
                totalVideos:{
                    $sum:1
                }
            }
        }

    ])

    if(!video){
        throw new ApiError(400,"Error Occured while fetching video aggregation")
    }

    const subscription = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId),
            }
        },
        {
            $count:"totalSubscribers"
        }
    ])
    
console.log("Subscription: ",subscription);

     if(!subscription){
        throw new ApiError(400,"Error Occured while fetching subscription aggregation")
    }

    const likes = await Like.aggregate([
        {
            $match:{
                video:channelId
            }
        },
        {
            $count:"totalLikes"
        }
    ])

    if(!likes){
        throw new ApiError(400,"Error Occured while fetching totalLikes aggregation")
    }
return res
.status(200)
.json(
    new ApiResponse(200,{video,subscription,likes},"Data fetched suscessfully")
)

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    // Get channel id
    // Use aggregation pipeline to match video id with user id
    // Return response

   const {channelId} = req.body;

   if(!channelId){
    throw new ApiError(400,"Invalid channel id")
   }

   const videos = await Video.aggregate([
    {
        $match:{
            owner:new mongoose.Types.ObjectId(channelId)
        }
    }
   ])

   if(!videos){
    throw new ApiError(400,"Not found channel in DB")
   }

   return res
   .status(200)
   .json(
    new ApiResponse(200,videos,"Channel videos fetched suscesfully")
   )

})

export {
    getChannelStats, 
    getChannelVideos
    }

