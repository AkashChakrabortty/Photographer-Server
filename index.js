const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { json } = require('express');
const app = express();
const port = process.env.PORT || 5000;


// middle wares
app.use(cors());
app.use(express.json());
// mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kusbv.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// verifyjwt
function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
       const serviceCollection = client.db('database').collection('service');
       const userAddCollection = client.db('database').collection('add');
       const userReviewCollection = client.db('database').collection('review');

       //  jwt
        app.post('/jwt', (req, res) =>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
        res.send({token})
    })  
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

        // post review 
        app.post('/review' , async(req,res)=>{
            const user = req.body;
            const result = await userReviewCollection.insertOne(user);
            res.send(result)
           })
           //find all reviews from database
        app.get('/review', async(req,res)=>{
            const query ={};
            const sortPattern = { milliseconds : -1 };
            const cursor = userReviewCollection.find(query).sort(sortPattern);
            const result = await cursor.toArray();
            res.send(result) 
        })

         // find specific user review info
         app.get('/review/:uid', verifyJWT , async(req,res)=>{
            const decoded = req.decoded;
            const uid = req.params.uid;
            
            if(decoded.uid !== uid){
                res.status(403).send({message: 'unauthorized access'})
            }
         
            const query ={uid: uid};
            const cursor = userReviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result) 
        })
        // delete review
        app.delete('/review/delete' , async(req,res)=>{
            const useridServiceid = req.query.id;
            console.log(useridServiceid)
            const query = { _id: ObjectId(useridServiceid) };
            const result = await userReviewCollection.deleteOne(query);
            res.send(result)
           }) 
          //    find specific edit review
           app.get('/reviews/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id) };
            const service = await userReviewCollection.findOne(query);
            res.send(service)
        })
        // update review
        app.put('/reviews/edit/:id', async(req,res)=>{
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateReview = req.body;
            const options = { upsert: true };
            const updateDoc = {
               $set: {
                  text: updateReview.text
               },
             };
             const result = await userReviewCollection.updateOne(filter, updateDoc, options);
             res.send(result)
        } )
    }
    catch{
        (err => console.log(err))
    }
}
run().catch(err => console.log(err))


app.listen(port, ()=>{
    console.log('server running')
})