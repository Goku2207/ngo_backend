const {Requests: requests, Collectors: collectors } = require("../db");
const mongoose = require("mongoose");
const {generateToken, setCookies} = require("./auth");
const ObjectId = mongoose.Types.ObjectId

const getRequests = async (data) => {
    try{
       // console.log(data);
        const {page, limit} = data;
        const allRequests = await requests.aggregate([
            { $skip: (page-1)*limit },
            { $limit: limit }
        ])
        return { status: 200, allRequests};
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

const approve = async(req,res) => {
    try{
        //console.log(req.body);
        const data = req.body;
        const id = new ObjectId(data._id);
        console.log(id);
        if(data.approval==1){
            const user = await requests.findOne({ _id: id});
            //console.log(user);
            //Adding new Collector 
            const newCollector = new collectors({
                    email: user.email,
                    password: user.password,
                    aadhar: user.aadhar,
                    name: user.name,
                    mobile: user.mobile,
                });            
            console.log('New Collector');
            await newCollector.save();
            console.log('New Collector Saved!');
            const {  accessToken, refreshToken } = generateToken(newCollector['_id']);
            newCollector.refreshToken = refreshToken;
            await newCollector.save();
            setCookies(res, accessToken, refreshToken);

            //Deleting the Request
            await requests.deleteOne({_id: id});

            return { status: 200, message: 'Collector Request Accepted', email: newCollector.email }
        }
        else{
            console.log("Deleting Request");
            await requests.deleteOne({_id: id});
            console.log("Request Deleted");
            return { status: 200, message: 'Request Rejected'};
        }
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

module.exports = {
    getRequests,
    approve,
}