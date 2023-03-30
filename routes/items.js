const express = require("express");
const functions = require('../functions/items');

const router = express.Router();

router.post("/", async (req, res) => {
    const response = await functions.getItems(req.body);
    res.status(response.status).send(response);
});

router.post("/get", async (req,res) => {
    const response =await functions.getItem(req.body);
    res.status(response.status).send(response);
});

module.exports = router;