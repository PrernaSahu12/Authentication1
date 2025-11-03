const redis = require('./redis.service')


async function storeOTP(email, otp) {
    await redis.set(`otp:${email}`, otp, "EX", 120)
    console.log("OTP Stored in Redis");
}

async function getOTP(email) {
    return await redis.get(`otp:${email}`);
    
}

async function deleteOTP(email) {
    await redis.del(`otp:${email}`); 
}
module.exports = {storeOTP,getOTP,deleteOTP};