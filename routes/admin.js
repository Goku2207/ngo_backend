const express = require("express");
const functions = require('../functions/admin');

const router = express.Router();

router.post('/requests',  async (req, res) => {
    const response = await functions.getRequests(req.body);
    res.status(response.status).send(response);
})

router.post('/approval',  async (req, res) => {
    const response = await functions.approve(req, res);
    res.status(response.status).send(response);
})

router.post('/payOff', async(req,res) => {
    const response = await functions.payOff(req, res);
    res.status(response.status).send(response);
})

router.post('/adlogin',async(req,res) => {
    const response = await functions.adlogin(req,res);
    res.status(response.status).send(response);
})

router.post('/adRefresh',async(req,res) => {
    const response = await functions.adRefresh(req,res);
    res.status(response.status).send(response);
})

module.exports = router;