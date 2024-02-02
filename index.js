const { MongoClient, ServerApiVersion  } = require("mongodb");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

 
// verify token part
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  console.log("token in the middle wayer", token);
  if (!token) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorizes Access" });
    }
    req.user = decoded;
    next();
  });
};

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
    const userCollection = client.db("FieldDB").collection("users");
    const areaCollection = client.db("FieldDB").collection("area");

    // Token post
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET, { expiresIn: "1hr" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true, token });
    });
    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("logged user", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    app.post("/users", async (req, res) => {
      const query = req.body;
      const result = await userCollection.insertOne(query);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/area", async (req, res) => {
      const query = req.body;
      const result = await areaCollection.insertOne(query);
      res.send(result);
    });

    app.get("/area",  async (req, res) => {
      const result = await areaCollection.find().toArray();
      res.send(result);
    });

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
