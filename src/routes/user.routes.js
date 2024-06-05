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
router.route("get-current-user").post(verifyJwtToken, getCurrentUser);
router.route("change-password").post(verifyJwtToken, updateCurrentPassword);
router
  .route("change-avatar")
  .post(upload.single("file"), verifyJwtToken, updateUserAvatar);
router
  .route("change-coverImage")
  .post(upload.single("file"), verifyJwtToken, updateUserCoverImage);

export default router;
