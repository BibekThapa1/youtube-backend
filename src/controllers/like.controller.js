import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  // Algorithm to toggle liked videos
  // First of all check wether the video is already liked by the user or not
  // If not then create new document. If yes then delete that doucment

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const like = await Like.findOneAndUpdate(
    {
      video: videoId,
      likedBy: req.user._id,
    },
    {
      $setOnInsert: {
        video: videoId,
        likedBy: req.user._id,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  if (like.lastErrorObject.updatedExisting) {
    await Like.deleteOne({ video: videoId });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, like, "Suscessfully toggled video Like function")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { videoId } = req.params;
  //TODO: toggle like on comment
  // Algorithm to toggle comment like
  // Get params and user id
  // Check wether they exists or not. If not exist then create if exists than delete
  const userId = req.user._id;

  if (!(commentId, userId)) {
    throw new ApiError(400, "Invalid userId or commentId");
  }

  const like = await Like.findOneAndUpdate(
    {
      comment: commentId,
      likedBy: userId,
    },
    {
      $setOnInsert: {
        video: videoId,
        likedBy: userId,
        comment: commentId,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  if (like.lastErrorObject.updatedExisting) {
    await Like.deleteOne({ _id: like._id });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, like, "Suscessfully toggled comment Like function")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is required");
  }

  const like = await Like.findOneAndUpdate(
    {
      tweet: tweetId,
      likedBy: userId,
    },
    {
      $setOnInsert: {
        video: videoId,
        likedBy: userId,
        comment: commentId,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  console.log(like);

  if (like.lastErrorObject.updatedExisting) {
    await Like.deleteOne({ _id: like._id });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, like, "Suscessfully toggled tweet Like function")
    );
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
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "LikeWithVideoList",
        LikeWithVideoList: {
          $first: "$LikeWithVideoList",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likeWithLikedPersonList",
        likeWithLikedPersonList: {
          $first: "$likeWithLikedPersonList",
        },
      },
    },
    {
      $match: {
        "likeWithLikedPersonList.id": userId,
      },
    },
  ]);

  if (!like) {
    throw new ApiError(400, "There are no liked videos.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Liked videos fetched suscessfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
