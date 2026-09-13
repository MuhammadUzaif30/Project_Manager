const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    organization : {
        type : mongoose.Schema.Types.ObjectId,
        // FIXED: Capital 'O' to match your Organization model name
        ref : 'Organization', 
        required : true,
    },
    role : {
        type : String,
        enum : ['Owner' , 'Admin' , 'Member'],
        required : true,
    },
}, 
{ timestamps : true }
);

membershipSchema.index({ user : 1, organization : 1} , { unique : true });

// FIXED: Capital 'M' for the exported model name
module.exports = mongoose.model('Membership' , membershipSchema);