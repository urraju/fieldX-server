const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(
    cors({
      origin: ["http://localhost:5173"],
      credentials: true,
    })
  );
  app.use(express.json());


  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zrkwx23.mongodb.net/?retryWrites=true&w=majority`;

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  async function run() {
    try {
      // collection create
      const  userCollection = client.db("FieldDB").collection("users");
       
        
      app.post("/users", async (req, res) => {
        const query = req.body;
        const result = await userCollection.insertOne(query);
        res.send(result);
      });
      app.get('/users', async (req,res) => {
        const result = await userCollection.find().toArray()
        res.send(result)
      })
      
  
      await client.db("admin").command({ ping: 1 });
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    } finally {
    }
  }
  run().catch(console.dir);

  app.get("/", async (req, res) => {
    res.send("Browser Is Running Now");
  });
  app.listen(port, () => console.log("Server is Running on Port ||", port));
  