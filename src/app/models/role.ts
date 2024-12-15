import { Schema, model, models, Model } from "mongoose";

// TypeScript interface for the User model
interface raiserole {
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// Define the schema
const UserSchema = new Schema<raiserole>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {type:String},
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "raiseRoleUpgrade" } // Specify the collection name (optional)
);

// Prevent redefining the model if it's already compiled
const raiserole: Model<raiserole> = models.raiserole || model<raiserole>("User", UserSchema);

export default raiserole;
