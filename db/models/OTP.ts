import { Schema, model, models } from "mongoose";

const otpSchema = new Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expires: { type: Date, required: true },
}, { timestamps: true });

const OTP = models.OTP || model("OTP", otpSchema);
export default OTP;
