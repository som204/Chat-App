import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../Context/user.context";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (user || token) {
      setLoading(false);
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserAuth;
