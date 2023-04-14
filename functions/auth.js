const bcrypt = require('bcrypt');
const { Donators: donators, Collectors: collectors, Acceptors: acceptors, Requests: requests } = require("../db");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (id) => {
    const accessToken = jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('access-token', accessToken, {
        maxAge: 1000*3600,
        httpOnly: true
    });
    res.cookie('refresh-token', refreshToken, {
        maxAge: 1000*60*60*24*7,
        httpOnly: true
    })
}

const register = async (req, res) => {
    try{
        // Donor - category 0, Collector - category 1, Acceptor - category 2
        console.log(req.body);
        const category = req.body.category;
        if(category==0){
            const user = await donators.findOne({ email: req.body.email });
            if (user) {
                return { status: 400, message: 'Email already registered' };
            }
            const aadhar = await donators.findOne({ aadhar: req.body.aadhar });
            if(aadhar) {
                return { status: 400, message: 'Aadhar already registered with different Email-id' };
            }
            const password = await bcrypt.hash(req.body.password, 10);

            const newDonator = new donators({
                email: req.body.email,
                password: password,
                aadhar: req.body.aadhar,
                name: req.body.name,
                mobile: req.body.mobile,
                items: [],
            });
            console.log('New Donator');
            await newDonator.save();
            
            console.log('New Donator Saved!');
            const {  accessToken, refreshToken } = generateToken(newDonator['_id']);
            newDonator.refreshToken = refreshToken;
            await newDonator.save();
            setCookies(res, accessToken, refreshToken);
            return { status: 200, message: 'Donator Registered', email: newDonator.email };
        }
        else if(category==1){
            const user = await collectors.findOne({ email: req.body.email });
            if (user) {
                return { status: 400, message: 'Email already registered' };
            }
            const aadhar = await collectors.findOne({ aadhar: req.body.aadhar });
            if(aadhar) {
                return { status: 400, message: 'Aadhar already registered with different Email-id' };
            }
            const password = await bcrypt.hash(req.body.password, 10);

            // Collector to be approved by the admin
            const userInRequest = await requests.findOne({email: req.body.email});
            if (userInRequest) {
                return { status: 400, message: 'Registeration request already sent!' };
            }
            const aadharInRequest = await requests.findOne({ aadhar: req.body.aadhar });
            if(aadharInRequest) {
                return { status: 400, message: 'Registeration request already sent!' };
            }
            const newRequest = new requests({
                name : req.body.name,
                aadhar : req.body.aadhar,
                mobile: req.body.mobile,
                email: req.body.email,
                password : password,
                region : req.body.region
            });
            console.log('New Request for Collector');
            await newRequest.save();
            console.log('New Request saved');
            return { status: 200, message: 'Request for being Collector Submitted Successfully!' };

            // If Collector can be madde directly without approval of admin
            // const newCollector = new collectors({
            //     email: req.body.email,
            //     password: password,
            //     aadhar: req.body.aadhar,
            //     name: req.body.name,
            //     mobile: req.body.mobile,
            // });
            // console.log('New Collector');
            // await newCollector.save();
            
            // console.log('New Collector Saved!');
            // const {  accessToken, refreshToken } = generateToken(newCollector['_id']);
            // newCollector.refreshToken = refreshToken;
            // await newCollector.save();
            // setCookies(res, accessToken, refreshToken);
            // return { status: 200, message: 'Collector Registered', email: newCollector.email }
        }

        // Registration for Acceptor
        // else{
        //     const user = await acceptors.findOne({ email: req.body.email });
        //     if (user) {
        //         return { status: 400, message: 'Email already registered' }
        //     }
        //     const aadhar = await acceptors.findOne({ aadhar: req.body.aadhar });
        //     if(aadhar) {
        //         return { status: 400, message: 'Aadhar already registered with different Email-id' }
        //     }
        //     const password = await bcrypt.hash(req.body.password, 10);

        //     const newAcceptor = new acceptors({
        //         email: req.body.email,
        //         password: password,
        //         aadhar: req.body.aadhar,
        //         name: req.body.name,
        //         mobile: req.body.mobile,
        //     });
        //     console.log('New Acceptor');
        //     await newAcceptor.save();
            
        //     console.log('New Acceptor Saved!');
        //     const {  accessToken, refreshToken } = generateToken(newAcceptor['_id']);
        //     newAcceptor.refreshToken = refreshToken;
        //     await newAcceptor.save();
        //     setCookies(res, accessToken, refreshToken);
        //     return { status: 200, message: 'Acceptor Registered', email: newAcceptor.email }
        // }
    }
    catch(err) {
        console.log(err);
        return { status: 500, message: 'Internal Server Error' };
    }
}

const login = async (req, res) => {
    console.log(req.body);
    try{
        // Donor - category 0, Collector - category 1, Acceptor - category 2
        const category = req.body.category;
        var user="";
        if(category==0){
            user = await donators.findOne({ "email": req.body.email });
        }
        else if(category==1){
            user = await collectors.findOne({ "email": req.body.email });
        }
        // else{
        //     user = await acceptors.findOne({ "email": req.body.email });
        // }
        
        if (!user) {
            return { status: 404, message: 'Email not found' };
        }
        const response = await bcrypt.compare(req.body.password, user.password);
        if (!response) {
            return { status: 400, message: 'Invalid Password' };
        }
        const {  accessToken, refreshToken } = generateToken(user['_id']);
        user.refreshToken = refreshToken;
        await user.save();
        setCookies(res, accessToken, refreshToken);
        return { status: 200, message: 'User Logged in', user };
    }
    catch(err){
        return { status: 500, message: 'Internal server error' };
    }
}

const refresh = async (req, res) => {
    try{
        let refreshToken = req.cookies['refresh-token'];
        if (!refreshToken) {
            return { status: 401 };
        }

        // Donor - category 0, Collector - category 1, Acceptor - category 2
        const category = req.body.category;
        var user="";
        if(category==0){
            user = await donators.findOne({ "email": req.body.email });
        }
        else if(category==1){
            user = await collector.findOne({ "email": req.body.email });
        }
        // else{
        //     user = await acceptors.findOne({ "email": req.body.email });
        // }

        if (!user) {
            return { status: 401 };
        }
        try{
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        }
        catch(err){
            return { status: 403 };
        }
        const {  accessToken, refreshToken: newRefreshToken } = generateToken(user['_id']);
        user.refreshToken = newRefreshToken;
        await user.save();
        setCookies(res, accessToken, newRefreshToken);
        return { status: 200 };
    }
    catch (err) {
        return { status: 500 };
    }
}

const verify = (req) => {
    try{
        const accessToken = req.cookies['access-token'];
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        return true;
    }
    catch(err){
        return false;
    }
}

module.exports = {
    register,
    login,
    refresh,
    verify,
    generateToken,
    setCookies,
}