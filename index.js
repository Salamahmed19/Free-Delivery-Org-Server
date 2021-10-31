const express = require('express');
const bodyParser = require("body-parser");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.asedd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
      await client.connect();
      const allItems = client.db('fdfp-org').collection('items');
      const collectItems = client.db('fdfp-org').collection('collectItems');
      const requestItems = client.db('fdfp-org').collection('requestItems');

      const allMembers = client.db('fdfp-org').collection('members');

      //post our gift req
      app.post("/sendgift", async (req, res) => {
        const result = await allItems.insertOne(req.body);
      });
      app.post("/reqgift", async (req, res) => {
        const data = req.body
        data._id = ObjectId(req.body._id)
        const result = await collectItems.insertOne(data);
      });
      app.post("/pdrequest", async (req, res) => {
        const result = await requestItems.insertOne(req.body);
      });
      app.post("/member", async (req, res) => {
        const result = await allMembers.insertOne(req.body);
      });

      //api gift res
      app.get("/freeitems", async (req, res) => {
        const result = await allItems.find({}).toArray();
        res.send(result);
      });
      app.get("/reviewitems", async (req, res) => {
        const result = await requestItems.find({}).toArray();
        res.send(result);
      });
      app.get("/getitems", async (req, res) => {
        const result = await collectItems.find({}).toArray();
        res.send(result);
      });
      app.get("/allmembers", async (req, res) => {
        const result = await allMembers.find({}).toArray();
        res.send(result);
      });

      //delete items method
      app.delete("/deleteitem/:id", async (req, res) => {
          const query = { _id: ObjectId(req.params.id) };
            // const query = { _id: req.params.id}
          const result = await collectItems.deleteOne(query);
          res.send(result);
      });
      app.delete("/deletepd/:id", async (req, res) => {
          const query = { _id: ObjectId(req.params.id) };
            // const query = { _id: req.params.id}
          const result = await allItems.deleteOne(query);
          res.send(result);
      });


      app.get("/singlepd/:id", async (req, res) => {
          const query = { _id: ObjectId(req.params.id) };
            // const query = { _id: req.params.id}
          const result = await allItems.findOne(query);
          res.send(result);
      });


        //UPDATE API
        app.put('/updatepd/:id', async (req, res) => {
            const updatedPd = req.body;
            const filter = { _id: ObjectId(req.params.id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedPd.name,
                    email: updatedPd.email,
                    address: updatedPd.address,
                    category: updatedPd.category,
                    itemName: updatedPd.itemName,
                    imgUrl: updatedPd.imgUrl,
                    desc: updatedPd.desc
                },
            };
            const result = await allItems.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.put('/updatestatus', async (req, res) => {
            const data = (req.body)
            const updatedStatus = "Done & Collected";
            const filter = { _id: ObjectId(req.body._id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: data.name,
                    email: data.email,
                    address: data.address,
                    category: data.category,
                    itemName: data.itemName,
                    imgUrl: data.imgUrl,
                    desc: data.desc,
                    status: updatedStatus
                },
            };
            const result = await collectItems.updateOne(filter, updateDoc, options)
            res.send(result)
        })

    }
  finally {
      // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log("Example app listening at", port)
  })