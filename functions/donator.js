const { Donators: donators, Items: items } = require("../db");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getDonators = async (data) => {
    try{
        console.log(data);
        // const {page, limit} = data;
        // const products = await collectors.aggregate([
        //     { $skip: (page-1)*limit },
        //     { $limit: limit }
        // ])
        const allDonators = await donators.find();
        return { status: 200, allDonators};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

const getDonator = async (data) => {  //donatorID
    try{
        console.log(data);
        const id = new ObjectId(data.donatorID);
        const donator = await donators.findOne({ _id: id});
        if(!donator){
            return {status: 404};
        }
        return {status: 200, donator};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

//TO GET THE TOP THREE DONATORS
const getTopThree = async () => {
    try{
        const topThree = await donators.aggregate([
            { $unwind:"$items" },
            { $group : { _id:"$_id",  name: { "$first": "$name" }, address: {"$first": "$address"}, cnt:{ $sum:1 } } },
            { $sort :{ cnt: -1} },
            { $limit : 3 }
        ]);
        console.log(topThree);
        return { status: 200, topThree };
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

//TO GET THE ITEMS DONATED BY THE DONATOR
const donatedItems = async (data) =>{   //donatorID
    try{
        console.log(data);
        const id = new ObjectId(data.donatorID);
        const donatedItems = await items.find({donId: id});
        console.log(donatedItems.length);
        return { status: 200, donatedItems};
     }
     catch(err){
         console.log(err);
         return { status: 500, message: 'Internal Server Error' };
     }
}

module.exports = {
    getDonators,
    getDonator,
    getTopThree,
    donatedItems,
}