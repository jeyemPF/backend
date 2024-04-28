import User from "../models/User.js";
import { sendMagicLink, emailContents, generateMailGenerator ,sendRegistrationConfirmationEmail ,sendPasswordResetEmail } from '../utils/emailService.js';
import bcrypt from "bcryptjs"
import { createError } from "../utils/error.js";
import  jwt  from "jsonwebtoken";
import crypto from "crypto"


// REGISTER 
export const register = async (req, res, next) => {
    try {

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt)


        const { username, email } = req.body;

        // Create a new user instance
        const newUser = new User({ username, email, password: hash});

        // Save the new user to the database    
        await newUser.save();

        // Create a Mailgen instance
        const mailGenerator = generateMailGenerator();

        // Generate email content
        const emailContent = emailContents(User.username);

        // Generate an HTML email with the provided contents
        const emailBody = mailGenerator.generate(emailContent);

        // Generate the plaintext version of the e-mail (for clients that do not support HTML)
        const emailText = mailGenerator.generatePlaintext(emailContent);

        // Send registration confirmation email
        const message = await sendRegistrationConfirmationEmail(email, emailBody, emailText);
        res.status(200).send(message);
    } catch (err) {
        next(err);
    }
};
// LOGIN


export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordCorrect) {
      return next(createError(400, "Wrong password or email!"));
    }

const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT);
    
    const { password, ...otherDetails } = user._doc;
    res.cookie("access_token", token, {
      httpOnly: true,
    }).status(200).json(otherDetails);

  } catch (err) {
    next(err);
  }
};



// forgot and reset password

// Forgot Password Functionality
// Forgot Password Functionality
// Forgot Password Functionality
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Generate a unique token without "/"
    const token = generateRandomToken(32);

    // Calculate token expiration (e.g., 10 minutes from now)
    const expiration = Date.now() + 10 * 60 * 1000;

    // Save token and expiration in user document
    user.passwordResetToken = {
      token,
      expiresAt: expiration,
    };
    await user.save();

    // Using sendMagicLink function to send a magic link for password reset
    sendMagicLink(user, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};



// Reset Password Functionality
export const resetPassword = async (req, res) => {
  const { token, id } = req.params;
  const { password, confirmPassword } = req.body;

  try {
      const user = await User.findById(id);

      if (!user) {
          return res.status(400).json({
              success: false,
              error: "User not found",
          });
      }

      const { passwordResetToken } = user;
      const tokenValid = await bcrypt.compare(token, passwordResetToken.token);
      const tokenExpired = passwordResetToken.expiresAt < Date.now();

      if (!tokenValid) {
          return res.status(400).json({
              success: false,
              error: "Invalid reset token",
          });
      }

      if (tokenExpired) {
          return res.status(400).json({
              success: false,
              error: "Reset token expired",
          });
      }

      if (password !== confirmPassword) {
          return res.status(400).json({
              success: false,
              error: "Passwords did not match",
          });
      }

      // Add additional password validation logic here if needed

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      user.passwordChangedAt = Date.now();
      user.passwordResetToken = undefined;

      // Assuming sendPasswordResetSuccess function sends a success message
      sendPasswordResetSuccess(user, res);
  } catch (error) {
      return res.status(400).json({
          success: false,
          error: "An error occurred.",
      });
  }
};

// Validate Reset Token Functionality
export const validateResetToken = async (req, res) => {
  const { token, id } = req.params;

  try {
      const user = await User.findById(id);

      if (!user || !user.passwordResetToken) {
          return res.status(400).json({
              success: false,
              error: "User or reset token not found",
          });
      }

      const { passwordResetToken } = user;
      const tokenValid = await bcrypt.compare(token, passwordResetToken.token);
      const tokenExpired = passwordResetToken.expiresAt < Date.now();

      if (!tokenValid || tokenExpired) {
          return res.status(400).json({
              success: false,
              error: "Invalid or expired reset token",
          });
      }

      return res.status(200).json({ success: true, message: "Reset token is valid" });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          success: false,
          error: "An error occurred.",
      });
  }
};
