import React from 'react'
import { Navigate } from 'react-router-dom'

const RequireAuth = ({children, currentUser}) => {
    console.log(currentUser); 
  return (
    currentUser ? children : <Navigate to='/login'/>
  )
}

export default RequireAuth