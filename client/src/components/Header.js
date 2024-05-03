import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/solid';
import Dropdown from './Dropdown';
import Switcher from '../components/Switcher';
import ModalAvatar from '../components/ModalAvatar';

const Header = () => {
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [credentialsChanged, setCredentialsChanged] = useState(false);

  useEffect(() => {
    // Function to fetch user credentials from sessionStorage
    const fetchUserCredentials = () => {
      const storedCredentials = sessionStorage.getItem('userCredentials');
      if (storedCredentials) {
        const credentials = JSON.parse(storedCredentials);
        setRole(credentials.role);
        setAvatar(credentials.avatar);
        setUsername(credentials.username);
        setCredentialsChanged(false); // Reset credentialsChanged flag
      }
    };

    fetchUserCredentials(); // Fetch user credentials initially

    // Listen for changes in sessionStorage
    const handleStorageChange = (event) => {
      if (event.key === 'userCredentials') {
        setCredentialsChanged(true); // Set credentialsChanged flag when credentials change
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [credentialsChanged]); // Trigger effect when credentialsChanged flag changes

  // Function to set avatar
  const setAvatarImage = () => {
    setAvatar(credentials.avatar);
  };

  return (
    <div className="overflow-hidden">
      <header className="dark:bg-neutral-900 w-screen bg-white p-3 border-b-[1px] border-black dark:border-neutral-500 dark:shadow-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="text-black pt-1 ml-5"><Switcher /></button>
          </div>
          <div className="flex items-center space-x-4 flex-row-reverse">
            <div className="flex flex-col mr-2">
              <span className="text-sm font-medium text-gray-800 dark:text-neutral-300 ml-3">{username}</span>
              <span className="text-xs text-gray-500 dark:text-neutral-400 ml-3">{role}</span>
            </div>
            <Dropdown>
              {[
                <button className="focus:outline-none" onClick={setAvatarImage}>
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="h-9 w-9 rounded-full border-2 border-neutral-700 dark:border-neutral-300 transition duration-300 transform hover:scale-110"
                  />
                </button>,
                [
                  'Customize Profile',
                ].map((item, index) => (
                  <a
                    key={index}
                    onClick={handleCustomizeProfileClick}
                    className="block text-sm hover:bg-gray-100 hover:text-gray-900 dark:hover:text-gray-900 dark:text-neutral-300 cursor-pointer"
                  >
                    {item}
                  </a>
                )),
              ]}
            </Dropdown>
            <BellIcon className="h-8 w-8 text-neutral-700 rounded-full p-1 hover:bg-neutral-700 hover:text-white dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-700 cursor-pointer" />
          </div>
        </div>
      </header>

      {isProfileModalOpen && (
        <ModalAvatar onClose={closeProfileModal}>
          {/* Add the content you want to show in the modal here */}
        </ModalAvatar>
      )}

    </div>
  );
};

export default Header;
