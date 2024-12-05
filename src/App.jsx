import React, { useState, useEffect } from "react";
import FormInput from "./components/FormInput";
import FormTable from "./components/FormTable";
import FormOrders from "./components/FormOrders"
import RequireAuth from "./components/RequireAuth";
import NotFound from "./components/NotFound";
import Admin from "./pages/Admin";
import Tables from "./pages/Tables";
import Ordering from "./pages/Ordering";
import Login from "./pages/Login";

import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./firebase";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setCurrentUser(currentUser);
        return;
      }

      setCurrentUser(null);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setCurrentUser(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/tables" />} />

        {/* Public Routes */}
        <Route path="/tables" element={<Tables />} />
        <Route path="/tables/:tableNumber" element={<Ordering />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <RequireAuth currentUser={currentUser}>
              <Admin />
            </RequireAuth>
          }
        >

          <Route path="table" element={<FormTable />} />
          <Route path="product" element={<FormInput />} />
          <Route path="order" element={<FormOrders />} />
        </Route>

        <Route path="*" element={<NotFound />}  />
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App;
