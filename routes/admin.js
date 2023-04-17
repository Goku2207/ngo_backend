const express = require("express");
const functions = require('../functions/admin');

const router = express.Router();

// TO GET ALL THE COLLECTOR REQUESTS
router.post('/requests',  async (req, res) => {
    const response = await functions.getRequests(req.body);
    res.status(response.status).send(response);
})

//TO APPROVE A COLLECTOR REQUEST
router.post('/approval',  async (req, res) => {
    const response = await functions.approve(req, res);
    res.status(response.status).send(response);
})

// TO PAY OFF A DONATED ITEM
router.post('/payOff', async(req,res) => {
    const response = await functions.payOff(req, res);
    res.status(response.status).send(response);
})

// ADMIN LOGIN
router.post('/adlogin',async(req,res) => {
    const response = await functions.adlogin(req,res);
    res.status(response.status).send(response);
})

//ADMIN REFRESH
router.post('/adRefresh',async(req,res) => {
    const response = await functions.adRefresh(req,res);
    res.status(response.status).send(response);
})

module.exports = router;