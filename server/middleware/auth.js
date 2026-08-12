const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_SECRET = process.env.ACCESS_SECRET;

// NOTE: real JWT verification is disabled for the basic version — this
// middleware currently lets every request through unauthenticated. That's
// fine for testing solo, but before you share the extension with anyone
// else, restore the commented-out verification below (and make sure
// ACCESS_SECRET is set), since right now anything that can reach this
// Cloud Run URL can use it.
module.exports = async function (req, res, next) {
  try {
    // const token =
    //   req.headers['authorization']?.split(' ')[1] ||
    //   req.cookies?.accessToken;
    // if (!token) return res.status(401).json({ error: 'No token provided' });
    // jwt.verify(token, ACCESS_SECRET, async (err, decoded) => {
    //   if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    //   req.userId = decoded.userId;
    //   req.user = await User.findById(decoded.userId).select('-password');
    //   next();
    // });
    // return;

    console.log("Incoming req");
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error (auth middleware)' });
  }
};
