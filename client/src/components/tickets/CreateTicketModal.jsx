import React, { useState } from 'react';
import { ticketApi } from '../../api/ticketApi';
import Toast from '../common/Toast';

const CreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('1');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const invalidFiles = files.filter(f => {
      const extension = f.name.split('.').pop().toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      setToast({ show: true, message: 'Only JPEG, PNG, and PDF files are allowed.', type: 'error' });
      return;
    }

    if (attachments.length + files.length > 3) {
      setToast({ show: true, message: 'You can only upload a maximum of 3 attachments.', type: 'error' });
      return;
    }
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveFile = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCreateTicket = async () => {
    if (!subject || !category || !priority || !description) {
      setToast({ show: true, message: 'Please fill out all required fields.', type: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('Subject', subject);
      formData.append('Category', category);
      formData.append('Priority', priority);
      formData.append('Description', description);
      
      attachments.forEach(file => {
        formData.append('Attachments', file);
      });

      await ticketApi.createTicket(formData);
      setToast({ show: true, message: 'Ticket created successfully!', type: 'success' });
      
      if (onSuccess) onSuccess();
      
      // Reset form
      setSubject('');
      setCategory('');
      setPriority('1');
      setDescription('');
      setAttachments([]);
      onClose();
    } catch (error) {
      console.error(error);
      setToast({ show: true, message: error.response?.data?.message || 'Failed to create ticket.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Create New Ticket</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-5 text-left">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-[13px] px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#ff0066] focus:border-[#ff0066]" 
                placeholder="e.g., Cannot access finance database"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-[13px] px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#ff0066] focus:border-[#ff0066]"
                >
                  <option value="">Select category</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Access Request">Access Request</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Priority <span className="text-red-500">*</span></label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full text-[13px] px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#ff0066] focus:border-[#ff0066]"
                >
                  <option value="1">Low</option>
                  <option value="2">Medium</option>
                  <option value="3">High</option>
                  <option value="4">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
              <textarea 
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-[13px] px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#ff0066] focus:border-[#ff0066]"
                placeholder="Describe your issue in detail..."
              ></textarea>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Attachment (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md hover:border-[#ff0066] transition-colors bg-slate-50 cursor-pointer">
                <div className="space-y-1 text-center">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-2"></i>
                  <div className="flex text-[13px] text-slate-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#ff0066] hover:text-[#e0005a] focus-within:outline-none">
                      <span>Upload files</span>
                      <input id="file-upload" name="file-upload" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    PNG, JPG, PDF up to 10MB (Max 3 files)
                  </p>
                </div>
              </div>
              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <li key={index} className="flex justify-between items-center text-[12px] bg-slate-100 px-3 py-2 rounded border border-slate-200">
                      <span className="truncate max-w-[80%] text-slate-700 font-medium">{file.name}</span>
                      <button onClick={() => handleRemoveFile(index)} className="text-red-500 hover:text-red-700">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded text-[13px] font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateTicket} 
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#ff0066] hover:bg-[#e0005a] text-white rounded text-[13px] font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>
      </div>
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </>
  );
};

export default CreateTicketModal;
