// require('dotenv').config({path:'./env'})

import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
    app.on("error",(error)=>{
      console.log("Express connection error ",error);
    })
  })
  .catch((error) => {
    console.log("MONGO db connection failed!!! ", error);
  });
