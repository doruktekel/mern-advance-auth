import bcryptjs from "bcryptjs";

export const comparePasswords = async (enteringPass, userPass) => {
  try {
    const compare = await bcryptjs.compare(enteringPass, userPass);
    return compare;
  } catch (error) {
    console.log("Compare password error : ", error.message);
  }
};
