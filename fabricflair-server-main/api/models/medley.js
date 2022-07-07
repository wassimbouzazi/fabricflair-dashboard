const mongoose = require ('mongoose');
const medleySchema = mongoose.Schema({

    _id: mongoose.Types.ObjectId,
    fabrics: [{
        type: String
    }],
    inches:{type:Number, required : true},
    option:{type:Number, required : true},
    date: {type: Date, required: true},
    title: {type: String, required: true, unique: true},
    shrink: {type: Boolean, required: true},

});

module.exports = mongoose.model('Medley' , medleySchema);