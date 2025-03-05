import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import page from "page";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      page("/register");
    }
  }, [loading, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : null;
};

export default ProtectedRoute;
