import { Schema, model, models, Model } from "mongoose";

// TypeScript interface for the User model
interface IUser {
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// Define the schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {type:String},
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" } // Specify the collection name (optional)
);

// Prevent redefining the model if it's already compiled
const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
