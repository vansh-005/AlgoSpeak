const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_SECRET = process.env.ACCESS_SECRET;

module.exports = async function (req, res, next) {
  try {
    // console.log(req.headers);
    const token =
    req.headers['authorization']?.split(' ')[1] ||
    req.cookies?.accessToken;
    // console.log(token);
    if (!token) return res.status(401).json({ error: 'No token provided' });
    jwt.verify(token, ACCESS_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      req.userId = decoded.userId;
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error (auth middleware)' });
  }
};

