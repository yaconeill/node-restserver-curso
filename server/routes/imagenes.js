const express = require('express');
const fs = require('fs');
const path = require('path');

const { VerificaTokenImg } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img', VerificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;
    let pathImg = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);
    let noImgPath = path.resolve(__dirname, '../assets/no-image.jpg');
    console.log(pathImg);
    if (fs.existsSync(pathImg))
        res.sendFile(pathImg);
    else
        res.sendFile(noImgPath);
});

module.exports = app;