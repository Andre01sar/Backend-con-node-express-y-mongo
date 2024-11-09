'use strict'

var express = require('express');
var bodyParser = require('body-parser');

//para el envio de email
const nodemailer = require('nodemailer');
const cors = require('cors');

var app = express();
 
//CARGA ARCHIVOS DE RUTAS
var project_routes = require('./routes/project');

// MIDDELWARE
app.use(bodyParser.urlencoded({extended:false})); 
app.use(bodyParser.json()); 
app.use(cors()); //lo uso para el envio de emails

//CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//RUTAS
app.use('/api', project_routes);



//EXPORTAR
module.exports = app;