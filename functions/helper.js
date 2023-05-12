const { Storage } = require('@google-cloud/storage');
const { Collectors: collectors, Items: items } = require('../db');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const storage = new Storage({
    projectId: "ngotest-ddb96",
    keyFilename: "./ngotest-ddb96-firebase-adminsdk-h1dgb-4595e0fec9.json",
});
const bucket = storage.bucket("gs://ngotest-ddb96.appspot.com");

const upload = (req) => {
    return new Promise((resolve, reject) => {
        const blob = bucket.file(String(Date.now())+'.jpeg');
        const blobStream = blob.createWriteStream({
            metadata: {
               contentType: req.file.mimetype,
            },
        });
        blobStream.on('error', (err) => reject(err));
   
        blobStream.on('finish', () => {
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`;
            resolve({ 
                fileName: req.file.originalname,
                fileLocation: publicUrl
            })
        });
        blobStream.end(req.file.buffer);
    })  
}

const del = async (url) => {
    const fileName = url
                        .replace('https://firebasestorage.googleapis.com/v0/b/ngotest-ddb96.appspot.com/o/','')
                        .replace('?alt=media','');
                        
    const file = bucket.file(fileName);
    return await file.delete();
}

const autoAssign = async (regionToAssign) => {
    
    (await items.find({region: regionToAssign, status: 'Unassigned'})).forEach(async (item)=>{
        const id = await findLeastAssignedCollector(regionToAssign);
        const collectorToAssign = await collectors.findOne({_id: id});
        collectorToAssign.items.push(item._id);
        await collectorToAssign.save();
        item.collId = collectorToAssign._id;
        item.status = 'Assigned';
        item.collectorName = collectorToAssign.name;
        item.collectorContact = collectorToAssign.mobile;
        await item.save();
    });
    return { status: 200, message: 'Success'};
}

const findLeastAssignedCollector = async (regionToAssign) => {
    var collectorArr = await collectors.find({region: regionToAssign});
    //console.log(collectorArr);
    if(collectorArr.length==0)
        return null;
    var minAssigned = 1e9+7;
    for(var i=0;i<collectorArr.length;i++){
        minAssigned = Math.min(minAssigned,collectorArr[i].items.length);
    }
    //console.log(minAssigned);
    var minCollectorArr = [];
    for(var i=0;i<collectorArr.length;i++){
        if(collectorArr[i].items.length == minAssigned){
            minCollectorArr.push(collectorArr[i]);
        }
    }
   // console.log(minCollectorArr);
    var randomIndex = Math.floor(Math.random() * minCollectorArr.length);
    //console.log(randomIndex);
    //console.log(minCollectorArr[randomIndex]);
    return new ObjectId(minCollectorArr[randomIndex]._id);
}

const todaysDate = () => {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    today = dd + '/' + mm + '/' + yyyy;
    return today;
}

module.exports = {
    upload,
    del,
    autoAssign,
    findLeastAssignedCollector,
    todaysDate,
}