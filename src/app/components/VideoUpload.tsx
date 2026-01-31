"use client";
import { CldUploadWidget } from "next-cloudinary";

interface VideoUploadProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export function VideoUpload({ onUploadSuccess, label = "Otpremi Video Lekciju" }: VideoUploadProps) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onSuccess={(result: any) => {
        if (result?.info?.secure_url) {
          onUploadSuccess(result.info.secure_url);
        }
      }}
      options={{
        maxFiles: 1,
        resourceType: "auto",
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            open();
          }}
          className="auth-btn w-full flex items-center justify-center gap-2"
        >
          {label}
        </button>
      )}
    </CldUploadWidget>
  );
}