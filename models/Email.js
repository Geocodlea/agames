import mongoose from "mongoose";

global.models = global.models || {};

global.models.Email =
  global.models.Email ||
  mongoose.model("Email", {
    name: { type: String },
    text: { type: String },
  });

export default global.models.Email;
