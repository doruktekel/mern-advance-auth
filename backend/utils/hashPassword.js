import bcryptjs from "bcryptjs";

export const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcryptjs.hash(password, 12);
    return hashedPassword;
  } catch (error) {
    console.log("Password hash error : ", error.message);
  }
};
