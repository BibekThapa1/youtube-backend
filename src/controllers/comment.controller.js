import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  //Algorithms
  //Get video id from params
  //Check wether the video exists or not
  ///Write the query for how much comments should be displayed
  // Write plugin to match the video id with the comment id
  // Also write plugin to match the user who comments in the particular video
  // limit the comments to 10
  // Return json response
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const comments = await Comment.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "commentedVideo",
        $project:{
          videoFile:1,
          title:1,
          thumbnail:1
        }
      }
    },
    {
      $addFields:{
        commentedVideo:{
          $first:"$commentedVideo"
        }
      }
    },
    {
    $match:{
      video:new mongoose.Types.ObjectId(videoId)
    }
  }
    // },

    // // {
    // //   $addFields:{
    // //     CommentedPerson:{
    // //       $arrayElmAt:["$CommentedPerson",0]
    // //     }
    // //   }
    // // },
    // {
    //   $match: {
    //     video: videoId,
    //   },
    // },
    // {
    //   $limit: 10,
    
  ]);

  if (!comments) {
    throw new ApiError(400, "Error occured at comment model: Invalid Video Id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Suscessfully fetched data"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  // Get video id
  // Get comment from frontend
  // Get commented person user id from request
  // check for availability of the user in database
  // update the comment document in database

  const { videoId } = req.params;
  console.log("videoId: ", videoId);

  const { content } = req.body;
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(400, "videoId is required.");
  }
  const video = await Video.findById(videoId);
  const user = await User.findById(userId);

  if (!(user && video)) {
    throw new ApiError(400, "Invalid user id");
  } 

  console.log("comment: ", content);

  const dbComment = await Comment.create({
    content,
    video: video._id,
    owner: req.user._id,
  });

  console.log("entered 4");

  if (!dbComment) {
    throw new ApiError(500, "Something went wrong in add comment model");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, dbComment, "Comment created suscessfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  // Get video id from params
  // Get userId and comment from body
  // Validate the user and video
  // Update the comment section
  // Return response

  const { videoId } = req.params;
  const { newComment, userId } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Invalid video id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "Invalid user Id");
  }

  const comment = await Comment.findOneAndUpdate(
    {
      video: videoId,
    },
    {
      content: newComment,
    },
    {
      new: true,
    }
  );

  if (!comment) {
    throw new ApiError(400, "Invalid user Id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Updated suscessfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  // Get video id and user Id from frontend
  // Search for comment matching video id
  // Delete from database model

  const { videoId } = req.params;
  const { userId } = req.body;
  if (!videoId) {
    throw new ApiError(400, "Invalid video id");
  }

  const user = findById(userId);

  if (!user) {
    throw new ApiError(400, "Invalid video id");
  }

  await Comment.deleteOne({ owner: user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Data deleted suscessfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
