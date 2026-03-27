import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export let AppContext = createContext();
export let AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;

  let backendUrl = import.meta.env.VITE_BACKEND_URL;

  let [isLoggedin, setIsLoggedin] = useState(false);
  let [userData, setUserData] = useState(false);

  let getAuthState = async () => {
    try {
      let { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      }
    } catch (error) {
      toast.error(error.message6);
    }
  };

  let getUserData = async () => {
    try {
      let { data } = await axios.get(backendUrl + "/api/user/data");
      data.success ? setUserData(data.userData) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  let value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
