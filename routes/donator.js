const express = require("express");
const functions = require('../functions/donator');

const router = express.Router();

router.get('/topThree',  async (req, res) => {
    const response = await functions.getTopThree();
    res.status(response.status).send(response);
})

router.post('/items',  async (req, res) => {
    const response = await functions.donatedItems(req.body);
    res.status(response.status).send(response);
})

module.exports = router;