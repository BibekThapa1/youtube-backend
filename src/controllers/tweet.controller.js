import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  // Get content to tweet from body
  // Create a document in db
  // return response

  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    owner: req.user._id,
    content,
  });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong while tweeting");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Suscessfully created tweet"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  // Algorithm to get user tweets
  // GEt userId from params
  // match userId with id of tweet
  // return response

  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "UserId is required");
  }

  const tweet = await Tweet.find({ owner: userId });

  if (!tweet) {
    throw new ApiError(400, "tweets not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Fetched tweets suscessfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  //  Get content from request.body
  // Find the tweet through userId and update
  // return response
  const { tweetId } = req.params;
  const { newContent } = req.body;

  if (!newContent) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.findOneAndUpdate(
    {
      _id:tweetId,
      owner:req.user._id
    },
    {
      content: newContent,
    },
    { new: true }
  );

if(!tweet){
  throw new ApiError(400,"Invalid tweet Id");
}

return res
.status(200)
.json(
  new ApiResponse(200,tweet,"Tweet updated suscessfully")
)

});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
//   get the tweetid through params
//   Get the tweet through userId
// Delete it and return response

  const {tweetId} = req.params;

  if(!tweetId){
    throw new ApiError(400,"tweet id is required")
  }

  await Tweet.findOneAndDelete(
    {
        owner:req.user._id,
        _id:tweetId
    }
  )

  return res
  .status(200)
  .json(
    new ApiResponse(200,{},"tweet deleted suscessfully")
  )

});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
