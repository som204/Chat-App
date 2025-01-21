import React from 'react'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Login from '../Component/Login'
import Register from '../Component/Register'
import Home from '../Component/Home'
import Chat from '../Component/Chat'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/chat' element={<Chat/>} />
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes