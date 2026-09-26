import React, { useState, useRef } from "react";
import { useToast } from "../../../utils/Toast";
import { validateDocumentUpload } from "../../../utils/documentValidator";
import { documentApi } from "../../../api/documentApi";

export default function DocumentUpload() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const validation = validateDocumentUpload(files);
    if (!validation.isValid) {
      showToast(validation.error, "error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => {
      // Matches the List<IFormFile> Files property in our C# DTO
      formData.append("Files", file);
    });

    try {
      // Use the centralized axios client
      const data = await documentApi.uploadDocuments(formData);

      if (data.success) {
        showToast(data.message || "Files uploaded successfully!", "success");
        setFiles([]); // Clear the queue on success
      } else {
        showToast(data.message || "Upload failed", "error");
      }
    } catch (error) {
      // axios wraps error messages in error.response.data
      showToast(error.response?.data?.message || "An error occurred during upload", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full text-slate-800">
      <div className="mb-8 pl-10">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Upload Documents
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Securely upload and store your files to your workspace.
        </p>
      </div>

      <div className=" p-10">
        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 bg-slate-50"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
          />
          <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-4"></i>
          <p className="text-sm font-medium text-slate-800">
            Click to upload
          </p>
          <p className="text-xs text-slate-500 mt-1">
            or drag and drop files here
          </p>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-6">
            PDF, JPG, PNG, Excel (Max. 100MB)
          </p>
        </div>

        {/* Queued Files List */}
        {files.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
              Files to Upload ({files.length})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <i className="fas fa-file-alt text-slate-400 text-lg"></i>
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className={`px-6 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
              ${
                files.length === 0
                  ? "bg-slate-500 text-slate-400 cursor-not-allowed border border-transparent"
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-900"
              }`}
          >
            {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin text-xs"></i>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <i className="fas fa-upload text-xs"></i>
                <span>
                  Upload{" "}
                  {files.length > 0 ? `${files.length} ` : ""}
                  {files.length === 1 ? "Document" : "Documents"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
