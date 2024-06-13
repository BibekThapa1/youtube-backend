import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteImageFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination
  // Algorithm to get all videos from db
  // Get all the requirements from the query
  // find the document based on userId

  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const filter = userId ? { owner: userId } : {};

  if (query) {
    filter.$or = [
      {
        title: { $regex: query, $options: "i" }, //Find title with query in case-insensitive
        description: { $regex: query, $options: "i" }, // Find the description with query  in cas-insensetive
      },
    ];
  }

  const sort = {};
  sort[sortBy] = sortType === "desc" ? -1 : 1;

  const skip = (page - 1) * limit; // Skips the datas according to the page count

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const video = await Video.paginate(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
  });

  if (!video) {
    throw new ApiError(500, "Something went wrong while fetching all videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched suscessfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  //   Algorithm to upload the video
  //Get title and description of the video
  // upload the video file and thumbnail  in cloudinary and take the responseapi
  // fetch url,duration from the cloudinary responseApi
  // Create the document in mongoDB
  // Return response
  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, "Title and Description are required");
  }

  let videoFileLocalPath = req.files?.videoFile[0]?.path;
  let thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!(videoFileLocalPath && thumbnailLocalPath)) {
    throw new ApiError(400, "Video and thumbnail both are required");
  }

  const uploadVideo = await uploadOnCloudinary(videoFileLocalPath);
  if (!uploadVideo) {
    throw new ApiError(
      500,
      "Something went wrong while uploading video in cloudinary"
    );
  }

  const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!uploadThumbnail) {
    throw new ApiError(
      500,
      "Something went wrong while uploading video in cloudinary"
    );
  }

  const video = await Video.create({
    videoFile: uploadVideo.url,
    thumbnail: uploadThumbnail.url,
    owner: req.user._id,
    title,
    description,
    duration: uploadVideo.duration,
  });

  if (!video) {
    throw new ApiError(400, "Error occured while uploadiing video model data");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Suscessfully uploaded video"));
});

const getVideoById = asyncHandler(async (req, res) => {
  // TODO: get video by id
  // Algorithm to get video by id
  // Here we have to give video by id
  // Take the video id from params
  // Use findById method and search for id in mongoDb
  // return response

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Invalid video id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Suscesfully fetched video"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  // Algorithm to update video details
  // Get title, description from request.body

  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, "title and description is required");
  }

  const thumbnailLocalPath = req.file?.path;

  const oldVideo = await Video.findById(videoId);

  if (!oldVideo) {
    throw new ApiError(400, "invalid video id");
  }

  let newThumbnail;
  if (thumbnailLocalPath) {
    await deleteImageFromCloudinary(oldVideo.url);
    newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,

    {
      title,
      description,
      thumbnail: newThumbnail.url,
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(
      500,
      "Something went wrong while updating video details"
    );
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  // Algorithm to delete videos
  // Get video id from params
  // Search in video collection for video id and delete it
  // Return the reesponse

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const isVideoValid = isValidObjectId(videoId);

  if (!isVideoValid) {
    throw new ApiError(400, "Invalid video id");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Suscessfully deleted the video"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  // Algoritm to toggle the publish status of the vide
  // We have to invert the boolean value of isPublsihed from document
  // Get video id from params
  // Search for the video document by matching the id
  // Update the isPublsihed
  // Return response

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  const isVideoValid = isValidObjectId(videoId);
  if (!isVideoValid) {
    throw new ApiError(400, "Invalid video id");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: { isPublished: { $not: "$isPublished" } },
    },
    { new: true }
  );

  if(!updatedVideo){
    throw new ApiError(500,"Error occured while updating the video")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,updateVideo,"Suscessfully updated the video")
  )

});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
