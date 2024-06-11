import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  deleteImageFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const ascessToken = await user.generateAscessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { ascessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      400,
      "Something went wrong after generating refresh and ascess token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //    get user details from frontend.
  // validation - not empty.
  // check if user already exists: username,email
  // check for images, check for avatar
  // upload files to cloudinary.
  // create user object - create entry in db.
  // remove password and refresh token from response
  // check for user creation.
  // return response(res)

  const { username, fullname, email, password } = req.body;

  // res.status(200).json({
  //     message:"ok"
  // })

  if (
    [fullname, email, username, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All the user fileds are necessary");
  }

  const userExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExisted) {
    throw new ApiError(409, "Username or emails already exists.");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   cont coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("avatar: ", avatar);
  if (!avatar) {
    throw new ApiError(400, "Error while uploading data.");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return new ApiError(500, "Something went wrong while registering user.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Suscessfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Algorithm for logging in the user
  // Take email and password from req.body
  // Get User from mongodb atlas
  // Check if the email is logged in or not
  // Check the password
  // If password is correct then generate token
  // Give response to user.

  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "Username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  const passwordCorrect = await user.checkPassword(password);
  if (!passwordCorrect) {
    throw new Error(400, "Incorrect user credentials.");
  }

  const { ascessToken, refreshToken } = await generateToken(user._id);

  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  // Options for cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("ascessToken", ascessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          ascessToken,
        },
        "Suscessfully Logged in"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Algorithm to logout user
  // Build a custom middleware
  // Decode the ascess token from cookie
  // Put custom user object in response
  // Delete the refresh token from the cookie.
  const id = req.user._id;
  await User.findByIdAndUpdate(
    id,
    {
      $unset: {
        refreshToken: 1,  // this remove field form document.
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(400)
    .clearCookie("ascessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(400, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //  Algorithm to refresh the ascess token.
  // Take refresh token from the cookie.
  // Decode it and extract id
  // Search for db with id in database
  // If present -> math the refresh token
  // Generate new ones
  // Give response to the client with secure cookies

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  console.log(incomingRefreshToken);
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    console.log("1", decodedToken);
    if (!decodedToken) {
      throw new ApiError("Not valid token");
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError("Not valid token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError("Sorry the refresh token is expired or used.");
    }

    const { ascessToken, refreshToken } = await generateToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("ascessToken", ascessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { ascessToken, refreshToken },
          "Suscessfully generated the new tokens."
        )
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // Algorithms to get the current user
  // Simply put the verifyTokenJWT middleware and return the user object
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Suscesfully retrieved the user data")
    );
});

const updateCurrentPassword = asyncHandler(async (req, res) => {
  // Algorithms
  // Take old and new password
  // put jwt middleware in route and get userId
  // Check for old password to match password in database
  // Find and update user in database
  // Give suscess response

  const { oldPassword, newPassword } = req.body;
  if (!(oldPassword && newPassword)) {
    throw new ApiError(401, "Please input both new and old password");
  }

  const user = await User.findById(req.user?._id);

  const checkPassword = await user.checkPassword(oldPassword);
  if (!checkPassword) {
    throw new ApiError(401, "Please enter correct old password.");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Suscessfully changed password"));
});

const updateUserDetails = asyncHandler(async(req,res)=>{
  // Algorithm to update user details
  // Take username and email from the user
  // Validate the user name
  // Call database and update it
  // Retutn the updated data

  let {fullName,email} = req.body

  if(!(fullName && email)){
    throw new ApiError(404,"fullName and email is required")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        email:email,
        fullName:fullName,
      }
    },
    {new:true}
  ).select("-password")

  if(!user){
    throw new ApiError(400,"Username not found")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"Full name and email updated suscessfully")
  )

})

const updateUserAvatar = asyncHandler(async (req, res) => {
  // Algorithm to update user avatar
  // Take photo from user and upload it in local storage through multer
  // Upload it in cloudinary and retrieve its url
  // Get user from database
  // Update the avatar url
  // Save changes and return the user object through response.

  let avatarImageLocalPath = req.file?.path;
  if (!avatarImageLocalPath) {
    throw new ApiError(401, "Avatar file missing");
  }

  const avatar = await uploadOnCloudinary(avatarImageLocalPath);
  if (!avatar) {
    throw new ApiError(
      500,
      "Something went wrong while uploading in cloudinary"
    );
  }

  const oldAvatarUrl = await User.findById(req.user._id);

  console.log("oldAvatarUrl: ", oldAvatarUrl);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(500, "Error occured while updating avatar.");
  }
  await deleteImageFromCloudinary(oldAvatarUrl.avatar);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated suscessfully."));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // Algorithm to update cover image
  // Upload image to localstorage through multer
  // Retrieve image and upload it in cloudinary
  // Update user in database and return user object.

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover file missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(
      400,
      "Something went wrong while uploading in cloudinary"
    );
  }

  const oldCoverImageUrl = await User.findById(req.user._id);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  await deleteImageFromCloudinary(oldCoverImageUrl.coverImage);

  if (!user) {
    throw new ApiError(500, "Error occured while updating coverImage.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Suscessfully updated cover image."));
});

const getChannelInfo = asyncHandler(async (req, res) => {
  // Algorithm to retreive channnel info
  // get username from channel and validate it
  // Use aggregate pipeline to match the username and get subscriber and subscribed count
  // User project to select particular amount of data
  // Return the response

  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Invalid user name");
  }

  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel", // The document of subscribers
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel doesnot exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "user channel fetched suscesfully"));
});

const getUserHistory = asyncHandler(async(req,res)=>{
  // Algorith to fetch user history
  // Search for user in database
  // Use aggregate pipeline to match watchstory video with video database
  // Again use pipeline to match owner of the video with user database
  // $project the pipeline stage
  // Return response to the user

  const userHistory = await User.aggregate(
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
          $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:{
              $project:{
                fullName:1,
                userName:1,
                avatar:1
              }
            }
          }
      },
      {
        $addFields:{
          owner:{
            $first:"$owner"
          }
        }
      }
    ]
      }
    }
  )

  return res
  .status(200)
  .json(
    new ApiResponse(200,userHistory[0].watchHistory,"User history fetched suscessfully")
  )


})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserDetails,
  updateCurrentPassword,
  updateUserAvatar,
  updateUserCoverImage,
  getChannelInfo,
  getUserHistory
};
