import connectDb from "@/lib/connectDb";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schemas/signupSchema";
import {date, z} from "zod"

export async function POST(request: Request){
    await connectDb();

    try {
        const {username, otp} = await request.json();
        const user = await UserModel.findOne({username});
        if(!user){
            return Response.json({
                success: false,
                message: "user not found"
            }, {status: 500})
        }
        
        const isOTPCorrect = user.verifyCode === otp;
        const isOTPValid = new Date(user.verifyCodeExpiry) > new Date();

        if(isOTPValid && isOTPCorrect){
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                message: "Account verfied successfully"
            }, {status: 200});
        }
        else if(!isOTPValid){
            return Response.json({
                success: false,
                message: "Verification code has expired. Please sign up again to get a new code"
            }, {status: 400})
        }
        else{
            return Response.json({
                success: false,
                message: "incorrect otp"
            }, {status: 400})
        }


    } catch (error) {
        console.log("error verifying otp");
        return Response.json({
            success: false,
            message: "error verifying otp"
        }, {status: 500})
    }
}