import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

async function uploadOnCloudinary(localFilePath) {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded suscessfully
    console.log("File Upload Response: ", uploadResult);
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    //Remove the locally saved temporary file as the file upload gets error
    return null;
  }
}

// Function to extract public ID from Cloudinary URL
function extractPublicId(url) {
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  const publicIdWithExtension = lastPart.split(".")[0];
  return publicIdWithExtension;
}

// Delete file from cloudinary
async function deleteImageFromCloudinary(imageUrl) {
  const publicId = extractPublicId(imageUrl);
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from cloudinary")
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
}

export { uploadOnCloudinary, deleteImageFromCloudinary };
