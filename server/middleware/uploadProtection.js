// Only allow internal requests or whitelisted IP/header
module.exports = function (req, res, next) {
  // Example: check a secret header (from your own backend only)
  const secret = req.headers['x-backend-secret'];
  if (secret !== process.env.UPLOAD_ACCESS_SECRET) {
    return res.status(403).json({ error: 'Forbidden: Direct access denied' });
  }
  next();
};
