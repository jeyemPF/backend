import React, { useState } from 'react';
import useFetch from '../Hooks/useFetch';
import axiosInstance from '../utils/axiosInstance'; // Import axiosInstance

const ModalAvatar = ({ onClose, avatar, username }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    
    // Check if file is valid
    if (!file || !(file instanceof Blob)) {
      console.error('Invalid file selected');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      // Update the avatar image source with the uploaded file
      const avatarElement = document.querySelector('div.avatar img');
      avatarElement.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const formData = new FormData();
      formData.append("avatar", "value"); // Assuming 'avatar' is the key for the avatar file
  
      // Send PATCH request to update avatar using axiosInstance
      const response = await axiosInstance.patch('/api/users/self/avatar', formData);
  
      // Check if the response is successful
      if (response.ok) {
        onClose(); // Close the modal
      } else {
        throw new Error('Failed to upload avatar');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  return (
    <div className="fixed px-5 inset-0 z-10 overflow-y-auto bg-opacity-20" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-neutral-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-300 text-center">My Profile</h2>
            <form className="mt-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <div className="flex items-center justify-center w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-500 dark:border-neutral-300 avatar mx-auto">
                  <img src={avatar} alt="Avatar"/>
                </div>
              </div>
              <label htmlFor="avatar-upload" className="items-center justify-center text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-neutral-400 cursor-pointer">Change Avatar</label>
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              <div className="mb-4 text-left">
                <label className="mt-5 block text-sm font-normal text-gray-700 dark:text-neutral-300">Edit name:</label>
                <input
                  type="text"
                  className="border-[1px] border-neutral-300 rounded-sm p-2 mt-1 block w-full pl-5 text-sm text-gray-700 placeholder-gray-400"
                  placeholder={username}
                />
              </div>
            </form>
          </div>

          <div className="bg-gray-100 dark:bg-neutral-950 px-6 py-3 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-green-700  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSaveChanges}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-neutral-700 dark:hover:bg-neutral-500 text-base font-medium text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-700 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAvatar;
