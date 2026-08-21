const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },

    codigo: {
        type: String,
        required: true
    },

    marca: {
        type: String,
        required: true
    },

    descricao: {
        type: String,
        required: true
    },

    imagens: {
        type: [String],
        default: []
    }
}, 

{
    timestamps: true
}

);

module.exports = mongoose.model("Produto", produtoSchema);