import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // The one who subscribe channel 
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,  // The one whose channel is subscribed.
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
