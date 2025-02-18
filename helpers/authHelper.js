import bcrypt from "bcrypt";
export const hashPassword = async (password_hash) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password_hash, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};
export const comparePassword = async (password_hash, hashedPassword) => {
  return bcrypt.compare(password_hash, hashedPassword);
};
