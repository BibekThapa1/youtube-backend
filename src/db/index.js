import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

async function connectDB(){
    try{
        console.log(process.env.MONGODB_URL);
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
       console.log(`MONGODB connected !! DB HOST ${connectionInstance}`);
    }
    catch(error){
        console.log("MONGO DB connection failed:  ",error);
        process.exit(1);
    }
}

export default connectDB;