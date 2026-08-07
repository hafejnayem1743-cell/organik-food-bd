// Cloudinary Upload Utility for Organik Food BD
export const CLOUDINARY_CLOUD_NAME = "zkc2kn20";
export const CLOUDINARY_UPLOAD_PRESET = "organik_food_bd";

export async function uploadToCloudinary(fileOrDataUrl: File | string): Promise<string> {
  const formData = new FormData();
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  if (typeof fileOrDataUrl === "string") {
    // Base64 or Data URL
    formData.append("file", fileOrDataUrl);
  } else {
    // File object
    formData.append("file", fileOrDataUrl);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Cloudinary upload error response:", errText);
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.secure_url) {
    return data.secure_url;
  } else if (data.url) {
    return data.url;
  } else {
    throw new Error("No URL returned from Cloudinary upload");
  }
}
