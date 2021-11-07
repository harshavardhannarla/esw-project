const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RecordSchema = new Schema({
    location:{
        type:String,
        required: true
    },
    time: {
        type:Date,
        default:Date.now
    },
    temp: Schema.Types.Decimal128,
    humidity: Schema.Types.Decimal128,
    pm25: Schema.Types.Decimal128,
    pm10: Schema.Types.Decimal128,
    co2: Schema.Types.Decimal128,
    tvoc: Schema.Types.Decimal128,
    eco2: Schema.Types.Decimal128,
    h2: Schema.Types.Decimal128,
});

module.exports = Record = mongoose.model('record',RecordSchema);





/* time:"2021-09-30T20:35:41Z"
location:"Hyd"
temp:"27.50000"
humidity:"83.90000"
pm25:"926.09998"
pm10:"1045.19995"
co2:"5000.00000"
tvoc:"83.00000"
eco2:"787.00000"
h2:"14103.00000" */