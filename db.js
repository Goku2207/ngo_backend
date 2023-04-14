const dotenv = require("dotenv")
const mongoose =require("mongoose");

//application properties
dotenv.config();

mongoose.connect( process.env.DB_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    //useFindAndModify: false
});

//Schema
const adminSchema = {
    name: String,
    password: String,
    //key: String,
} //ask if multiple admins possible and if not, what should be admin id and pswd

const donatorSchema = {
    name : String,
    aadhar : String,
    mobile: String,
    email: String,  //added
    password : String,
    refreshToken: String,   //added
    items : [ mongoose.Types.ObjectId ]
};// should donor's contact also be shared?

const collectorSchema = {
    name : String,
    aadhar : String,
    mobile: String,
    email: String,  //added
    password : String,
    region : String,
    refreshToken: String,   //added
    items : [ mongoose.Types.ObjectId ]
};//contact should be shared with donor?

const acceptorSchema = {
    name : String,
    aadhar : String, 
    mobile: String, //added
    address: String,    //added
    items : [ mongoose.Types.ObjectId ]
};

const itemSchema = {
    category : String,
    name : String,
    url : [String],
    status : String,
    region : String,
    collId : mongoose.Types.ObjectId,
    donId : mongoose.Types.ObjectId,
    charges: String,
};

const requestSchema = {     //added
    name : String,
    aadhar : String,
    mobile: String,
    email: String,
    password : String,
};

const Donators = mongoose.model("Donator", donatorSchema);
const Collectors = mongoose.model("Collector", collectorSchema);
const Acceptors = mongoose.model("Acceptor", acceptorSchema);
const Items = mongoose.model("Item", itemSchema);
const Requests = mongoose.model("Request", requestSchema);  //added
const Admins = mongoose.model("Admin",adminSchema);

module.exports = {
    Donators,
    Collectors,
    Acceptors,
    Items,
    Requests,
    Admins
}