const express = require("express");
const functions = require('../functions/auth');

const router = express.Router();

//To ADD COLLECTOR REQUEST
router.post("/register", async (req, res) => {
    const response = await functions.register(req, res);
    res.status(response.status).send(response);
});

//COLLECTOR, DONATOR LOGIN
router.post("/login", async (req, res) => {
    const response = await functions.login(req, res);
    res.status(response.status).send(response);
})

//COLLECTOR, DONATOR LOGIN
router.post('/refresh',  async (req, res) => {
    const response = await functions.verify(req, res);
    res.status(response.status).send(response);
})

module.exports = router;