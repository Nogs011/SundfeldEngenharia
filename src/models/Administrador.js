const mongoose = require("mongoose");

const administradorSchema = new mongoose.Schema({

    nome: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    senha: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model(
    "Administrador",
    administradorSchema
);