import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateCurrentPassword,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserDetails,
  getChannelInfo,
  getUserHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(verifyJwtToken, logoutUser);
router.route("/generate-token").post(refreshAccessToken);
router.route("/get-current-user").get(verifyJwtToken, getCurrentUser);
router.route("/update-password").post(verifyJwtToken, updateCurrentPassword);
router.route("/update-user-details").patch(verifyJwtToken, updateUserDetails);
router
  .route("/update-avatar")
  .patch(upload.single("avatar"), verifyJwtToken, updateUserAvatar);
router
  .route("/update-coverImage")
  .patch(upload.single("coverImage"), verifyJwtToken, updateUserCoverImage);
router.route("/get-channel-info/:username").get(verifyJwtToken, getChannelInfo);
router.route("/get-watch-history").get(verifyJwtToken, getUserHistory);

export default router;
