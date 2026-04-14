import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useImageUpload = () => {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const uploadImage = async (file: File) => {
    const postUrl = await generateUploadUrl();

    const result = await fetch(postUrl, {
      method: "POST",
      body: file,
    });

    if (!result.ok) throw new Error("Upload failed");

    const { storageId } = await result.json();
    console.log("upload id:", storageId);

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

    if (!convexUrl) {
      throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
    }

    // ✅ FINAL FIX
    return `${convexUrl}/images/${storageId}`;
  };

  return { uploadImage };
};