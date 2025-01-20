import React from 'react'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Login from '../Component/Login'
import Register from '../Component/Register'
import Home from '../Component/Home'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes