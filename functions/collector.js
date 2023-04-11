const {Items: items, Collectors: collectors, Acceptors: acceptors } = require("../db");
const mongoose = require("mongoose");
const { upload } = require("./helper");
const ObjectId = mongoose.Types.ObjectId

const getAssignedItems = async (data) =>{ //collectorID
    try{
        console.log(data);
        const id = new ObjectId(data.collectorID);
        const assignedItems = await items.find({_id: id});
        return { status: 200, assignedItems};
     }
     catch(err){
         console.log(err);
         return { status: 500, message: 'Internal Server Error' };
     }
}

const collectItem = async (req) => {   //itemID, file
    try{
        console.log(req.body);
        const id = new ObjectId(req.body.itemID);
        const response = upload(req);
        if(response.fileLocation == "")
            return { status: 500, message: 'Internal Server Error' };
        const item = await items.findOne({_id: id});
        if(!item)
            return { status: 404, message: 'Something went wrong!'};
        item.url.push(response.fileLocation);
        item.status = 'Picked up';
        item.save();
        return { status: 200, message: 'Item Status Updated'};
     }
     catch(err){
         console.log(err);
         return { status: 500, message: 'Internal Server Error' };
     }
}

const updateItem = async (req) =>{  //itemID, file, charges
    try{
        console.log(req.body);
        const id = new ObjectId(req.body.itemID);
        const response = upload(req);
        if(response.fileLocation == "")
            return { status: 500, message: 'Internal Server Error' };
        const item = await items.findOne({_id: id});
        if(!item)
            return { status: 404, message: 'Something went wrong!'};
        item.url.push(response.fileLocation);
        item.status = 'Mended';
        item.charges = req.body.charges;
        item.save();
        return { status: 200, message: 'Item Status Updated'};
     }
     catch(err){
         console.log(err);
         return { status: 500, message: 'Internal Server Error' };
     }
}

const deliverItem = async (data) => {   //itemID, name, aadhar, mobile, address
    try{
        console.log(data);
        const id = new ObjectId(data.itemID);
        const item = items.findOne({_id: id});
        if(!item)
            return { status: 404, message: 'Something went wrong!'};
        const acceptor = await acceptors.findOne({aadhar: data.aadhar});
        if(!acceptor){
            acceptor = new acceptors({
                name : data.name,
                aadhar : data.aadhar, 
                mobile: data.mobile, 
                address: data.address,    
                items : [],
            });
        }
        acceptor.items.push(id);
        acceptor.save();
        item.status = 'Delivered';
        item.save();
        return { status: 200, message: 'Item Delivered'};
     }
     catch(err){
         console.log(err);
         return { status: 500, message: 'Internal Server Error' };
     }
}


module.exports = {
    getAssignedItems,
    collectItem,
    updateItem,
    deliverItem,
}