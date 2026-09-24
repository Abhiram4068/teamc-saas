import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentApi } from "../../../api/documentApi";
import { useToast } from "../../../utils/Toast";
import { validateDocumentUpdate } from "../../../utils/documentValidator";

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({ displayName: '', description: '' });
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      try {
        const response = await documentApi.getDocumentById(id);
        if (response.success && isMounted) {
          setDocument(response.data);
          // Also fetch preview blob securely
          const blobUrl = await documentApi.getPreviewBlobUrl(response.data.id);
          if (isMounted) setPreviewUrl(blobUrl);
        } else if (isMounted) {
          showToast("Failed to load document details", "error");
        }
      } catch (err) {
        if (isMounted) showToast("Error loading document", "error");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDetails();

    return () => {
      isMounted = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpdate = async () => {
    const validation = validateDocumentUpdate(editFormData.displayName);
    if (!validation.isValid) {
      showToast(validation.error, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await documentApi.updateDocument(id, editFormData);
      if (response.success) {
        showToast("Document updated successfully", "success");
        setDocument(prev => ({ ...prev, displayName: editFormData.displayName, description: editFormData.description }));
        setIsEditModalOpen(false);
      } else {
        showToast(response.message || "Failed to update document", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "An error occurred during update", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await documentApi.deleteDocument(id);
      if (response.success) {
        showToast("Document deleted successfully", "success");
        navigate('/emp/documents');
      } else {
        showToast(response.message || "Failed to delete document", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "An error occurred during deletion", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <i className="fas fa-spinner fa-spin text-4xl text-brand-600"></i>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <i className="fas fa-file-alt text-5xl text-slate-300 mb-4"></i>
        <h2 className="text-xl font-semibold text-slate-700">
          Document Not Found
        </h2>
        <button
          onClick={() => navigate("/emp/documents")}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800"
        >
          Go Back to My Documents
        </button>
      </div>
    );
  }

  const isImage = document.contentType.startsWith("image/");
  const isPdf = document.contentType === "application/pdf";

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/emp/documents")}
            className="mr-4 w-10 h-10  flex items-center justify-center transition-colors"
          >
            <i className="fas fa-arrow-left text-slate-600 text-sm"></i>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {document.displayName}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Document Details & Preview
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => { 
              setEditFormData({ displayName: document.displayName, description: document.description || '' }); 
              setIsEditModalOpen(true); 
            }} 
            className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center gap-2 tracking-wide"
          >
            <i className="fas fa-pen text-xs text-slate-400"></i> Edit
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)} 
            className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all flex items-center gap-2 tracking-wide"
          >
            <i className="fas fa-trash text-xs text-red-400"></i> Delete
          </button>
        </div>
      </div>

      {/* Content Area: 3/4 Left, 1/4 Right */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left 3/4: Preview Section */}
        <div className="w-3/4  overflow-hidden flex items-center justify-center relative ">
          {previewUrl ? (
            isImage ? (
              <img
                src={previewUrl}
                alt={document.displayName}
                className="max-w-full max-h-full object-contain p-4 drop-shadow-sm"
              />
            ) : isPdf ? (
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title={document.displayName}
              ></iframe>
            ) : (
              <div className="flex flex-col items-center">
                <i
                  className={`fas text-6xl mb-4 ${
                    document.displayName.endsWith(".xlsx") ||
                    document.displayName.endsWith(".xls")
                      ? "fa-file-excel text-green-500"
                      : "fa-file-alt text-slate-400"
                  }`}
                ></i>
                <p className="text-slate-600 font-medium">
                  Preview not available for this file type.
                </p>
                <a
                  href={previewUrl}
                  download={document.displayName}
                  className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
                >
                  <i className="fas fa-download"></i>
                  Download to View
                </a>
              </div>
            )
          ) : (
            <i className="fas fa-spinner fa-spin text-4xl text-slate-400"></i>
          )}
        </div>

        {/* Right 1/4: Metadata Section */}
        <div className="w-1/4 p-6 flex flex-col overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-4">
            Document Details
          </h3>

          <div className="space-y-6 flex-1">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                File Name
              </p>
              <p className="text-sm text-slate-800 break-words font-medium">
                {document.displayName}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Description
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {document.description || (
                  <span className="text-slate-400 italic">
                    No description provided
                  </span>
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                File Type
              </p>
              <span className="text-xs text-slate-700 font-medium inline-block px-2.5 py-1 rounded-md">
                {document.contentType || "Unknown"}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                File Size
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {formatSize(document.sizeInBytes)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Uploaded On
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {formatDate(document.uploadedAt)}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <a
              href={previewUrl}
              download={document.displayName}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-sm font-semibold tracking-wide shadow-sm"
            >
              <i className="fas fa-download text-xs"></i>
              Download Document
            </a>
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Edit Document Info</h3>
              <p className="text-sm text-slate-500 mt-1">Update the metadata for this file.</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={editFormData.displayName} 
                  onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  placeholder="Enter file name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Description</label>
                <textarea 
                  value={editFormData.description} 
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all min-h-[120px] resize-none"
                  placeholder="Add a brief description..."
                ></textarea>
              </div>
            </div>
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold tracking-wide hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
              >
                {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-trash-alt text-2xl text-red-500"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Delete Document?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              This action cannot be undone. This document will be permanently removed from your workspace.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold tracking-wide hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
              >
                {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}
