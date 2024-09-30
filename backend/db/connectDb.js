import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connection host : ", res.connection.host);
  } catch (error) {
    console.log("Database error : ", error.message);
    process.exit(1);
  }
};

export default connectDb;
