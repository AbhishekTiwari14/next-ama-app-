import nodemailer from 'nodemailer';

export const sendEmail = async({email, verifyCode}:any) => {
    try {
        
        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.MAILTRAP_USER,
              pass: process.env.MAILTRAP_PASSWORD
            }
          });


        const mailOptions = {
            from: 'abhishek.tiwari2003@gmail.com',
            to: email,
            subject: "Verify Your Email ID | OTP: ",
            html: `<h2>OTP: ${verifyCode}</h2> <p> Thank you for signing up to AMA app.Please verify your email address by entering the above otp in ama application. </p>`
        }

        const mailresponse = await transport.sendMail
        (mailOptions);
        return mailresponse;

    } catch (error:any) {
        throw new Error(error.message);
    }
}