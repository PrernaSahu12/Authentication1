const express = require("express")
const cookieParser = require("cookie-parser")
const connectDB = require("../src/config/db")

const authRoutes = require("./routes/auth.routes");


const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRoutes);

app.get("/",(req,res)=>{
    res.send("Auth system API is running...");
})

module.exports = app;
