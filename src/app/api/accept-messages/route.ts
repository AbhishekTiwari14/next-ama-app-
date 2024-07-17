import connectDb from "@/lib/connectDb";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/User";


export async function POST(request: Request){
    await connectDb();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !session.user) {
        return Response.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        );
    }

    const userId = user._id;
    const { acceptMessages} = await request.json();
    try {
        // Update the user's message acceptance status
    const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { isAcceptingMessages: acceptMessages },
        { new: true }   //this makes sure that updateUser will store updated value
      );
      if (!updatedUser) {
        // User not found
        return Response.json(
          {
            success: false,
            message: 'Unable to find user to update message acceptance status',
          },
          { status: 404 }
        );
      }
  
      // Successfully updated message acceptance status
      return Response.json(
        {
          success: true,
          message: 'Message acceptance status updated successfully',
          updatedUser,
        },
        { status: 200 }
      );

    } catch (error) {
        console.error('Error updating message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error updating message acceptance status' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    // Connect to the database
    await connectDb();
  
    // Get the user session
    const session = await getServerSession(authOptions);
    const user = session?.user;
  
    // Check if the user is authenticated
    if (!session || !user) {
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
  
    try {
      // Retrieve the user from the database using the ID
      const foundUser = await UserModel.findById(user._id);
  
      if (!foundUser) {
        // User not found
        return Response.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
  
      // Return the user's message acceptance status
      return Response.json(
        {
          success: true,
          isAcceptingMessages: foundUser.isAcceptingMessages,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error retrieving message acceptance status:', error);
      return Response.json(
        { success: false, message: 'Error retrieving message acceptance status' },
        { status: 500 }
      );
    }
  }