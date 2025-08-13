// redisClient.js
const redis = require('redis');
const client = redis.createClient({ url: 'redis://localhost:6379' });

(async () => {
  await client.connect();
})();

module.exports = client;


// MONGO_URI=mongodb+srv://fft_03:dbUser1819@gdsc.xnlnm.mongodb.net/AlgoSpeak?retryWrites=true&w=majority&appName=GDSC
