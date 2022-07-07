const mongoose = require ('mongoose');
const designSchema = mongoose.Schema({

    _id: mongoose.Types.ObjectId,
    pattern_name: {type: String, required : true, allowNull: false},
    description:{type:String  , required : true ,allowNull: false},
    design_masterfile:{type:String, required : true},
    additionDate: {type: Date, required: false},
    stitchount_width: {type: Number, required: true},
    stitchcount_height: {type: Number, required: true},
    designer_name: {type: String, required: true},
    default_count: {type: Number, required: true}


});


module.exports = mongoose.model('design' , designSchema);