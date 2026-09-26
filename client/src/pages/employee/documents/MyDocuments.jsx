import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentApi } from '../../../api/documentApi';
import { useToast } from '../../../utils/Toast';

export default function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { showToast } = useToast();

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await documentApi.getDocuments({ search: debouncedSearch, sortBy, pageNumber: page, pageSize: 12 });
      if (response.success) {
        setDocuments(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      showToast("Failed to fetch documents", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sortBy, page]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto h-full text-slate-800 overflow-y-auto">
      <div className="flex justify-between items-start mb-8 pl-10 pr-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center">
            My Documents
            <span className="ml-3 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              {totalCount} {totalCount === 1 ? 'file' : 'files'}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage your uploaded files.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 items-end">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search files..."
              className="px-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              className="px-4 py-2 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size (Smallest)</option>
              <option value="size_desc">Sort by Size (Largest)</option>
            </select>
          </div>

          {/* Top Pagination Controls */}
          <div className="flex justify-end gap-2">

            <div className="flex items-center px-2 py-1 text-xs text-slate-600 font-medium">
              Page {page} of {totalPages === 0 ? 1 : totalPages}
            </div>
              <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="w-8 h-7 flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <i className="fas fa-chevron-left text-[10px] text-slate-600"></i>
            </button>
            <button 
              disabled={page === totalPages || totalPages === 0 || totalPages === 1} 
              onClick={() => setPage(p => p + 1)}
              className="w-8 h-7 flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <i className="fas fa-chevron-right text-[10px] text-slate-600"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="px-10">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <i className="fas fa-spinner fa-spin text-3xl text-slate-400"></i>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-16 text-center">
            <i className="fas fa-folder-open text-4xl text-slate-300 mb-4"></i>
            <h3 className="text-lg font-medium text-slate-700">No documents found</h3>
            <p className="text-slate-500 mt-1 text-sm">Upload some files or try a different search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentTile key={doc.id} doc={doc} formatSize={formatSize} formatDate={formatDate} />
              ))}
            </div>
           
          </>
        )}
      </div>
    </div>
  );
}

function DocumentTile({ doc, formatSize, formatDate }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load the secure blob URL for the preview image
    let isMounted = true;
    documentApi.getPreviewBlobUrl(doc.id).then(url => {
      if (isMounted) setPreviewUrl(url);
    }).catch(() => {
      // Ignore error, fallback to icon
    });
    
    return () => {
      isMounted = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.id]);

  const isImage = doc.displayName.toLowerCase().match(/\.(jpeg|jpg|png|gif)$/);

  return (
    <div 
      onClick={() => navigate(`/emp/documents/${doc.id}`)}
      className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 cursor-pointer hover:border-slate-300 hover:scale-[1.02]"
    >
      {/* Top 3/4: Preview Area */}
      <div className="h-44 bg-slate-50 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
        {previewUrl && isImage ? (
          <img src={previewUrl} alt={doc.displayName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex flex-col items-center text-slate-300 transition-transform duration-300 group-hover:scale-110">
            <i className={`fas text-5xl ${
              doc.displayName.endsWith('.pdf') ? 'fa-file-pdf text-red-300' :
              doc.displayName.endsWith('.xlsx') || doc.displayName.endsWith('.xls') ? 'fa-file-excel text-green-400' :
              'fa-file-alt'
            }`}></i>
          </div>
        )}
      </div>
      
      {/* Bottom 1/4: Metadata */}
      <div className="p-4 flex flex-col gap-1.5 bg-white">
        <h4 className="text-sm font-semibold text-slate-800 truncate" title={doc.displayName}>
          {doc.displayName}
        </h4>
        <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold tracking-wide uppercase">
          <span>{formatSize(doc.sizeInBytes)}</span>
          <span>{formatDate(doc.uploadedAt)}</span>
        </div>
      </div>
    </div>
  );
}
