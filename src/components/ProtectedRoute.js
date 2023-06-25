import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
// const ProtectedRoute = ({ children }) => {
//     const { user } = useUserAuth();

//     console.log("Check user in Private: ", user);
//     if (!user) {
//         return <Navigate to="/" />;
//     }
//     return children;
// };


const ProtectedRoute = ({ children }) => {
    const { user, loading } = useUserAuth();
  
    console.log("Check user in Private: ", user);
  
    if (loading) {
      // Render a loading state or spinner until the authentication state is resolved
      return <div>Loading...</div>;
    }
  
    if (!user) {
      return <Navigate to="/" />;
    }
  
    return children;
  };

export default ProtectedRoute;