const {Items: items, Collectors: collectors, Acceptors: acceptors } = require("../db");
const mongoose = require("mongoose");
const { upload } = require("./helper");
const ObjectId = mongoose.Types.ObjectId;

const getCollectors = async (data) => {
    try{
        console.log(data);
        // const {page, limit} = data;
        // const products = await collectors.aggregate([
        //     { $skip: (page-1)*limit },
        //     { $limit: limit }
        // ])
        const allCollectors = await collectors.find();
        return { status: 200, allCollectors};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

const getCollector = async (data) => {  //collectorID
    try{
        console.log(data);
        const id = new ObjectId(data.collectorID);
        const collector = await collectors.findOne({ _id: id});
        if(!collector){
            return {status: 404};
        }
        return {status: 200, collector};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

const editProfile = async (data) => {   //collectorID, mobile, email
    try{
        const id = new ObjectId(data.collectorID);
        const collector = await collectors.findOne({_id: id});
        if(!collector)
            return { status: 404, message: 'Something went wrong!'};
        if(data.mobile!="")
            collector.mobile = data.mobile;
        if(data.email!="")
            collector.email = data.email;
        await collector.save();
        return { status: 200, message: 'Profile Updated'};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

const getAssignedItems = async (data) =>{ //collectorID
    try{
        console.log(data);
        const id = new ObjectId(data.collectorID);
        const assignedItems = await items.find({collId: id});
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
        const response = await upload(req);
        if(response.fileLocation == "")
            return { status: 500, message: 'Internal Server Error' };
        const item = await items.findOne({_id: id});
        if(!item)
            return { status: 404, message: 'Something went wrong!'};
        item.url.push(response.fileLocation);
        item.status = 'Picked Up';
        await item.save();
        return { status: 200, message: 'Item Status Updated'};
     }
     catch(err){
         console.log(err);
         return { status: 500, message: 'Internal Server Error' };
     }
}

//TO ADD CHARGES AND UPLOAD PIC AFTER MENDING ITEM BY AGENT
const updateItem = async (req) =>{  //itemID, file, charges, desc
    try{
        console.log(req.body);
        const id = new ObjectId(req.body.itemID);
        const response = await upload(req);
        if(response.fileLocation == "")
            return { status: 500, message: 'Internal Server Error' };
        const item = await items.findOne({_id: id});
        if(!item)
            return { status: 404, message: 'Something went wrong!'};
        //console.log(response);
        item.url.push(response.fileLocation);
        item.status = 'Mended';
        item.charges = req.body.charges;
        item.mendingDetails = req.body.desc;
        await item.save();
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
        const item = await items.findOne({_id: id});
        if(!item)
            return { status: 404, message: 'Something went wrong!'};
        if(item.status == 'Delivered')
            return { status: 400, message: 'Item already Donated'};
        var acceptor = await acceptors.findOne({aadhar: data.aadhar});
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
        await acceptor.save();
        item.status = 'Delivered';
        await item.save();
        return { status: 200, message: 'Item Delivered'};
     }
     catch(err){
         console.log(err);
         return { status: 500, message: 'Internal Server Error' };
     }
}

//TO DELETE A COLLECTOR
const deleteCollector = async(data) => {    // collectorID
    try{
        console.log("Deleting Agent..");
        console.log(data);
        const id = new ObjectId(data.collectorID);
        const collector = await collectors.findOne({ _id: id});
        if(!collector){
            return { status: 404, message: 'Agent already Deleted'};
        }
        (await items.find({ collId: id })).forEach(async (item)=>{
            item.collId = null;
            item.collectorName = "";
            item.collectorContact = "";
            if(item.status == 'Assigned'){
                item.status = 'Unassigned';
            }
            await item.save();
        });
        await collectors.deleteOne({ _id: id});
        console.log("Agent Deleted");
        return { status: 200, message: 'Agent Removed Successfully!'};
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
    getCollector,
    getCollectors,
    editProfile,
    deleteCollector,
}