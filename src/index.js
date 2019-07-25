const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}));


require('./app/controllers/index')(app);

app.listen(3030, () =>{
    console.log("servidor rodando na porta 3030!")
})
