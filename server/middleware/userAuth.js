import jwt from "jsonwebtoken"

const userAuth = async(req,res,next)=>{
   
   console.log("Cookies:", req.cookies);
   
    const {token} = req.cookies || {};

    if(!token){
       return res.json({success:false , message:"not Authorized Login Again"})
    }
        try{
           const tokenDecode = jwt.verify(token,process.env.JWT_SECRET)
           
            if(tokenDecode.id){
                req.userId = tokenDecode.id;
            }
            else{
               return res.json({success:false , message:"not Authorized Login Again"})
            }
              next();

        }
        catch(error){
         res.json({success:false , message:"not Authorized Login Again"})         }
}
export default userAuth;
