const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const exist = await User.findOne({ email });
    if (exist) return res.status(409).json({ message: "User already exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, role });

    return res.status(201).json({ msg: "User registerd Successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Inalid Credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.json({ msg: "Logged in Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

exports.logout = (req, res)=>{
    res.clearCookie("token");
    res.json({message:"Logged Out"});
};

exports.getAdminData = (req,res)=>{
    res.json({secret:"Only admin can see this data"});
};