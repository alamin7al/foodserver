const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');


require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const { query } = require('express');

const fileUpload = require('express-fileupload');
const req = require('express/lib/request');
const res = require('express/lib/response');
const app = express();
const port = process.env.PORT || 5000; 

// middleware 
app.use(cors());
app.use(express.json());
app.use(fileUpload())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ow5x2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect()
        const database = client.db('find')
        const datacollection = database.collection('formdata')
        const tablecollection = database.collection('table')
        const ordercollection = database.collection('orderplace')

        app.post('/formdatas', async (req, res) => {
            const about = req.body.about;
            const country = req.body.country;
            const web = req.body.web;
            const email = req.body.email;
            const number = req.body.number;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const doctor = {
                about,
                country, web, number, email,
                image: imageBuffer
            }
            const result = await datacollection.insertOne(doctor);
            console.log(result);
            res.json(result);
        })
        app.get('/formdatas', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = datacollection.find(query)
            const user = await cursor.toArray()
            res.json(user)
        })



        app.get('/orderplace', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = ordercollection.find(query)
            const user = await cursor.toArray()
            res.json(user)
        })

        app.get('/allorderplace', async (req, res) => {
            const cursor = ordercollection.find({})
            const user = await cursor.toArray()
            res.send(user)
        })





       


        app.get('/editprofile/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const user = await datacollection.findOne(query)
            res.send(user)
        })

        app.put('/singleupdate/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const updateUser = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }

            const updateDoc = {
                $set: {
                    about: updateUser.about,
                    number: updateUser.number,
                    web: updateUser.web,
                    country: updateUser.country,
                    about: updateUser.about,

                }
            }
            const result = await datacollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })



        app.post('/table', async (req, res) => {
            const service = req.body;
            // console.log('hit the post api', service);

            const result = await tablecollection.insertOne(service);
            console.log(result);
            res.send(result)
        });
        app.post('/orderplace', async (req, res) => {
            const service = req.body;
            // console.log('hit the post api', service);

            const result = await ordercollection.insertOne(service);
            console.log(result);
            res.send(result)
        });

        app.get('/table', async (req, res) => {
            const cursor = tablecollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let payload;
            const count = await cursor.count();

            if (page) {
                payload = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                payload = await cursor.toArray();
            }

            res.send({
                count,
                payload
            });
        })
        app.delete('/allorderplace/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await ordercollection.deleteOne(query)
            console.log(result);
            res.send(result)
        })
        app.delete('/singleemail/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await ordercollection.deleteOne(query)
            res.send(result)
        })

        app.delete('/table/:id', async (req, res) => {
            const id = req.params.id
            const quarry = { _id: ObjectId(id) }
            const deleteData = await tablecollection.deleteOne(quarry)
            res.send(deleteData)

        }) 

        app.put('/table/:id', async (req, res) => {
            const id = req.params.id
            const updateUser = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    date: updateUser.date,
                    phone: updateUser.phone,
                    gender: updateUser.gender,
                    name: updateUser.name,
                    title: updateUser.title,
                }
            }
            const result = await tablecollection.updateOne(filter, updateDoc, options)
            console.log(result);
            res.send(result)
        })



        app.get('/table/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const user = await tablecollection.findOne(query)
            res.send(user)
        })











        console.log('hello');
    }
    finally {
        // await client.close() 
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Running my CRUD Server');
});

app.listen(port, () => {
    console.log('Running Server on port', port);
})