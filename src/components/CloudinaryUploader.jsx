import { useState } from "react";
import { Upload, X, CheckCircle } from "lucide-react";
import { useApp } from "../context/useApp";
import "./CloudinaryUploader.css";

export default function CloudinaryUploader({ onImageUrlObtained, cloudName, uploadPreset }) {
  const { showToast } = useApp();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }

    setFile(selectedFile);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast("Please select an image first", "error");
      return;
    }

    if (!cloudName || !uploadPreset) {
      showToast("Cloudinary configuration is missing", "error");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const secureUrl = data.secure_url;

      setUploadedUrl(secureUrl);
      showToast("Image uploaded successfully!", "success");

      // Call the callback with the URL
      if (onImageUrlObtained) {
        onImageUrlObtained(secureUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload image. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setUploadedUrl(null);
  };

  return (
    <div className="cloudinary-uploader">
      <div className="uploader-section">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="cloudinary-file-input"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
          />
          <label htmlFor="cloudinary-file-input" className="file-input-label">
            <Upload size={18} />
            <span>{file ? file.name : "Choose Image"}</span>
          </label>
        </div>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <button
              type="button"
              className="preview-clear-btn"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              disabled={uploading}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="uploader-actions">
          <button
            type="button"
            className="btn-upload"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Upload to Cloudinary"}
          </button>
          {(file || uploadedUrl) && (
            <button
              type="button"
              className="btn-reset"
              onClick={handleReset}
              disabled={uploading}
            >
              Reset
            </button>
          )}
        </div>

        {uploadedUrl && (
          <div className="upload-success">
            <CheckCircle size={20} />
            <span>Image uploaded successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
