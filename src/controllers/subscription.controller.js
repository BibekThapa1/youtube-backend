import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  // Algorithm to toggle subscription
  // Get channel id from request
  // use isValidObjectId and look wether it exist or not
  // If exist then search for subscription data with existed data and delete it
  // If not existed then create it
  // Return response
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel id is required");
  }

  const channelExist = isValidObjectId(channelId);

  if (!channelExist) {
    throw new ApiError(400, "Invalid channelId");
  }

  const subscriptionExisted = await Subscription.findOneAndDelete({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (subscriptionExisted) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Suscessfully deleted "));
  }

  const subscription = await Subscription.create({
    channel: channelId,
    subscriber: req.user,
    _id,
  });

  if (!subscription) {
    throw new ApiError(
      500,
      "Something went wrong while creating subscription document"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscription, "Subscessfully subscribed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // Algorithm to get userChannelSubscribers
  // Get channel id from params
  // verify if channel id exists or not in db
  // match the channel id with the subscription model
  // use $lookup to get the user data

  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel Id is required");
  }

  const isValidChannel = isValidObjectId(channelId);

  if (!isValidChannel) {
    throw new ApiError(400, "Channel doesnot exist");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_ic",
        as: "subscribers",
        subscribers: {
          $first: "$subscribers",
        },
      },
    },
  ]);

  if (!subscribers) {
    throw new ApiError(500, "Something went wrong while fetching subscribers");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Data fetched suscessfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  //Algorithm to get the subscribed channels
  //validate if subscriber id exist or not in database
  // match the subscriber id with the subscription db
  // use look up to get the channel field
  // return response

  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "subscriberId is required");
  }

  const isValidSubscriber = isValidObjectId(subscriberId);

  if (!isValidSubscriber) {
    throw new ApiError(400, "Invalid subscriberId");
  }

  const channel = await Subscription.aggregate([
    {
      $match: {
        subscriber: subscriberId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannels",
        subscribedChannels: {
          $first: "$subscribedChannels",
        },
      },
    },
  ]);

  if (!channel) {
    throw new ApiError(
      500,
      "Something went wrong while fetching subscribed channel"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel, "Subscribed channel fetched suscessfully.")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
