import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return console.log("could not find path of file");
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    console.log("file uploaded ", response.url);

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath);
  }
};

export { uploadToCloudinary };
