const express = require('express');
const router = express.Router();
const Record = require('../models/Record');


const CryptoJS = require("crypto-js");
const AESKey='2B7E151628AED2A6ABF7158809CF4F3C';

router.get('/',async(req,res)=>{
    try{ //console.log(new Date(req.query.start),new Date( req.query.end));
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
    console.log(req.body)

    var esp8266_msg = req.body.payLoad;
    var esp8266_iv = req.body.iv4;
    var sourceshaVal = req.body.shaVal;

    
    var clientshaVal= CryptoJS.SHA256(req.body.payLoad);

    console.log(sourceshaVal);
    console.log(clientshaVal);
    if(clientshaVal != sourceshaVal){
        console.log("Hash Check Succesful");
    }
    else{
        console.log("Hash Check Un-Succesful");

    }


    
    var plain_iv =  Buffer.from( esp8266_iv , 'base64').toString('hex');
    var iv = CryptoJS.enc.Hex.parse( plain_iv );
    var key= CryptoJS.enc.Hex.parse( AESKey );

    var bytes  = CryptoJS.AES.decrypt( esp8266_msg, key , { iv: iv} );
    var plaintext = bytes.toString(CryptoJS.enc.Base64);
    var decoded_b64msg =  Buffer.from(plaintext , 'base64').toString('ascii');
    var decoded_msg =     Buffer.from( decoded_b64msg , 'base64').toString('ascii');

    var body = JSON.parse(decoded_msg);

    
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
    console.log(body)
    //newRecord.save().then(rec => res.json("record created succesfully"));
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