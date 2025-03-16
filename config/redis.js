import { createClient } from "redis";
import { exec } from "child_process";
import path from "path";

/**
 * Directory where Redis should store `dump.rdb`
 */
const redisDataDir = path.resolve("redis_data"); // Change this path as needed

/**
 * Starts the Redis server using the `redis-server` command.
 * Logs any errors or warnings that occur during the process.
 * Logs a message when the Redis server starts successfully.
 */
const startRedisServer = () => {
    exec(`redis-server --dir ${redisDataDir}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Redis Server Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Redis Warning: ${stderr}`);
            return;
        }
        console.log(`Redis Server Started: ${stdout}`);
    });
};
startRedisServer(); // Start Redis when the backend starts

/**
 * Creates and connects a Redis client.
 * Logs a message when the connection is successful.
 * Logs any errors that occur during the connection process.
 * Sets up an error event listener to log any Redis errors.
 */
const redisClient = createClient();

redisClient.connect()
    .then(() => console.log("Redis connected successfully!"))
    .catch((err) => console.error("Redis Connection Error:", err));

redisClient.on("error", (err) => console.error("Redis Error:", err));

// Export Redis client so it can be used elsewhere
export default redisClient;