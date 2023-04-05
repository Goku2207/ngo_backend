const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv");
const routes = require("./routes");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: '*',
    credentials: true,
}));

app.use("/auth", routes.auth);
app.use("/items",routes.items);

//  /admin/register
//  /admin/requests
//  /admin/approval

app.get('/', (req, res) => {
    res.send('working')
})

app.listen(process.env.PORT, () => {
    console.log(`server is running on localhost:${process.env.PORT}`);
})