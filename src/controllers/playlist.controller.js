import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  //  Get name and description of the playlist
  // Create playlist using userId
  // Return response

  const { name, description } = req.body;

  if (!(name && description)) {
    throw new ApiError(400, "Name and description is required");
  }   

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,

  });

  if (!playlist) {
    throw new ApiError(500, "something went wrong while creating plylist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Suscessfully created playlist"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //TODO: get user playlists
  // Algorithm to get user Playlists
  // Get userId from params
  // User aggregate pipeline to match the userId with playlist and use lookup to get videos
  // Return response

  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "Invalid user Id");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId) ,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
   
  ]);

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched suscessfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  //TODO: get playlist by id
  // Algorithm to get playlist by id
  // Use aggregate pipleine and match the playlist with id and also use lookup to find videos
  // Return response
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos"        
      },
    },
  ]);

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched suscessfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  // Algorithm to add video to playlist
  // Get playlist id and video id from params
  // Validate wether they exists or not
  // If validated then add videoid to the playlist and return response

  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId)) {
    throw new ApiError(400, "Playlist id and video id is required");
  }

  const validateVideo = isValidObjectId(videoId); // If error occured look here

  if (!validateVideo) {
    throw new ApiError(400, "Invalid video id");
  }

  let playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  console.log(playlist);

  if(!playlist.videos){
    playlist.videos = []
  }

  if(playlist.videos.includes(videoId)){
    throw new ApiError(400,"Video is already in playlist")
  }

  console.log((videoId));

console.log(playlist.videos);

  playlist.videos.push(videoId);
 
  playlist = await playlist.save();

  if (!playlist) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Suscessfully fetched data"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    //   Algorithm to remove video from the playlist
    // Get playlist and video id 
    // Use findByIdAndUpdate and use pull operator to remove playlistId from playlist
    // Return response
    const { playlistId, videoId } = req.params;
    if(!(playlistId && videoId)){
        throw new ApiError(400,"Playlist id and video id is required")
    }
 
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$pull:{videos:videoId}},
        {new:true}
    )

   if(!playlist){
    throw new ApiError(400,"Playlist not found")
   }

   return res
   .status(200)
   .json(
    new ApiResponse(200,playlist,"Suscessfully updated the playlist")
   )

});

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    //   Algorithm to delete playlist
    //  Get playlistId from params
    // Use findByIdAndDelete method and delete the playlist
    // return response

    const { playlistId } = req.params;

    if(!playlistId){
        throw new ApiError(400,"Playlist id is required");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Playlist deleted suscessfully")
    )

 
});

const updatePlaylist = asyncHandler(async (req, res) => {
  
    //TODO: update playlist
    // Get all the requirements from request
    // Use findByIdAndUpdate in playlist and update the required value

  const { playlistId } = req.params;
  const { name, description } = req.body;

  if(!(playlistId && name && description)){
   throw new ApiError(400,"PlaylistId , name and description is required")
  }
 
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        name,
        description
    },
    {new:true}
  )

  return res
  .status(200)
  .json(
    new ApiResponse(200,playlist,"Updated suscessfully")
  )


});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
