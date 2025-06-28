const mongoose = require("mongoose");

mongoose.set('strictQuery', false);

const mongoURI = "mongodb+srv://saikiran:Mongodb@123@cluster0.zvle0xu.mongodb.net/blogapp?retryWrites=true&w=majority&appName=Cluster0";

// Replace <your_password> with your actual MongoDB password
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected successfully!");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});
