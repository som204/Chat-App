import React from 'react'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Login from '../Component/Login'
import Register from '../Component/Register'
import Home from '../Component/Home'
import Chat from '../Component/Chat'
import UserAuth from '../Authorization/UserAuth'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<UserAuth><Home/></UserAuth>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/chat/:projectId' element={<UserAuth><Chat/></UserAuth>} />
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes