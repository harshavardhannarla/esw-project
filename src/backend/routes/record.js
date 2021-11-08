const express = require('express');
const router = express.Router();

const Record = require('../models/Record');

router.get('/',async(req,res)=>{
    try{ console.log(new Date(req.query.start),new Date( req.query.end));
    Record.find({
        'time':{ 
            $gte: new Date(req.query.start),
            $lte: new Date(req.query.end)
        },
    
        })
        .then(recs => res.json(recs));
    }
    catch(e){
        res.status(400).json({msg:e.message});
    }

    
});

router.post('/',(req,res) => {
    const newRecord = new Record({
        time:Date.now(),
        location: req.body.location,
        temp: req.body.temp,
        humidity: req.body.humidity,
        pm25 : req.body.pm25,
        pm10 : req.body.pm10,
        co2 : req.body.co2,
        tvoc : req.body.tvoc,
        eco2 : req.body.eco2,
        h2 : req.body.h2,
    });

    newRecord.save().then(rec => res.json("record created succesfully"));
});

module.exports = router;



/* temp: Schema.Types.Decimal128,
    humidity: Schema.Types.Decimal128,
    pm25: Schema.Types.Decimal128,
    pm10: Schema.Types.Decimal128,
    co2: Schema.Types.Decimal128,
    tvoc: Schema.Types.Decimal128,
    eco2: Schema.Types.Decimal128,
    h2: Schema.Types.Decimal128, */