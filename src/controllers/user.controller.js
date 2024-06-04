import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
      $set: {
        refreshToken: undefined,
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

export { registerUser, loginUser ,logoutUser};
