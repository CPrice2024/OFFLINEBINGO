import mongoose from "mongoose";

const supportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: false },
  balance: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  currentToken: { type: String, default: null },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Founder", 
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Support", supportSchema);
