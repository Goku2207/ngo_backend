const {Requests: requests, Collectors: collectors, Admins: admin, Items: items } = require("../db");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {generateToken, setCookies} = require("./auth");
const {autoAssign} = require("./helper");
const ObjectId = mongoose.Types.ObjectId;

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

const approve = async(req,res) => { // _id, approval
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
                    region: user.region,
                    items: []
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
            await autoAssign(user.region);
            return { status: 200, message: 'Collector Request Accepted', email: newCollector.email };
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

const payOff = async(req) => {
    try{
        //console.log(req.body);
        const data=req.body;
        const id = new ObjectId(data._id);
        console.log(id);
        if(data.paid == 1)
        {
            const item = await items.findOne({ _id: id});
            //const cId = new ObjectId(item.collID);
            item.status='Paid';
            item.save();
        }
        return { status: 200, message: 'Paid successfully' };
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

const adlogin = async (req,res) => {
    console.log(req.body);
    //const password = await bcrypt.hash("IITISMNGO@123", 10);
    //console.log(password);
    try{
        var user="";
        user = await admin.findOne({ "name": req.body.name });
        console.log(user);
        if( user )
        {
          const response = await bcrypt.compare(req.body.password,user.password);
          if(!response)
          {
            return { status: 400, message: 'Invalid password' };
          }  
          //tokens
          const {  accessToken, refreshToken } = generateToken(user['_id']);
          user.refreshToken = refreshToken;
          await user.save();
          setCookies(res, accessToken, refreshToken);

          return { status: 200, message: 'Admin Logged in' };

        }
        else
        {
            return { status: 404, message: 'Invalid email id for admin'};
        }
    }
    catch(err){
        console.log(err);
        return { status: 500, message: 'Internal server error' };
    }
}

const adRefresh = async (req, res) => {
    try{
        let refreshToken = req.cookies['refresh-token'];
        if (!refreshToken) {
            return { status: 401 }
        }

        var user="";
        user = await admin.findOne({ "name": req.body.name });
       
        if (!user) {
            return { status: 401 }
        }
        try{
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        }
        catch(err){
            return { status: 403 }
        }
        const {  accessToken, refreshToken: newRefreshToken } = generateToken(user['_id']);
        user.refreshToken = newRefreshToken;
        await user.save();
        setCookies(res, accessToken, newRefreshToken);
        return { status: 200 };
    }
    catch (err) {
        return { status: 500 }
    }
}

module.exports = {
    getRequests,
    approve,
    payOff,
    adlogin,
    adRefresh,
}