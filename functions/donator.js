const { Donators: donators, Items: items, Collectors: collectors } = require("../db");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//TO GET ALL THE DONATORS
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

//TO GET A SINGLE DONATOR
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

//TO GET THE SIZE OF DONATORS, COLLECTORS AND ITEMS DB
const getSize = async () => {
    try{
        const donatorSize = await donators.aggregate([
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
         ]);
         const collectorSize = await collectors.aggregate([
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
         ]);
         const itemSize = await items.aggregate([
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
         ]);
         const sizes = { donatorSize: donatorSize[0].count,
                         collectorSize: collectorSize[0].count,
                         itemSize: itemSize[0].count
                    };
         console.log(sizes);
         return { status: 200, sizes};
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
    getSize,
}