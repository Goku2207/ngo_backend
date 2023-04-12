const { Donators: donators } = require("../db");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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
        return { status: 200, donatedItems};
     }
     catch(err){
         console.log(err);
         return { status: 500, message: 'Internal Server Error' };
     }
}

module.exports = {
    getTopThree,
    donatedItems,
}