import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

await cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

async function uploadOnCloudinary(localFilePath, folder) {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
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
async function deleteFromCloudinary(fileUrl, folder,type = "auto") {
  const publicId = extractPublicId(fileUrl);
  console.log(`${folder}/${publicId}`);
  try {
    console.log("entered");
    const response = await cloudinary.uploader.destroy(`${folder}/${publicId}`, {
      resource_type: type,
    });
    console.log("response : ", response);
    console.log("Deleted from cloudinary");
  } catch (error) {
    // fs.unlinkSync(localFilePath);
    console.log("error: ", error);
    return null;
  }
}

async function unlinkFromDevice(localFilePath) {
  fs.unlinkSync(localFilePath);
}

export { uploadOnCloudinary, deleteFromCloudinary, unlinkFromDevice };
