const express = require("express");
const functions = require('../functions/items');
const multer = require('multer');

const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
    },
});

const router = express.Router();

// GET ALL DONATED ITEMS
router.post("/", async (req, res) => {
    const response = await functions.getItems(req.body);
    res.status(response.status).send(response);
});

//GET A SINGLE DONATED ITEM
router.post("/get", async (req,res) => {
    const response =await functions.getItem(req.body);
    res.status(response.status).send(response);
});

//ADD A ITEM/ DONATION REQUEST
router.post("/add",uploader.single('file'), async (req,res) => {
    //console.log(req.body.file);
    const response =await functions.addItem(req);
    res.status(response.status).send(response);
});

module.exports = router;