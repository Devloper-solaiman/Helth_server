const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'https://assaginment-7.netlify.app',
    credentials: true
}));
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

});

const run = async () => {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db('assignment-7');
        const collection = db.collection('users');
        const donorCollection = db.collection('donor');
        const SubscriptionCollection = db.collection('subscription');
        const testimonialCollection = db.collection("testimonials");
        const donationCollection = db.collection("donations");
        const volunteerCollection = db.collection("volunteers");
        const commentCollection = db.collection("comments");


        // User Registration
        app.post('/api/v1/register', async (req, res) => {
            const { name, email, password } = req.body;

            // Check if email already exists
            const existingUser = await collection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into the database
            await collection.insertOne({ name, email, password: hashedPassword });

            res.status(201).json({
                success: true,
                message: 'User registered successfully'
            });
        });

        // User Login
        app.post('/api/v1/login', async (req, res) => {

            const { email, password } = req.body;

            // Find user by email
            const user = await collection.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Compare hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });

            res.json({
                success: true,
                message: 'Login successful',
                token
            });
        });

        // ====================
        // WRITE YOUR CODE HERE
        // ====================

        // donar-data


        app.post('/api/v1/donor', async (req, res) => {
            const { name, email, amounte, image } = req.body
            const includeDonoar = await donorCollection.findOne({ email })
            if (!includeDonoar) {
                const result = await donorCollection.insertOne({
                    name, email, amounte, image
                })
                return res.json({
                    success: true,
                    message: 'donoated successfull'
                })
            }
        })
        app.get('/api/v1/donor', async (req, res) => {
            const DonoarAllData = await donorCollection.find({}).toArray()
            return res.json({
                success: true,
                message: 'All donoar get successfull',
                DonoarData: DonoarAllData
            })
        })
        app.get('/api/v1/donor/:email', async (req, res) => {

            const email = req.params.email;

            try {
                const donorSingleData = await donorCollection.findOne({ email });
                if (!donorSingleData) {
                    return res.status(404).json({
                        success: false,
                        message: 'Donor not found',
                    });
                }

                return res.json({
                    success: true,
                    message: '2  Single donor data retrieved successfully',
                    donorSingleData,
                });
            } catch (error) {
                console.log("error", error);
            }
        });

        app.post("/api/v1/donation", async (req, res) => {
            const { image, title, category, amount, description } = req.body;
            const result = await donationCollection.insertOne({
                image,
                title,
                category,
                amount,
                description,
            });
            res.json({
                success: true,
                message: "Successfully donation create!",
                result,
            });
        });
        app.get("/api/v1/donation", async (req, res) => {
            const data = await donationCollection.find({}).toArray();
            res.json({
                success: true,
                message: "successfully retrieve donation!",
                data,
            });
        });
        app.get("/api/v1/donation/:id", async (req, res) => {
            const { id } = req.params;
            const data = await donationCollection.findOne(new ObjectId(id));
            res.json({
                success: true,
                message: "successfully retrieve clothe!",
                data,
            });
        });
        app.delete("/api/v1/donation/:id", async (req, res) => {
            const { id } = req.params;
            const data = await donationCollection.deleteOne({
                _id: new ObjectId(id),
            });
            res.json({
                success: true,
                message: "successfully delete donation!",
                data,
            });
        });

        app.put("/api/v1/donation/:id", async (req, res) => {
            const { id } = req.params;
            const { image, title, category, amount, description } = req.body;

            try {

                const result = await donationCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { image, title, category, amount, description } }
                );
                console.log(result)
                res.json({
                    success: true,
                    message: "Donation updated successfully",
                    result,

                });
            } catch (error) {
                console.error("Error updating donation:", error);
            }
        });



        app.post("/api/v1/subscription", async (req, res) => {
            const { image, title, amount, description } = req.body;
            const result = await SubscriptionCollection.insertOne({
                title,
                image,
                amount,
                description,
            });
            res.json({
                success: true,
                message: "Subscription Created",
                result,
            });
        });
        app.get("/api/v1/subscription", async (req, res) => {
            const data = await SubscriptionCollection.find({}).toArray();
            res.json({
                success: true,
                message: "All Subscription Finde",
                data,
            });
        });
        app.get("/api/v1/subscription/:id", async (req, res) => {
            const { id } = req.params;
            const singleData = await SubscriptionCollection.findOne(new ObjectId(id));
            res.json({
                success: true,
                message: "single subscription Finde",
                singleData,
            });
        });
        app.delete("/api/v1/subscription/:id", async (req, res) => {
            const { id } = req.params;
            const singleData = await SubscriptionCollection.deleteOne({ _id: new ObjectId(id) });
            res.json({
                success: true,
                message: " subscription Deleted",
                singleData,
            });
        });


        app.post("/api/v1/testimonial", async (req, res) => {
            const { email, image, name, amount, testimonial } = req.body;
            const existingUser = await testimonialCollection.findOne({ email });

            if (!existingUser) {
                const result = await testimonialCollection.insertOne({
                    email,
                    name,
                    image,
                    amount,
                    testimonial,
                });

                return res.json({
                    success: true,
                    message: "You posted testimonial successfully!",
                    result,
                });
            } else {
                const data = await testimonialCollection.updateOne(
                    { email: email },
                    { $set: { testimonial: testimonial } }
                );

                res.json({
                    success: true,
                    message: "Your testimonial Updated successfully!",
                    updatedDonation: data,
                });
            }
        });
        app.get("/api/v1/testimonial", async (req, res) => {
            const data = await testimonialCollection.find({}).toArray();
            res.json({
                success: true,
                message: "successfully retrieve Testimonials!",
                data,
            });
        });

        app.post("/api/v1/volunteer", async (req, res) => {
            const { image, name, email, passion, phoneNumber, location } = req.body;
            const existingUser = await volunteerCollection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "You Have already created account for Volunteer",
                });
            } else {
                const result = await volunteerCollection.insertOne({
                    image,
                    name,
                    email,
                    passion,
                    phoneNumber,
                    location,
                });
                res.json({
                    success: true,
                    message: "Volunteer Account Created Successfully!",
                    result,
                });
            }
        });
        app.get("/api/v1/volunteer", async (req, res) => {
            const data = await volunteerCollection.find({}).toArray();
            res.json({
                success: true,
                message: "successfully retrieve volunteers!",
                data,
            });
        });

        app.post("/api/v1/comment", async (req, res) => {
            const { image, name, email, comment } = req.body;
            const currentDate = new Date();
            const options = { day: "numeric", month: "long", year: "numeric" };
            const formattedDate = currentDate.toLocaleDateString("en-US", options);

            const result = await commentCollection.insertOne({
                image,
                name,
                email,
                comment,
                time: formattedDate,
            });
            res.json({
                success: true,
                message: "Comment Posted Successfully!",
                result,
            });
        });
        app.get("/api/v1/comment", async (req, res) => {
            const data = await commentCollection.find({}).toArray();
            res.json({
                success: true,
                message: "successfully retrieve comments!",
                data,
            });
        });


        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } finally {
    }
}

run().catch(console.dir);

// Test route
app.get('/', (req, res) => {
    const serverStatus = {
        message: 'Server is running smoothly',
        timestamp: new Date()
    };
    res.json(serverStatus);
});