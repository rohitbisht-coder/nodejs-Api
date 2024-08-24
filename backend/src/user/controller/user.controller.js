// Please don't change the pre-written code
// Import the necessary modules here

import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";
import crypto from "crypto";


export const createNewUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await createNewUserRepo({ ...req.body, password });
    await sendWelcomeEmail(newUser);
    await sendToken(newUser, res, 200);
  } catch (err) {
    //  handle error for duplicate email
    if (err.code === 11000) {
      res.status(400).send({ message: 'Email already in use' });
    } else {
      return next(new ErrorHandler(400, err));
    }
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, "please enter email/password"));
    }
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passswor!"));
    }
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const logoutUser = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "logout successful" });
};

export const forgetPassword = async (req, res, next) => {
  // Implement feature for forget password
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorHandler(401, "Please enter your email"));
    }
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(new ErrorHandler(401, "User Does Not Exist"));
    }
    const resetToken = await user.getResetPasswordToken();
    console.log(resetToken)
    await user.save();
    await sendPasswordResetEmail(user, resetToken);
    res.status(200).send({ msg: "reset password url send to your email" });
  } catch (err) {
    return next(new ErrorHandler(500, err));
  }
}

export const resetUserPassword = async (req, res, next) => {
  // Implement feature for reset password
  try {
    const token = req.params.token;
    const { password, confirmPassword } = req.body;
    const findUser = await findUserForPasswordResetRepo(token);
    if (!findUser) {
      return next(new ErrorHandler(401, "No password reset request found"));
    }
    if (!password || !confirmPassword || password !== confirmPassword) {
      return next(new ErrorHandler(401, "Incorrect current password!"));

    }
    findUser.password = confirmPassword;
    await findUser.save();
    res.status(200).send({ Msg: "Password updated successfully" });
  } catch (err) {
    return next(new ErrorHandler(500, err));
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.user._id });
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!currentPassword) {
      return next(new ErrorHandler(401, "pls enter current password"));
    }

    const user = await findUserRepo({ _id: req.user._id }, true);
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Incorrect current password!"));
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(401, "mismatch new password and confirm password!")
      );
    }

    user.password = newPassword;
    await user.save();
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const updatedUserDetails = await updateUserProfileRepo(req.user._id, {
      name,
      email,
    });
    res.status(201).json({ success: true, updatedUserDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// admin controllers
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });
    if (!userDetails) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);
    if (!deletedUser) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }

    res
      .status(200)
      .json({ success: true, msg: "user deleted successfully", deletedUser });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfileAndRole = async (req, res, next) => {
  // Write your code here for updating the roles of other users by admin
  try {
    const id = req.params;
    const {name,email,role}= req.body;
    // Validate the role
    const validRoles = ['user', 'admin']; // Adjust according to your roles
    if (!validRoles.includes(role)) {
      return next(new ErrorHandler(400, `Invalid role: ${role}`));
    }
    const resp = await updateUserRoleAndProfileRepo(id.id , req.body);
    if(resp.success){
       res.status(200).send({msg:resp.msg})
    }
   } catch (err) {
    return next(new ErrorHandler(400, err));
    }
};
