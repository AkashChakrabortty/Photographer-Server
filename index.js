const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// mongo
const uri = "mongodb+srv://dbuser1:esFcOiBVKyVU1lMR@cluster0.kusbv.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
       const serviceCollection = client.db('database').collection('service');
       
        //find 3 element from database
        app.get('/', async(req,res)=>{
            const query ={};
            const cursor = serviceCollection.find(query).limit(3);
            const result = await cursor.toArray();
            console.log(result)
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