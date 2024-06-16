import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoosePaginate from "mongoose-paginate-v2"

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, // cloudinary url
      required: true,
    },
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User"
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, //  cloudinary url
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublsihed: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
videoSchema.plugin(mongoosePaginate)


export const Video = mongoose.model("Video", videoSchema);
