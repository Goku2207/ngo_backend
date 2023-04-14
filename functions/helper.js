const { Storage } = require('@google-cloud/storage');
const { Collectors: collectors, Items: items } = require('../db');

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
    const collector = await collectors.findOne({region: regionToAssign});
    if(!collector)
        return null;
    (await items.find({region: regionToAssign})).forEach((item)=>{
        collector.items.push(item._id);
        item.collID = collector._id;
        item.status = 'Assigned';
        item.save();
    });
    collector.save();
}

module.exports = {
    upload,
    del,
    autoAssign,
}