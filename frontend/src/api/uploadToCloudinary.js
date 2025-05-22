// api/uploadToCloudinary.js

export const uploadDocumentToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "NinjaNest");
  formData.append("cloud_name", "dan454ywo");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dan454ywo/auto/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url; // This is the document URL
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
