import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home, Dashboard, ArtistDetails, TourDetails } from './pages'

const App = () => {
  return (
    <Routes>
       <Route path='/' element={<Home />} />
       <Route path='/dashboard' element={<Dashboard />} />
       <Route path='/artist/:artistId' element={<ArtistDetails />} />
       <Route path='/tour/details/:artistId/:tourId' element={<TourDetails />} />
       {/*  <Route path='/wallet' element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
       <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
       <Route path='/profile/:slug' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
       <Route path='/my/games' element={<ProtectedRoute><Games /></ProtectedRoute>} />
       <Route path='/game/:slug' element={<GameDetails />} />
       <Route path='/verify-email/:token' element={<VerifyEmail />} /> */}
    </Routes>


  )
}

export default App
