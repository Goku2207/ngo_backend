const {Items: items, Donators: donators, Collectors: collectors } = require("../db");
const { upload, findLeastAssignedCollector } = require('./helper'); 
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getItems = async (data) => {  //page, limit
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

const getItem = async (data) => {   //_id
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

const addItem = async (req) => {    // name, region, category, address, donID
    try{
        console.log("upload...");
        const response = await upload(req);
        console.log("done");
        //console.log(req.body);
        const donID = new ObjectId(req.body.donID);
        const donator = await donators.findOne({_id: donID});
        const item = new items({
            category : req.body.category,
            name : req.body.name,
            url : [response.fileLocation],
            status : 'Unassigned',   
            region : req.body.region,
            charges : 0,
            collId : null,
            donId : donID,
            address : req.body.address,
            donorName: donator.name,
            donorContact: donator.mobile,
            collectorName: "",
            collectorContact: "",
            mendingDetails: "",
        })  
        //how should the collector change the iotem status, as that item should be updated with the new condition/status of item now       
        //so unique identification of item should be using mobile number and? as to what if same donor uploaded more than one items        
        //should there be a limit on donating only one item with a certain name or certain category?
        await item.save();
        
        //console.log(donator);
        donator.items.push(item._id);
        await donator.save();
        const id = await findLeastAssignedCollector(item.region);
        //console.log(id);
        if(id){
            const collector = await collectors.findOne({_id: id});
            //console.log(collector);
            item.collId = collector._id;
            item.status = 'Assigned';
            item.collectorName = collector.name;
            item.collectorContact = collector.mobile;
            await item.save();
            collector.items.push(item._id);
            await collector.save();
        }
        return { status: 200, message: "Item Added!", id: item._id};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: "Something went wrong!" };
    }
}

const addImage = async (req) => {   // itemID, file
    try{
        console.log("upload...");
        const response = await upload(req);
        console.log("done");
        console.log(req.body);
        const id = new ObjectId(req.body.itemID);
        const item = await items.findOne({ _id: id });
        if(!item){
            return { status: 404, message: 'Something went wrong!'};
        }
        item.url.push(response.fileLocation);
        await item.save();
        return { status: 200, message: 'Image Uploaded successfully'};
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
    addImage,
}