const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());
// mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kusbv.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
       const serviceCollection = client.db('database').collection('service');
       const userAddCollection = client.db('database').collection('add');
        //find 3 element from database
        app.get('/', async(req,res)=>{
            const query ={};
            const cursor = serviceCollection.find(query).limit(3);
            const result = await cursor.toArray();
            res.send(result) 
        })
        // find user add service
        app.get('/addService/:uid', async(req,res)=>{
            const uid = req.params.uid;
            console.log(uid)
            const query ={uid: uid};
            const cursor = userAddCollection.find(query);
            const result = await cursor.toArray();
            res.send(result) 
        })
      //find all element from database
        app.get('/services', async(req,res)=>{
            const query ={};
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            console.log(result)
            res.send(result) 
        })
        // find specific id info
        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })
        // post user uid and add service
        app.post('/addService' , async(req,res)=>{
         const user = req.body;
         const filter = { serviceId: user.serviceId };
         const options = { upsert: true };
         const updateDoc = {
            $set: {
                uid : user.uid,
                serviceId : user.serviceId,
                name: user.name,
                img: user.img,
                price: user.price,
                description: user.description,
            },
          };
          const result = await userAddCollection.updateOne(filter, updateDoc, options);
          res.send(result)
        })
    }
    catch{
        (err => console.log(err))
    }
}
run().catch(err => console.log(err))


app.listen(port, ()=>{
    console.log('server running')
})