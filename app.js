const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv");
const routes = require("./routes");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use("/auth", routes.auth);
app.use("/items",routes.items);
app.use("/admin",routes.admin);
app.use("/collector",routes.collector);
app.use("/donator",routes.donator);

app.get('/', (req, res) => {
    res.send('working')
})

app.listen(process.env.PORT, () => {
    console.log(`server is running on localhost:${process.env.PORT}`);
})