const express = require('express');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log('decoded', decoded)
        req.decoded = decoded
    })
    next();
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5xf3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const productCollection = client.db("marvelBangladesh").collection("product");
        const myProductCollection = client.db("marvelBangladesh").collection("myProduct");

        // Auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // Products 
        app.get('/product', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray();
            console.log(products)
            res.send(products);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product)
        })


        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // updating stocks
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStock = req.body;
            console.log(updatedStock)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedStock.newQuantityString
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
            console.log(result)
        })

        // My Products API 
        app.get('/myproduct', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = productCollection.find(query)
                const myProducts = await cursor.toArray();
                res.send(myProducts)
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product)
            res.send(result)
        })





    }
    finally {

    }
}


run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Server is Running')
})

app.listen(port, () => {
    console.log("Server in running")
})