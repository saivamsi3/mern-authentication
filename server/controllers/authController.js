import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"
import transporter from "../config/nodemailer.js"
import { EMAIL_VERIFY_TEMPLATE , PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";


//REGISTER
export const register = async (req,res)=>{
    const {name,email,password} = req.body ||{};
    if (!name || !email || !password){
        return res.json({success:false,message : "missing details"})
    }
    try{
        const existingUser =  await userModel.findOne({email})
        if(existingUser){
            return res.json({success : false ,message : "user already exists"});
        }
        const hashPassword = await bcrypt.hash(password,10) 
        const user = new userModel({name,email,password:hashPassword});
        await user.save();
        const token = jwt.sign({id : user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
        
        res.cookie("token",token,{
          httpOnly:true,
          secure:process.env.NODE_ENV==="production",
          sameSite:process.env.NODE_ENV==="production" ? "none" : "strict",
          maxAge : 7 * 24 * 60 * 60 * 1000
        });

    // sending wellcome email
    const mailOpentions = {
     from : process.env.SENDER_EMAIL ,
     to: email,
     subject:"wellcome to GreatStack",
     text :`wellcome to GreatStack website. your account has been created with email id:${email}`

    }
      await transporter.sendMail(mailOpentions);
      

        return res.json({success:true});
    
    }
    catch(error){
        res.json({success : false, message : error.message})

    }
}  

 //LOGIN 
export const login = async(req,res)=>{
    const {email,password} = req.body ||{};
    if(!email || !password){
       return res.json({success:false,message:"email and password are required"})

    }

    try{
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:"invalid email"})
        }

         const isMatch = await bcrypt.compare(password,user.password)
         if(!isMatch){
            return res.json({success:false,message:"invalid password"})
         }
         const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"})
           res.cookie("token",token,{
          httpOnly:true,
          secure:process.env.NODE_ENV==="production",
          sameSite:process.env.NODE_ENV==="production" ? "none" : "lax",  // "strict"
          maxAge : 7 * 24 * 60 * 60 * 1000
        }) ; 
       return res.json({success:true , id : user._id});

       


    }catch(error){
    res.json({success : false, message : error.message})

    }
}

//LOGOUT
export const logout =  async(req,res)=>{
    try{
         res.clearCookie("token",{ 
            httpOnly: true,
          secure:process.env.NODE_ENV==="production",
          sameSite:process.env.NODE_ENV==="production" ? "none" : "strict",
        })
                res.json({success:true,message:"Logged Out"})

    }
    catch(error){
        res.json({success:false,message:error.message})
    }
}

// send  verification OTP to the user's Email
export const sendVerifyOtp = async(req,res)=>{
  try{
       const userId = req.userId;
       const user = await userModel.findById(userId);
       if(user.isAccountVerified){
          return res.json({success:false ,message:"account is already verified"})
       }
    
       const otp = String(Math.floor(100000 + Math.random()*900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
       await user.save();
       const mailOption =
        {
        from : process.env.SENDER_EMAIL ,
        to: user.email,
        subject:"Account Verification OTP",
        // text :`your OTP is ${otp}. Verify your account using this OTP.`
        html : EMAIL_VERIFY_TEMPLATE.replace("{{otp}}" , otp).replace("{{email}}",user.email)

       }
       await  transporter.sendMail(mailOption);

       res.json({success:true,message:"Verification OTP send on Email"});

  }
 catch(error){
        res.json({success:false,message:error.message})
    }

}

// Verify the email using the OTP
export const verifyEmail = async(req,res)=>{
    const userId = req.userId;
     const {otp} = req.body; 

   if(!userId || !otp){
       return res.json({success:false,message:"Missing details"})
   }
   try{
        const user = await userModel.findById(userId)

        if(!user){
           return res.json({success:false , message:"User not found "})
        }

         if(user.verifyOtp === "" || user.verifyOtp.toString() !== otp.toString()){
           return res.json({success:false ,message:"invalid otp"})
         }

         if(user.verifyOtpExpireAt < Date.now()){
             return res.json({success:false , message:"OTP expired"})
         }
         user.isAccountVerified = true ;
         user.verifyOtp = "";
         user.verifyOtpExpireAt = 0;

         await user.save();
         return res.json({success:true , message:"Email Verified successfully"})
   }
   catch(error){
    res.json({success : false,  message : error.message})
   }
}

// Check if user is authenticated
export const isAuthenticated = async (req,res) => {
    try{
       return res.json({success:true})
    }
    catch(error){
    res.json({success : false,  message : error.message})
    }  
}

// send password Reset OTP
export const sendResetOtp = async(req,res)=>{
    const {email} = req.body;
    if(!email){
        res.json({success:false , message:"Email is required"})
    }
    try{
          const user = await userModel.findOne({email})
     if(!user){
          res.json({success:false , message:"user not found"})
        
    }
           const otp = String(Math.floor(100000 + Math.random()*900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
       await user.save();
       const mailOption =
        {
        from : process.env.SENDER_EMAIL ,
        to: user.email,
        subject:"password Reset OTP",
        // text :`your OTP for resetting your password is ${otp}. use this OTP to proceed with resetting your password.`
         html :PASSWORD_RESET_TEMPLATE.replace("{{otp}}" , otp).replace("{{email}}" , user.email)
    }
     await  transporter.sendMail(mailOption);
     return res.json({success:true, message: "OTP send your Email"})
}
    catch(error){
    res.json({success : false,  message : error.message})

    }

}

//Reset OTP Password
export const resetPassword = async(req,res)=>{
    const {email ,otp , newPassword} = req.body;
    if(!email || !otp || !newPassword){
        return res.json({success:false, message:"Email OTP and newPassword are required"})
    }
    try{
        const user= await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:"User not found"})
        }
        if(user.resetOtp === "" || user.resetOtp.toString() !== otp.toString()){
            return res.json({success:false , message:"Invalid OTP"})
        }
        if (user.resetOtpExpireAt < Date.now()){
            return res.json({success:false , message:"OTP Expired"})
        }

        const hashedPassword = await bcrypt.hash(newPassword,10)
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0 ;

        await user.save();
        return res.json({success:true, message:"Password has been reset successfully"})



    }catch(error){
           return  res.json({success : false,  message : error.message})

    }
}