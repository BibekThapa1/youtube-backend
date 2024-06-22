import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  // Algorithm to toggle liked videos
  // First of all check wether the video is already liked by the user or not
  // If not then create new document. If yes then delete that doucment

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  let like = await Like.findOneAndDelete({
    video: videoId,
    likedBy: req.user._id,
  });

  if (like) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Removed like Suscessfully "));
  }
  like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  if (!like) {
    throw new ApiError(500, "Error occured while liking the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Suscessfully liked video"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  // Algorithm to toggle comment like
  // Get params and user id
  // Check wether they exists or not. If not exist then create if exists than delete

  const { commentId } = req.params;
  const { videoId } = req.body;

  const userId = req.user._id;

  if (!(commentId, videoId)) {
    throw new ApiError(400, "Invalid videoId or commentId");
  }

  let like = await Like.findOneAndDelete({
    comment: commentId,
    likedBy: userId,
  });

  if (like) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Suscessfully unliked comment"));
  }

  like = await Like.create({
    comment: commentId,
    likedBy: userId,
  });

  if (!like) {
    throw new ApiError(500, "Error occured while liking it");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Suscessfully liked the comment"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet

  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is required");
  }

  const existingLike = await Like.findOne({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  let responseMsg;
  let like = {};
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    responseMsg = "suscessfully unliked tweet";
  } else {
    like = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    responseMsg = "suscessfully like tweet";
  }

  return res.status(200).json(new ApiResponse(200, like, responseMsg));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  // Use lookup to add field with videos list
  // Again use look up to add user list in likes document
  // Match the userId with the liked video user list.
  // Return the response

  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "User Id not existed.");
  }

  const like = await Like.aggregate([
  {
    $match:{
      likedBy:userId,
    }
  },
  {
    $lookup:{
      from:"videos",
      localField:"video",
      foreignField:"_id",
      as:"videos",
      pipeline:[
        {
          $project:{
            _id:1,
            thumbnail:1,
            owner:1,
            title:1,
            duration:1,
          }
        }
      ]
    }
  },
  {
    $addFields:{
      videos:{
        $first:"$videos"
      }
    }
  },
  {
    $match:{
      video:{
        $exists:true
      }
    }
  },
  {
    $project:{
      videos:1
    }
  }
  ])

  if (!like) {
    throw new ApiError(400, "There are no liked videos.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Liked videos fetched suscessfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

