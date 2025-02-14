
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb://testuser:testuser@fitness-shard-00-00.rlyaf.mongodb.net:27017,fitness-shard-00-01.rlyaf.mongodb.net:27017,fitness-shard-00-02.rlyaf.mongodb.net:27017/?replicaSet=atlas-u8d04e-shard-0&ssl=true&authSource=admin";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

export default run;
