const { UploadMultipleToCloudinary } = require("../utils/Cloudinary");

async function UploadFilesForPayload(files, destination) {
  try {
    let uploaded_files = [];

    const uploadResponse = await UploadMultipleToCloudinary(files, destination);

    uploadResponse.forEach((file) => {
      if (file.secure_url) {
        uploaded_files.push({
          _id: file.asset_id,
          uri: file.secure_url,
          public_id: file.public_id,
          width: file.width,
          height: file.height,
          mimeType: `${file.resource_type}/${file.format}`,
        });
      }
    });

    return uploaded_files;
  } catch (error) {
    return [];
  }
}

exports.UploadFilesForPayload = UploadFilesForPayload;
