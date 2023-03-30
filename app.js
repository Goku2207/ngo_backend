const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv");
const functions = require('./functions/auth');
//const routes = require("./routes");

dotenv.config();

const app = express();
app.use(express.json());

//app.use("/auth", routes.auth);
app.post("/auth/register", async (req,res)=>{
    const response = await functions.register(req, res);
    res.status(response.status).send(response);
})

app.post("/auth/login", async (req,res)=>{
    const response = await functions.login(req, res);
    res.status(response.status).send(response);
})

app.get('/', (req, res) => {
    res.send('working')
})

app.listen(process.env.PORT, () => {
    console.log(`server is running on localhost:${process.env.PORT}`);
})