const mongoose = require("mongoose")

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI environment variable is not set. Set it in your .env or deployment settings.");
        process.exit(1);
    }

    // Basic heuristic warning: recommend a database name and common options
    if (uri.match(/^mongodb(\+srv)?:\/\/[^/]+\/?$/)) {
        console.warn(
            "Warning: your MONGODB_URI appears to be missing a database name and/or query options.\n" +
                "Recommended format: mongodb+srv://<user>:<pass>@cluster0.example.net/<dbname>?retryWrites=true&w=majority"
        );
    }

    const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Keep reasonable timeouts for deployments (adjust if needed)
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
    };

    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await mongoose.connect(uri, opts);
            console.log("MongoDB Connected Successfully!!!");
            return;
        } catch (error) {
            console.error(`MongoDB Connection Failed (attempt ${attempt}/${maxAttempts})`, error.message || error);

            // Provide a helpful hint for a common Atlas issue
            const reason = error && (error.reason || error.cause || error);
            if (reason && reason.type === "ReplicaSetNoPrimary") {
                console.error(
                    "ReplicaSetNoPrimary: common causes — Atlas IP access list blocking this host, network/VPC peering, or incorrect connection string. " +
                        "Make sure your deployment IP is allowed in Atlas (or add 0.0.0.0/0 for testing) and that your connection string includes a database name and proper query params."
                );
            }

            if (attempt === maxAttempts) {
                console.error("All MongoDB connection attempts failed. Exiting process.");
                process.exit(1);
            }

            const backoff = Math.min(1000 * 2 ** attempt, 30000);
            console.log(`Retrying in ${backoff}ms...`);
            await sleep(backoff);
        }
    }
};

module.exports = connectDB;