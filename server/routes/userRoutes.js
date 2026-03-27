import express from "express"
const userRouter = express.Router();
import userAuth from "../middleware/userAuth.js";
import { getUserData } from "../controllers/userController.js";

 userRouter.get("/data" , userAuth , getUserData);

 export default userRouter;