const express = require('express');
const mongoose = require('mongoose');


const record =  require('./routes/record');

const app = express();

app.use(express.json());


const db = require('./keys').mongoURI;


mongoose
.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

app.use('/records',record);


const port = 5000;

app.listen(port,()=> console.log(`Server started on port ${port}`));
