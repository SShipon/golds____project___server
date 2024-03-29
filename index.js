const express = require('express');
const SSLCommerzPayment = require('sslcommerz-lts');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkjuk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false; //true for live, false for sandbox

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const goldCollection = client.db('goldStore').collection('gold-collection');
    const diamondCollection = client
      .db('goldStore')
      .collection('diamond-collection');
    const platinumCollection = client
      .db('goldStore')
      .collection('platinum-collection');
    const pearlCollection = client
      .db('goldStore')
      .collection('pearl-collection');
    const bookingCollection = client.db('goldStore').collection('booking');

    //jwt
    app.post('/login', async (req, res) => {
      const user = req.body;
      var token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      });
      res.send({ token });
    });

    // cart item DELETE
    app.delete('/cartItem/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query);
      res.send(result);

    })

    //get booking data from database for show booking in ddashboard
    app.get('/booking', async (req, res) => {
      const newEmail = req.query.email;
      const query = { email: newEmail };
      //email holo mongodb te user email er nam
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    //post booking data to database
    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      console.log(result);
      res.send(result);
    });

    app.get('/golds/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await goldCollection.findOne(query);
      res.send(result);
    });

    //gold
    app.get('/golds', async (req, res) => {
      const cursor = goldCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //diamond api
    app.get('/diamonds', async (req, res) => {
      const diamond = await diamondCollection.find().toArray();
      res.send(diamond);
    });

    app.get('/diamonds/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await diamondCollection.findOne(query);
      res.send(result);
      
    })

    //platinums
    app.get('/platinums', async (req, res) => {
      const platinum = await platinumCollection.find().toArray();
      res.send(platinum);
    });
    
    ///pearls
    app.get('/pearls', async (req, res) => {
      const pearl = await pearlCollection.find().toArray();
      res.send(pearl);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send(
    '<h1 style="color:red ; text-align:center ; margin:20% auto">Hello from gold-project</h1>'
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
