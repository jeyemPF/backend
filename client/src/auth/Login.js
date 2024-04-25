import React, { useEffect, useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const InputField = ({ type, name, placeholder, value, onChange, icon, error }) => {
  return (
    <div className='relative'>
      <input
        className='border border-black rounded-md py-3 px-3 w-full'
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {icon && (
        <button
          className='absolute top-1/2 transform -translate-y-1/2 right-1 focus:outline-none pr-4'
          onClick={icon.onClick}
        >
          {icon.component}
        </button>
      )}
      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </div>
  );
};

function Login() {

  // Email
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState('');
  // Password
  const [password, setPassword] = useState("");
  const [passwordError, setpasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (setValue) => (event) => {
    setValue(event.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (isEmpty(email)) {
      setEmailError('Please fill out this field.');
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
    }
    if (isEmpty(password)) {
      setpasswordError('Please fill out this field.');
    }

    try {
      const credentials = {
        email,
        password
      };
  
      const response = await axios.post('http://localhost:8800/api/auth/login', credentials);
  
      console.log('Login successful');
      console.log('Response:', response.data);
  
      // Redirect to the dashboard route after successful login
      navigate("/dashboard");
  
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Unauthorized (401) status code indicates incorrect password
        console.error('Incorrect password');
        setErrorMessage('Incorrect password'); // Set error message for incorrect password
      } else {
        // Handle other errors
        console.error('Login failed:', error.response ? error.response.data.message : error.message);
        setErrorMessage('Invalid email or incorrect password.');
      }
    }
  }
  useEffect(() => {
    console.log(email);
    console.log(password);
  }, [password, email]);

  return (
    <div className='flex flex-col items-center justify-center mt-32'>
      <div className='border-2 border-black rounded-lg shadow-lg w-full max-w-md p-8'>
        <div className='flex justify-end'>
          <button onClick={() => navigate('/')} className='text-2xl'><HiOutlineXMark /></button>
        </div>
        <h1 className='text-4xl font-black text-left'>Sign in</h1>
        <p className='font-normal text-left mt-1'>Stay updated on your bookings.</p>

        <div className='mt-12'>
          <InputField
            type='email'
            name='email'
            placeholder='Email Address:'
            value={email}
            onChange={handleInputChange(setEmail)}
            icon={null}
            error={emailError}
          />
        </div>

        <div className='relative mt-4'>
          <InputField
            type={showPassword ? 'text' : 'password'}
            name='password'
            placeholder='Password:'
            value={password}
            onChange={handleInputChange(setPassword)}
            error={passwordError}
            icon={{
              component: showPassword ? <BsEyeSlash /> : <BsEye />,
              onClick: togglePasswordVisibility,
            }}
          />
        </div>

        <div className="text-red-500 mt-2">{errorMessage}</div>

        <div className='text-center mt-14 mb-5'>
          <button onClick={handleLogin} className='bg-white text-black font-semibold rounded-2xl border-2 border-black py-3 w-full hover:bg-black hover:text-white transition-colors duration-300'>Sign in</button>
        </div>
      </div>
      <div className='text-center text-base font-light mt-2'>
        <h1>
          <span>&#169;</span>2023 DeskMe, All right reserved. Privacy Policy <br /> and Terms & Conditions.
        </h1>
      </div>
    </div>
  );
}

export default Login;
