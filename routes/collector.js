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

router.post('/assignedItems',  async (req, res) => {
    const response = await functions.getAssignedItems(req.body);
    res.status(response.status).send(response);
});

router.post("/itemCollect",uploader.single('file'), async (req,res) => {
    //console.log(req.body.file);
    const response =await functions.collectItem(req);
    res.status(response.status).send(response);
});

router.post("/itemUpdate",uploader.single('file'), async (req,res) => {
    //console.log(req.body.file);
    const response =await functions.updateItem(req);
    res.status(response.status).send(response);
});

router.post('/itemDeliver',  async (req, res) => {
    const response = await functions.deliverItem(req.body);
    res.status(response.status).send(response);
});

module.exports = router;