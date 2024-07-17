import connectDb from "@/lib/connectDb";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schemas/signupSchema";
import {z} from "zod"

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request){
    await connectDb();

    try {
        //we will get user's input username as url query param: ex. localhost:3000/c-u-u?username=abhishek
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get('username')
        }
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length>0? usernameErrors.join(', ') : "Invalid query param" 
            }, {status: 400});
        }

        const {username} = result.data;
        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true });
        if(existingVerifiedUser){
            return Response.json({
                success: false,
                message: "Username already exists" 
            }, {status: 400});
        }

        return Response.json({
            success: true,
            message: "Username is unique" 
        }, {status: 201});


    } catch (error) {
        console.log("error checking username");
        return Response.json({
            success: false,
            message: "error checking username"
        }, {status: 500})
    }
}

