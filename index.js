const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5xf3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const productCollection = client.db("marvelBangladesh").collection("product");
        const myProductCollection = client.db("marvelBangladesh").collection("myProduct");

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
        app.get('/myproduct', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = productCollection.find(query)
            const myProducts = await cursor.toArray();
            res.send(myProducts)
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