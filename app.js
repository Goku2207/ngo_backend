const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv");
// const authFunctions = require('./functions/auth');
// const itemsFunctions = require("./functions/items");
const routes = require("./routes");

dotenv.config();

const app = express();
app.use(express.json());

app.use("/auth", routes.auth);
app.use("/items",routes.items);

app.get('/', (req, res) => {
    res.send('working')
})

app.listen(process.env.PORT, () => {
    console.log(`server is running on localhost:${process.env.PORT}`);
})