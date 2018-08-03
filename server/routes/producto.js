const express = require('express');
const {
    VerificaToken
} = require('../middlewares/autenticacion');

const _ = require('underscore');
const app = express();
const Producto = require('../models/producto');

/**
 * ============================
 *  Obtener productos
 * ============================
 */
app.get('/productos', VerificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({
            disponible: true
        })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(desde)
        .limit(limite)
        .exec((err, producto) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto
            });
        });
});

/**
 * ============================
 *  Obtener un productos por ID
 * ============================
 */
app.get('/productos/:id', VerificaToken, (req, res) => {
    let id = req.body.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!producto) {
                res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                producto
            });
        });
});

/**
 * ============================
 *  Buscar productos
 * ============================
 */
app.get('/productos/buscar/:termino', VerificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');
    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });

});

/**
 * ============================
 *  Crear un producto
 * ============================
 */
app.post('/productos', VerificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id,
    });

    producto.save((err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto
        })
    })
});

/**
 * ============================
 *  Actualizar un producto
 * ============================
 */
app.put('/productos/:id', VerificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion',
        'disponible', 'categoria'
    ]);

    Producto.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, producto) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto
        });
    });
});

/**
 * ============================
 *  Borrar un producto
 * ============================
 */
app.delete('/productos/:id', VerificaToken, (req, res) => {
    let id = req.params.id;

    let cambiaEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaEstado, {
        new: true
    }, (err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Producto deshabilitado'
        });
    });
});

module.exports = app;