const mongoose = require ('mongoose');
const fabricSchema = mongoose.Schema({

    _id: mongoose.Types.ObjectId,
    title: {type: String, required : true,allowNull: false},
    description:{type:String  , required : true ,allowNull: false},
    videoUrl:{type:String  , required : true ,allowNull: false},
    price:{type:String  , required : true ,allowNull: false},
    seamless:{type:Boolean, require: true, allowNull: false}, 
    hashtags:[String]
});


module.exports = mongoose.model('fabric' , fabricSchema);