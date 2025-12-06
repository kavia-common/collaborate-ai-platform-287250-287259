import React from 'react';

// PUBLIC_INTERFACE
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, isDeleting = false }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md pointer-events-auto transform transition-all animate-fade-in-up">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { onConfirm(); onClose(); }}
                className={`px-4 py-2 text-white rounded-lg font-medium shadow-md transition-all ${isDeleting ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-primary hover:bg-primary-700 shadow-blue-500/20'}`}
              >
                {isDeleting ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
