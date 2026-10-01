import mongoose from "mongoose";

const RuleSchema = new mongoose.Schema({
  type: String,
  signalType: String,
  action: String,
  threshold: Number,
});

export const Rule = mongoose.model("Rule", RuleSchema);
