import connectDb from "@/lib/connectDb";
import UserModel from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"
import { sendEmail } from "@/lib/mailer";

connectDb();

export async function POST(request: NextRequest){
    const {username, email, password} = await request.json();
    const existingUsername = await UserModel.findOne({username, isVerified: true});
    if(existingUsername){
        return NextResponse.json({
            success: false,
            message: 'Username is already taken'
        }, {status: 400})
    }
    const existingEmail = await UserModel.findOne({email});
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    if(existingEmail){
        if(existingEmail.isVerified){
            return NextResponse.json({
                success: false,
                message: 'User already exists with this email'
            }, {status: 400})
        }
        else{
            const hashedPassword = await bcryptjs.hash(password, 10);
            existingEmail.password = hashedPassword;
            existingEmail.verifyCode = otp;
            existingEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); //1hr from now
            await existingEmail.save();
        }
    }
    else{
        const hashedPassword = await bcryptjs.hash(password, 10);
        const codeExpiryTime = new Date(Date.now() + 3600000);
        const newUser = new UserModel({
            username, 
            email,
            password: hashedPassword,
            verifyCode: otp,
            verifyCodeExpiry: codeExpiryTime, 
            isVerified: false,
            isAcceptingMessages: true,
            messages: []
        })
        await newUser.save();
    }

    // send verification email 
    try {
        await sendEmail({email, verifyCode: otp });
        return NextResponse.json({
            success: true,
            message: "user created successfully" 
        }, {status: 200})
    } catch (error: any) {
        return  NextResponse.json({error: error.message}, {status: 500})
    }
    
}