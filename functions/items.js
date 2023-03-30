const {Items: items, Donators: donators } = require("../db"); 
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
            return {status: 401};
        }
        return {status: 200, product};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

module.exports = {
    getItems,
    getItem,
}