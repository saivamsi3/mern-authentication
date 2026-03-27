import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from  "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000
connectDB();

app.use(express.json()); // ✅ must be before routes

const allowedOrigins = ["http://localhost:5173"]

app.use(express.json());
app.use(cors({ origin: allowedOrigins , credentials:true}))
app.use(cookieParser());


//  Register routes properly
 app.use("/api/auth",authRouter)
  app.use("/api/user",userRouter)


// APL end point 
app.get( "/",(req,res)=>{
    res.send("API working fine")
   
})

app.listen(port , ()=>console.log(`server started on PORT:${port}`));