const mongoose = require("mongoose");

const connectDb = async () => { 
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(
            "Database connected: success",
        )
    } catch (error) {
        console.log("MongoDB connection error: ",error);
        process.exit(1)
    }
}
module.exports = connectDb;