import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";

type UploadImageOptions = {
  uri: string;
  folder: string;
  fileName: string;
};

// These should ideally be in a .env file
const CLOUDINARY_CLOUD_NAME = "dv260gair"; // Found in your other project
const CLOUDINARY_UPLOAD_PRESET = "rn_unsigned_preset"; // Found in your other project

/**
 * Uploads an image to Cloudinary using the REST API.
 * Uses unsigned uploads for simplicity and security on the client side.
 */
export async function uploadImageToCloudinary({
  uri,
  folder,
  fileName,
}: UploadImageOptions): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing.");
  }

  // 1. Optimize image before upload
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 1000 } }], // Resize to a reasonable width
    { compress: 0.7, format: SaveFormat.JPEG }
  );

  // 2. Prepare Form Data
  const formData = new FormData();
  
  if (Platform.OS === 'web') {
    formData.append("file", result.uri);
  } else {
    formData.append("file", {
      uri: result.uri,
      type: "image/jpeg",
      name: `${fileName}.jpg`,
    } as any);
  }

  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);
  formData.append("public_id", fileName);

  // 3. Perform Upload
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary Upload Error:", data);
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return data.secure_url || data.url;
}
