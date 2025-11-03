const User = require("../models/user.model");
const { generateToken } = require("../utils/jwt");
const redisClient = require("../services/redis.service");
const crypto = require("crypto");

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const exist = await User.findOne({ email });
    if (exist) return res.status(409).json({ message: "User already exists" });

    const user = await User.create({ email, password, role });
    const otp = crypto.randomInt(100000, 999999).toString();

    await redisClient.setEx(`otp:${email}`, 120, otp);
    console.log(`OTP for ${email}:`, otp);

    return res.status(201).json({
      msg: "User registered. OTP sent. Verify account before login",
      email,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

exports.verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp) return res.status(400).json({ message: "Otp expired" });

    if (storedOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    await User.findOneAndUpdate({ email }, { isVerified: true });
    await redisClient.del(`otp:${email}`);

    res.json({ msg: "Account verified successfully! Now you can login" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Account not verified" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid Credentials" });

    const token = generateToken({ id: user._id, role: user.role }, "2d");

    res.cookie("token", token, {
      httpOnly: true,
    });

    res.json({ msg: "Logged in Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (token) {
      await redisClient.setEx(`blacklist:${token}`, 60 * 60 * 48, "true");
    }

    res.clearCookie("token");
    res.json({ message: "Logged Out Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getAdminData = (req, res) => {
  res.json({ secret: "Only admin can see this data" });
};
