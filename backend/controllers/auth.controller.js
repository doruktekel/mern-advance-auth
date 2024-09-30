import crypto from "crypto";

import {
  sendChangedPasswordEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { UserModel } from "../models/user.model.js";
import { comparePasswords } from "../utils/comparePasswords.js";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
import { hashPassword } from "../utils/hashPassword.js";

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const userAlreadyExist = await UserModel.findOne({ email });

    if (userAlreadyExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }

    const hashedPassword = await hashPassword(password);

    const verificationToken = Math.floor(100000 + Math.random() * 900000);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000,
    });

    const { password: _, ...rest } = newUser._doc;

    generateTokenAndSetCookies(newUser._id, res);
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      rest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const verifiedUser = await UserModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!verifiedUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    verifiedUser.isVerified = true;
    verifiedUser.verificationToken = undefined;
    verifiedUser.verificationTokenExpiresAt = undefined;

    await verifiedUser.save();

    const { email, name } = verifiedUser;
    await sendWelcomeEmail(email, name);

    const { password: _, ...rest } = verifiedUser._doc;

    res.status(200).json({
      success: true,
      message: "User successfully verified",
      rest,
    });
  } catch (error) {
    console.log("Verification code error : ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const alreadyUser = await UserModel.findOne({ email });

    if (!alreadyUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    alreadyUser.resetPasswordToken = crypto.randomBytes(20).toString("hex");
    alreadyUser.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    await alreadyUser.save();

    await sendResetPasswordEmail(
      email,
      `${process.env.CLIENT_URL}/reset-password/${alreadyUser.resetPasswordToken}`
    );

    res
      .status(200)
      .json({ success: true, message: "Password reset link send your email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: {
        $gt: Date.now(),
      },
    });
    console.log(user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();
    await sendChangedPasswordEmail(user.email);

    await res
      .status(200)
      .json({ success: true, message: "Password was changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const alreadyUser = await UserModel.findOne({ email });

    if (!alreadyUser) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const compare = await comparePasswords(password, alreadyUser.password);
    if (!compare) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { password: _, ...rest } = alreadyUser._doc;

    generateTokenAndSetCookies(alreadyUser._id, res);

    res
      .status(200)
      .json({ success: true, message: "User login was successful", rest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token").status(200).json({
    success: true,
    message: "User has been logout successfully",
  });
};

const checkAuth = async (req, res) => {
  try {
    const validUser = await UserModel.findById(req.userId).select("-password");

    if (!validUser) {
      return res
        .status(404)
        .json({ success: false, message: "This user not found" });
    }

    // const { password: _, ...rest } = validUser._doc;

    res.status(200).json({ success: true, validUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
};
