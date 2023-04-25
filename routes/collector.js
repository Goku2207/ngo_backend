const express = require("express");
const functions = require('../functions/collector');
const multer = require('multer');

const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
    },
});

const router = express.Router();

//TO FETCH ALL THE COLLECTORS
router.post("/", async (req, res) => {
    const response = await functions.getCollectors(req.body);
    res.status(response.status).send(response);
});

//TO FETCH A SINGLE COLLECTOR USING COLLECTOR ID
router.post("/get", async (req,res) => {
    const response =await functions.getCollector(req.body);
    res.status(response.status).send(response);
});

//TO UPDATE THE PROFILE(MOBILE AND EMAIL) OF THE COLLECTOR
router.post("/updateProfile", async (req,res) => {
    const response =await functions.editProfile(req.body);
    res.status(response.status).send(response);
});

//TO FETCH ALL THE ASSIGNED ITEMS TO A COLLECTOR
router.post('/assignedItems',  async (req, res) => {
    const response = await functions.getAssignedItems(req.body);
    res.status(response.status).send(response);
});

//TO COLLECT ITEM FROM DONATOR BY THE COLLECTOR
router.post("/itemCollect",uploader.single('file'), async (req,res) => {
    //console.log(req.body.file);
    const response =await functions.collectItem(req);
    res.status(response.status).send(response);
});

//TO ADD IMAGE AND CHARGES OF MENDED ITEM
router.post("/itemUpdate",uploader.single('file'), async (req,res) => {
    console.log(req.body);
    const response =await functions.updateItem(req);
    res.status(response.status).send(response);
});

//TO DELIVER THE ITEM
router.post('/itemDeliver',  async (req, res) => {
    const response = await functions.deliverItem(req.body);
    res.status(response.status).send(response);
});

//TO DELETE A COLLECTOR USING COLLECTOR ID
router.post("/delete", async (req,res) => {
    const response =await functions.deleteCollector(req.body);
    res.status(response.status).send(response);
});

module.exports = router;