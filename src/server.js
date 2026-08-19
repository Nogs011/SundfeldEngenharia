const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));


app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/index.html")
    );
});


app.get("/produtos", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/produtos.html")
    );
});


app.get("/produto/:id", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/produto.html")
    );
});


app.listen(PORT, "0.0.0.0", () => {
    console.log("=================================");
    console.log("SUNDFELD ENGENHARIA");
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("=================================");
});