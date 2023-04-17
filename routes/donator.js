const express = require("express");
const functions = require('../functions/donator');

const router = express.Router();

//TO FETCH ALL THE Donators
router.post("/", async (req, res) => {
    const response = await functions.getDonators(req.body);
    res.status(response.status).send(response);
});

//TO FETCH A SINGLE DONATOR USING DONATOR ID
router.post("/get", async (req,res) => {
    const response =await functions.getDonator(req.body);
    res.status(response.status).send(response);
});

//TO FETCH TOP THREE DONATORS
router.get('/topThree',  async (req, res) => {
    const response = await functions.getTopThree();
    res.status(response.status).send(response);
})

//DONATED ITEMS BY A DONATOR
router.post('/items',  async (req, res) => {
    const response = await functions.donatedItems(req.body);
    res.status(response.status).send(response);
})

module.exports = router;