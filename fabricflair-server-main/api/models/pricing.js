const mongoose = require ('mongoose');
const pricingSchema = mongoose.Schema({

    _id: mongoose.Types.ObjectId,
    groupName: {type: String, required : true, allowNull: false, unique: true},
    sizeNames:{type:[String]  , required : true ,allowNull: false},
    sizePrices:{type:[String]  , required : true ,allowNull: false}
});


module.exports = mongoose.model('pricing' , pricingSchema);