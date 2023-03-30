const {Items: items, Donators: donators } = require("../db");
const { upload } = require('./helper'); 
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getItems = async (data) => {
    try{
        console.log(data);
        const {page, limit} = data;
        const products = await items.aggregate([
            { $skip: (page-1)*limit },
            { $limit: limit }
        ])
        return { status: 200, products};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

const getItem = async (data) => {
    try{
        console.log(data);
        const id = new ObjectId(data);
        const product = await items.findOne({ _id: id});
        if(!product){
            return {status: 404};
        }
        return {status: 200, product};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

const addItem = async (req) => {
    try{
        const response = await upload(req);
        const item = new items({
            category : req.body.category,
            name : req.body.name,
            url : response.fileLocation,
            status : req.body.status,
            region : req.body.region,
        })
        
        await item.save();
        return { status: 200, message: "Item Added!"};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: "Something went wrong!" };
    }
}

module.exports = {
    getItems,
    getItem,
    addItem,
}