import React from 'react'
import AdminIcon from './../../assets/manager.png'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const do_logout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    }

    const handleFlushData = async () => {
      const userConfirmed = window.confirm("Are you sure you want to flush all data?");
      if (userConfirmed) {
        try {
          // Make a DELETE request to the backend to flush all data
          const response = await fetch('http://localhost:5000/flush-all-data', {
            method: 'DELETE',
          });
          
    
          if (response.ok) {
            toast.success("All information has been flushed.");
            localStorage.clear();
            navigate('/');
          } else {
            toast.error("Failed to flush data.");
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error("An error occurred while flushing data.");
        }
      }
    };

    
  return (
    <div class="relative bg-[#f7f6f9] h-full min-h-screen">
    <div class="flex items-start">
      <nav id="sidebar" class="lg:min-w-[250px] w-max max-lg:min-w-8">
        <div id="sidebar-collapse-menu"
          class="bg-white shadow-lg h-screen fixed top-0 left-0 overflow-auto z-[2] lg:min-w-[250px] lg:w-max max-lg:w-0 max-lg:invisible transition-all duration-500">
          <div class="flex items-center justify-center gap-2 pt-6 pb-2 px-4 sticky top-0 bg-white min-h-[64px] z-[100]">
            <a href="javascript:void(0)"><h1 style={{color:"Green", fontSize:"23px", textAlign:"center", fontWeight:"bolder", paddingBottom:"10px"}}>The Gild Group</h1>
              
              {/* <img src={LOGO} alt="logo"
                class='w-[140px]' /> */}
            </a>
            <button id="close-sidebar" class='lg:hidden ml-auto'>
              <svg class="w-7 h-7" fill="#000" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>

          <div class="py-4 px-4">
        
            <div class="mt-6">
              <ul class="mt-3 space-y-2">
                <li>
                  <Link to="/dashboard"
                    class="text-gray-800 text-sm flex items-center cursor-pointer bg-gray-100 rounded-lg px-3 py-2.5 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-[18px] h-[18px] mr-3"
                      viewBox="0 0 214.27 214.27">
                      <path
                        d="M196.926 55.171c-.11-5.785-.215-11.25-.215-16.537a7.5 7.5 0 0 0-7.5-7.5c-32.075 0-56.496-9.218-76.852-29.01a7.498 7.498 0 0 0-10.457 0c-20.354 19.792-44.771 29.01-76.844 29.01a7.5 7.5 0 0 0-7.5 7.5c0 5.288-.104 10.755-.215 16.541-1.028 53.836-2.436 127.567 87.331 158.682a7.495 7.495 0 0 0 4.912 0c89.774-31.116 88.368-104.849 87.34-158.686zm-89.795 143.641c-76.987-27.967-75.823-89.232-74.79-143.351.062-3.248.122-6.396.164-9.482 30.04-1.268 54.062-10.371 74.626-28.285 20.566 17.914 44.592 27.018 74.634 28.285.042 3.085.102 6.231.164 9.477 1.032 54.121 2.195 115.388-74.798 143.356z"
                        data-original="#000000" />
                      <path
                        d="m132.958 81.082-36.199 36.197-15.447-15.447a7.501 7.501 0 0 0-10.606 10.607l20.75 20.75a7.477 7.477 0 0 0 5.303 2.196 7.477 7.477 0 0 0 5.303-2.196l41.501-41.5a7.498 7.498 0 0 0 .001-10.606 7.5 7.5 0 0 0-10.606-.001z"
                        data-original="#000000" />
                    </svg>
                    <span>Artist</span>
                  </Link>
                </li>
                <li>
                  <div onClick={() => do_logout()}
                    class="text-gray-800 text-sm flex items-center cursor-pointer hover:bg-gray-100 rounded-md px-3 py-2.5 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-[18px] h-[18px] mr-3"
                      viewBox="0 0 64 64">
                      <path
                        d="M61.4 29.9h-6.542a9.377 9.377 0 0 0-18.28 0H2.6a2.1 2.1 0 0 0 0 4.2h33.978a9.377 9.377 0 0 0 18.28 0H61.4a2.1 2.1 0 0 0 0-4.2Zm-15.687 7.287A5.187 5.187 0 1 1 50.9 32a5.187 5.187 0 0 1-5.187 5.187ZM2.6 13.1h5.691a9.377 9.377 0 0 0 18.28 0H61.4a2.1 2.1 0 0 0 0-4.2H26.571a9.377 9.377 0 0 0-18.28 0H2.6a2.1 2.1 0 0 0 0 4.2Zm14.837-7.287A5.187 5.187 0 0 1 22.613 11a5.187 5.187 0 0 1-10.364 0 5.187 5.187 0 0 1 5.187-5.187ZM61.4 50.9H35.895a9.377 9.377 0 0 0-18.28 0H2.6a2.1 2.1 0 0 0 0 4.2h15.015a9.377 9.377 0 0 0 18.28 0H61.4a2.1 2.1 0 0 0 0-4.2Zm-34.65 7.287A5.187 5.187 0 1 1 31.937 53a5.187 5.187 0 0 1-5.187 5.187Z"
                        data-name="Layer 47" data-original="#000000" />
                    </svg>
                    <span>Logout</span>
                  </div>
                </li>
              
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <button id="open-sidebar" class='lg:hidden ml-4 mt-4 fixed top-0 left-0 bg-white z-[50]'>
        <svg class="w-7 h-7" fill="#000" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clip-rule="evenodd"></path>
        </svg>
      </button>

      <section class="main-content w-full px-6">
        <header class='z-[5] bg-[#f7f6f9] sticky top-0 pt-4'>
          <div
            class='flex flex-wrap items-center px-6 py-2 bg-white shadow-md min-h-[56px] rounded-md w-full relative tracking-wide'>
            <div class='flex items-center flex-wrap gap-x-8 gap-y-4 z-50 w-full'>
              <div class='flex items-center gap-4 py-1 outline-none border-none font-bold uppercase text-[#202020]'>
                Artist Event Tracker
              </div>
              <div class="flex items-center gap-8 ml-auto">
              <button
  type="button"
  onClick={handleFlushData}
  className="px-5 py-2 rounded-full text-white text-xs tracking-wider border border-current outline-none hover:bg-[#202020] bg-[#ff7070]"
>
  Flush All Data
</button>
                <div class="dropdown-menu relative flex shrink-0 group">
                  <img src={AdminIcon} alt="profile-pic"
                    class="w-9 h-9 rounded-full border-2 border-gray-300 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6">{children}</div>
      </section>
    </div>
  </div>
  )
}


export default Layout