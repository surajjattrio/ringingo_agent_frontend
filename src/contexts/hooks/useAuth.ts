import { useContext } from "react";

// PROJECT IMPORTS
import AuthContext from "../AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("context must be use inside provider");
  return context;
};
