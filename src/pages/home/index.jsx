import React, {useState} from 'react'
// import LOGO from './../../assets/logo.png'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const [showhide, setShowhide] = useState(true)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const doLogin = (e) => {
    e.preventDefault();
    if(email === '' || password === '') {
      toast.error("Please fill out all details to login");
    }

    if(email == "thegildgroup@gmail.com" && password == "12345678") {
      localStorage.setItem('token', 'true');
      localStorage.setItem('user', 'admin@admin.com');
      navigate('/dashboard');
      toast.success('Login successful');
    } else {
      toast.error('Login failed');
    }
  }
  
  return (
    <>
    <div className="bg-gray-50" style={{backgroundColor:"#FFF5BA"}}>
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="max-w-md w-full">
          <a href="javascript:void(0)"> <h1 style={{color:"Green", fontSize:"30px", textAlign:"center", fontWeight:"bolder", paddingBottom:"10px"}}>The Gild Group</h1>
            
            {/* <img
            src={LOGO} alt="logo" className='w-60 mb-8 mx-auto block' /> */}
          </a>

          <div className="p-8 rounded-2xl bg-white shadow">
            <h2 className="text-gray-800 text-center text-2xl font-bold">Sign in</h2>
            <form className="mt-8 space-y-4" onSubmit={(e) => doLogin(e)}>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">Email Address</label>
                <div className="relative flex items-center">
                  <input name="email" type="email" required className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600" placeholder="Enter Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" className="w-4 h-4 absolute right-4" viewBox="0 0 24 24">
                    <circle cx="10" cy="7" r="6" data-original="#000000"></circle>
                    <path d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z" data-original="#000000"></path>
                  </svg>
                </div>
              </div>

              <div>
                <label className="text-gray-800 text-sm mb-2 block">Password</label>
                <div className="relative flex items-center">
                  <input name="password" type={showhide ? "password" : "text"} required className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <div className="w-4 h-4 absolute right-4 cursor-pointer" onClick={(e)=> setShowhide(!showhide)}>
                    {
                      !showhide ?
                      <FaEye color='#bbb' />
                      :
                      <FaEyeSlash color='#bbb' />
                    }
                    
                  </div>
                  
                </div>
              </div>

              <div className="!mt-8">
                <button type="submit" className="w-full py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
export default Home