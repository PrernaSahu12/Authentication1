const Redis = require("ioredis");

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { tls: process.env.REDIS_TLS === "true" ? {} : undefined })
  : new Redis(); 

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.log(" Redis Error:", err);
});

module.exports = redis;
