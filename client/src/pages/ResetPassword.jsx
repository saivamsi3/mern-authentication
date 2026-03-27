import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function ResetPassword() {

  let {backendUrl} = useContext(AppContext)
  axios.defaults.withCredentials = true;


  
  
  let [email , setEmail] = useState("")
  let [newPassword , setNewPassword] = useState("")
    let [isEmailSend , setIsEmailSend] = useState("")
  let [otp , setOtp] = useState(0)
  let [isOtpSubmited, setIsOtpSubmited] = useState(false);

  let navigate = useNavigate();

   let inputRefs = React.useRef([]);

   let handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

   let handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  
   let handlePaste = (e) => {
    let paste = e.clipboardData.getData("text");
    let pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  let onSubmitEmail = async(e)=>{
      e.preventDefault();
      try{
        let {data} =  await axios.post( backendUrl + "/api/auth/send-reset-otp",{email})
        data.success ? toast.success(data.message) :  toast.error(data.message)
        data.success && setIsEmailSend(true)
      } 
      catch(error){
        toast.error(error.message)
      }
  }

  let onSubmitOTP = async(e)=>{
          e.preventDefault();
      let otpArray = inputRefs.current.map((input) => input?.value || "");
       setOtp(otpArray.join(""))
       setIsOtpSubmited(true)
  }

  let onSubmitNewPassword = async(e)=>{
              e.preventDefault();
 try{
        let {data} =  await axios.post( backendUrl + "/api/auth/reset-password",{email , otp,newPassword})
        data.success ? toast.success(data.message) :  toast.error(data.message)
        data.success && navigate("/")
      } 
      catch(error){
        toast.error(error.message)
      }

  }

  return (
    <div className=" flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
 {/* enter email id */}

  {!isEmailSend &&

      <form  onSubmit={ onSubmitEmail}   className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
         <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Reset Password
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter your registered  email address.
        </p>
        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full  bg-[#333A5C]">
          <img src= {assets.mail_icon} alt="" className="w-3 h-3"/>
          <input type="email"  placeholder="Email id" className="bg-transparent outline-none text-white"
          value = {email}  onChange={e =>setEmail(e.target.value)} required
          />
        </div>
 <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">Submit</button>
      </form>
}

{/* otp input form  */}

{!isOtpSubmited && isEmailSend &&

       <form onSubmit={onSubmitOTP}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Reset Password OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code send to your email id.
        </p>

        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>
        <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
          Submit
        </button>
      </form>
}

      {/*  Enter new password*/}

      { isOtpSubmited  && isEmailSend &&

  <form onSubmit={onSubmitNewPassword } className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
         <h1 className="text-white text-2xl font-semibold text-center mb-4">
          New Password
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the new password blow.
        </p>
        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full  bg-[#333A5C]">
          <img src= {assets.lock_icon} alt="" className="w-3 h-3"/>
          <input type="password"  placeholder="Password" className="bg-transparent outline-none text-white"
          value = {newPassword}  onChange={e =>setNewPassword(e.target.value)} required
          />
        </div>
 <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">Submit</button>
      </form>
}


    </div>


  );
}

export default ResetPassword;
