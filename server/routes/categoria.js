const express = require('express');
const {
    VerificaToken,
    VerificaAdmin_Role
} = require('../moddlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');

//  =============================
//  Mostrar todas las categorías
//  =============================
app.get('/categoria', VerificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoria) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    categoria,
                    cuantos: conteo
                });
            });

        });
});

//  =============================
//  Mostrar una categoría por ID
//  =============================
app.get('/categoria/:id', VerificaToken, (req, res) => {
    // Categoria.findByID();
    let id = req.params.id;


    Categoria.findById(id, (err, categoria) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria
        });
    });
});

//  =============================
//  Crea una nueva categoría
//  =============================
app.post('/categoria', VerificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria
        });
    });
});

//  =============================
//  Actualiza una categoría por ID
//  =============================
app.put('/categoria/:id', VerificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = { descripcion: body.descripcion };
    Categoria.findByIdAndUpdate(id, descCategoria, {
        new: true,
        runValidators: true
    }, (err, categoria) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria
        });
    });
});

//  =============================
//  Elimina una categoría por ID
//  =============================
app.delete('/categoria/:id', [VerificaToken, VerificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            message: `Categoría "${categoria.descripcion}" borrada`
        });
    });
});

module.exports = app;