const mongoose = require("mongoose");

const dburl = "mongodb+srv://janithsgunasekara003_db_user:1234@cluster0.9a4z8hj.mongodb.net/?appName=Cluster0"

mongoose.set("strictQuery", true, "useNewUrlParser", true);

const connection = async () => {
    try {
        await mongoose.connect(dburl);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error(error.message);
        process.exit(); // Exit the process with an error code
    }

};

module.exports = connection;