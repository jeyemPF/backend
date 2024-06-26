import nodemailer from 'nodemailer';
import Mailgen from "mailgen";
import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import { formatInTimeZone,  format } from 'date-fns-tz';


dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:  process.env.EMAIL,
        pass:  process.env.EMAIL_PASSWORD
    }
});

const  getEmailContent = (username, resetUrl) => {
    return {
        body: {
            name: username,
            intro: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.',
            action: {
                instructions: 'Click the button below to reset your password:',
                button: {
                    color: '#000000',
                    text: 'Reset your password',
                    link: resetUrl
                }
            },
            outro: 'If you did not request this, please ignore this email and your password will remain unchanged.'
        }
    };
};

const emailContents = (username) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to DeskMe! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with DeskMe, please click here:',
                button: {
                    color: '#000000',
                    text: 'Confirm your account',
                    link: 'https://deskme.com/confirm?s=d9729feb74992cc3482b350163a1a010'
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };
};

const generateMailGenerator = () => {
    return new Mailgen({
        theme: "default",
        product: {
            // Your product name or logo
            name: "DeskMe",
            link: "https://example.com/",
            // Optional product logo
            // logo: "https://mailgen.js/img/logo.png"
        }
    });
};

const sendRegistrationConfirmationEmail = async (email, emailBody, emailText) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Registration Confirmation',
            html: emailBody, // HTML content
            text: emailText // Plaintext content
        });

        return "User has been created";
    } catch (err) {
        throw err; // Rethrow the error to be handled by the caller
    }
};

const sendPasswordResetEmail = async (email, subject, htmlContent, textContent) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            html: htmlContent,
            text: textContent
        });
    } catch (err) {
        throw err; // Rethrow the error to be handled by the caller
    }
};



const sendMagicLink = async (user, res) => {
    const mailGenerator = generateMailGenerator();
    const token = crypto.randomBytes(32).toString("hex");
  
    const link = `http://localhost:3000/newpassword/${token}/${user.id}`;
  
    var emailMessage = {
        body: {
          name: user.username,
          intro: `<p style="font-size: 14px; color: #24292e; margin-bottom: 1rem !important;">You recently requested a password reset for your account. Please use the following link to reset your password:</p><a style="padding: 1rem 1.5rem; color: white; background-color:#000000; text-decoration:none; border-radius: 3px; border: 1px solid #000000; width: max-content;display: block;margin-bottom: 1rem !important;" href=${link} target="_blank">Reset password</a><p style="font-size: 14px; color: #24292e">If you don’t use this link within 10 minutes, it will expire. To get a new password reset link, visit: <a href="http://localhost:3000/newpassword">http://localhost:3000/newpassword</a></p>`,
          outro: `<p style="font-size: 14px; color: #24292e">If you did not initiate this request or have any concerns, please contact us immediately.</p>`,
        },
      };
  
    let mail = mailGenerator.generate(emailMessage);
  
    let message = {
      from: process.env.GSERVICE,
      to: user.email,
      subject: "[DeskMe] Please reset your password",
      html: mail,
    };
  
    try {
      const salt = await bcrypt.genSalt(10);
  
      const hashedToken = await bcrypt.hash(token, salt);
      const expiration = Date.now() + 10 * 60 * 1000;
  
      user.passwordResetToken.token = hashedToken;
      user.passwordResetToken.expiresAt = expiration;
  
      // Use transporter.sendMail instead of sendEmail
      await transporter.sendMail(message);
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "An error occurred." });
    }
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
};

const formatTime = (time) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(time).toLocaleTimeString(undefined, options);
};



const getEmailContentReservation = (username, reservation) => {
    const formattedDate = formatDate(reservation.date);
    const formattedStartTime = formatTime(reservation.startTime);
    const formattedEndTime = formatTime(reservation.endTime);

    return {
        body: {
            name: username,
            intro: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <p>Your reservation for "<strong>${reservation.deskTitle}</strong>" has been confirmed with the following details:</p>
                    <table style="border-collapse: collapse; width: 100%; font-size: 14px; margin-top: 10px;">
                        <thead>
                            <tr style="background-color: #f2f2f2; color: #333;">
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Detail</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Information</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #fafafa;"><strong>Date:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${formattedDate}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0;"><strong>Start Time:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${formattedStartTime}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #fafafa;"><strong>End Time:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${formattedEndTime}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0;"><strong>Status:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${reservation.status}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #fafafa;"><strong>Office Equipment:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${reservation.officeEquipment.join(', ')}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0;"><strong>Area:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${reservation.deskArea}</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    ${reservation.deskImage ? `
                    <div style="text-align: center; margin-top: 20px;">
                        <img src="${reservation.deskImage}" alt="Desk Image" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <br/>` : ''}
                    <p>Thank you for choosing us for your reservation. If you have any questions, feel free to contact us.</p>
                </div>
            `,
        }
    };
};




const sendReservationConfirmationEmail = async (email, emailContent) => {
    try {
        const mailGenerator = new Mailgen({
            theme: {
                // Define the custom theme
                name: 'default',
                textDirection: 'ltr',
                header: {
                    logo: 'https://res.cloudinary.com/dihmqs39z/image/upload/v1717536275/viql0flgvvdxzkx610jm.png',
                    logoHeight: '60px',
                    title: 'DeskMe'
                },
                body: {
                    backgroundColor: '#ffffff',
                    contentCellBackgroundColor: '#ffffff',
                    contentWidth: '600px',
                    fontFamily: 'Arial, sans-serif',
                    textColor: '#333333',
                    contentCellPadding: '20px',
                    button: {
                        color: '#ffffff',
                        backgroundColor: '#000000',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }
                },
                footer: {
                    textColor: '#333333',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '12px',
                    lineHeight: '18px',
                    padding: '20px 0 0 0',
                    link: {
                        color: '#000000',
                        textDecoration: 'underline'
                    }
                }
            },
            product: {
                name: 'DeskMe',
                link: 'http://localhost:3000/',
                logo: 'https://res.cloudinary.com/dihmqs39z/image/upload/v1717536275/viql0flgvvdxzkx610jm.png'
            }
        });

        const emailTemplate = mailGenerator.generate(emailContent);

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Reservation Confirmation',
            html: emailTemplate
        });

        console.log("Reservation confirmation email sent successfully.");
    } catch (err) {
        console.error("Error sending reservation confirmation email:", err);
        throw err; // Rethrow the error to be handled by the caller
    }
};

const getEmailContentCancellation = (username, reservation) => {
    const formattedDate = formatDate(reservation.date);
    const formattedStartTime = formatTime(reservation.startTime);
    const formattedEndTime = formatTime(reservation.endTime);
    return {
        body: {
            name: username,
            intro: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <p>Your reservation for "<strong>${reservation.deskTitle}</strong>" has been cancelled with the following details:</p>
                    <table style="border-collapse: collapse; width: 100%; font-size: 14px; margin-top: 10px;">
                        <thead>
                            <tr style="background-color: #f2f2f2; color: #333;">
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Detail</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Information</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #fafafa;"><strong>Date:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${formattedDate}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0;"><strong>Start Time:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${formattedStartTime}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #fafafa;"><strong>End Time:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${formattedEndTime}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0;"><strong>Status:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${reservation.status}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #fafafa;"><strong>Office Equipment:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${reservation.officeEquipment.join(', ')}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0;"><strong>Area:</strong></td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${reservation.deskArea}</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    <p>Thank you for choosing us for your reservation. If you have any questions, feel free to contact us.</p>
                </div>
            `,
        }
    };
};

const sendCancellationConfirmationEmail = async (email, emailContent) => {
    try {
        const mailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "DeskMe",
                link: "http://localhost:3000/"
            }
        });

        const emailTemplate = mailGenerator.generate(emailContent);

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Reservation Cancellation Confirmation',
            html: emailTemplate
        });

        console.log("Cancellation confirmation email sent successfully.");
    } catch (err) {
        console.error("Error sending cancellation confirmation email:", err);
        throw err;
    }
};

const mailOtpSender = async (email, title, body) => {
    try {
      // Create a Transporter to send emails
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD_EMAIL,
        }
      });
      // Send emails to users
      let info = await transporter.sendMail({
        from: 'www.deskme.me - Desk Me',
        to: email,
        subject: title,
        html: body,
      });
      console.log("Email info: ", info);
      return info;
    } catch (error) {
      console.log(error.message);
    }
  };



//   assign role

const sendRoleAssignmentEmail = async (email, username, role, password) => {
    const mailGenerator = generateMailGenerator();
    const emailContent = {
        body: {
            name: username,
            intro: `Welcome to DeskMe! You have been assigned the role of <strong>${role}</strong>. Your password is: <strong>${password}</strong>`,
            action: {
                instructions: 'To get started, please log in to your account:',
                button: {
                    color: '#000000',
                    text: 'Log in to DeskMe',
                    link: 'http://localhost:3000/login'
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };

    const emailBody = mailGenerator.generate(emailContent);
    const emailText = mailGenerator.generatePlaintext(emailContent);

    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Role Assignment - DeskMe',
            html: emailBody, // HTML content
            text: emailText // Plaintext content
        });

        console.log("Role assignment email sent successfully.");
    } catch (err) {
        console.error("Error sending role assignment email:", err);
        throw err; // Rethrow the error to be handled by the caller
    }
};


export const sendNotificationEmail = async (to, subject, text) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Notification email sent successfully');
    } catch (error) {
        console.error('Error sending notification email:', error);
    }
};



export { transporter,
        mailOtpSender,
        sendRoleAssignmentEmail,
        sendCancellationConfirmationEmail,
        getEmailContentCancellation,
        sendReservationConfirmationEmail,
        getEmailContentReservation,
        getEmailContent,
        emailContents,
        generateMailGenerator,
        sendRegistrationConfirmationEmail,
        sendPasswordResetEmail,
        sendMagicLink  };