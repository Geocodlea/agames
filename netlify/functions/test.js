import dbConnect from "/utils/dbConnect";
import User from "/models/User";

export default async (req) => {
  console.log(req);

  await dbConnect();
  const users = await User.find();

  console.log(users);
};
