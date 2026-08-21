const express = require("express");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const Produto = require("./models/Produto");
const bcrypt = require("bcrypt");
const session = require("express-session");
const Administrador = require("./models/Administrador");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const app = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),

                "img-src": [
                    "'self'",
                    "data:",
                    "https://res.cloudinary.com"
                ]
            }
        }
    })
);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 8
        }
    })
);

function verificarLogin(req, res, next) {

    if (!req.session.administradorId) {

        return res.redirect("/login.html");

    }

    next();

}

function verificarLoginAPI(req, res, next) {

    if (!req.session.administradorId) {

        return res.status(401).json({
            mensagem: "Acesso não autorizado."
        });

    }

    next();

}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
    storage: multer.memoryStorage()
});

function getCloudinaryPublicId(imageUrl) {

    try {

        const url = new URL(imageUrl);

        const uploadIndex =
            url.pathname.indexOf("/upload/");

        if (uploadIndex === -1) {
            return null;
        }

        let publicPath =
            url.pathname.substring(
                uploadIndex + "/upload/".length
            );


        // Remove a versão, por exemplo:
        // v123456789/
        publicPath =
            publicPath.replace(
                /^v\d+\//,
                ""
            );


        // Remove a extensão do arquivo
        publicPath =
            publicPath.replace(
                /\.[^/.]+$/,
                ""
            );


        return publicPath;

    } catch (error) {

        console.error(
            "Erro ao obter public_id:",
            error
        );

        return null;

    }

}

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB conectado com sucesso!");
    })
    .catch((error) => {
        console.error("Erro ao conectar ao MongoDB:", error.message);
    });

app.use(express.json());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        mensagem: "Muitas tentativas de login. Tente novamente mais tarde."
    },
    standardHeaders: true,
    legacyHeaders: false
});

const orcamentoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        mensagem: "Muitas solicitações. Tente novamente mais tarde."
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.get("/admin.html", verificarLogin, (req, res) => {

    res.sendFile(
        path.join(__dirname, "../public/admin.html")
    );

});


app.use(
    express.static(
        path.join(__dirname, "../public"),
        {
            index: false
        }
    )
);

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

app.post(
    "/api/produtos",
    verificarLoginAPI,
    upload.array("imagens", 5),
    async (req, res) => {

        try {

            const imagens = [];


            // Enviar cada imagem para o Cloudinary
            for (const arquivo of req.files || []) {

                const resultado =
                    await new Promise((resolve, reject) => {

                        const stream =
                            cloudinary.uploader.upload_stream(
                                {
                                    folder: "sundfeld-engenharia/produtos"
                                },
                                (error, result) => {

                                    if (error) {
                                        reject(error);
                                    } else {
                                        resolve(result);
                                    }

                                }
                            );


                        stream.end(arquivo.buffer);

                    });


                imagens.push(resultado.secure_url);

            }


            // Criar produto no MongoDB
            const produto = new Produto({

                titulo: req.body.titulo,

                codigo: req.body.codigo,

                marca: req.body.marca,

                descricao: req.body.descricao,

                imagens: imagens

            });


            await produto.save();


            res.status(201).json({

                mensagem:
                    "Produto cadastrado com sucesso!",

                produto: produto

            });


        } catch (error) {

            console.error(
                "Erro ao cadastrar produto:",
                error
            );


            res.status(500).json({

                mensagem:
                    "Erro ao cadastrar produto."

            });

        }

    }
);

app.put(
    "/api/produtos/:id",
    verificarLoginAPI,
    upload.array("imagens", 5),
    async (req, res) => {

        try {

            const produto =
                await Produto.findById(
                    req.params.id
                );


            if (!produto) {

                return res.status(404).json({
                    mensagem: "Produto não encontrado."
                });

            }


            // Fotos antigas que continuarão no produto
            let imagensExistentes = [];


            if (req.body.imagensExistentes) {

                try {

                    imagensExistentes =
                        JSON.parse(
                            req.body.imagensExistentes
                        );

                } catch (error) {

                    return res.status(400).json({
                        mensagem:
                            "Formato das imagens existentes inválido."
                    });

                }

            }


            // Fotos que foram removidas
            const imagensRemovidas =
                produto.imagens.filter(
                    imagem =>
                        !imagensExistentes.includes(
                            imagem
                        )
                );


            // Excluir fotos removidas do Cloudinary
            for (
                const imagemUrl of imagensRemovidas
            ) {

                const publicId =
                    getCloudinaryPublicId(
                        imagemUrl
                    );


                if (publicId) {

                    try {

                        await cloudinary.uploader.destroy(
                            publicId
                        );

                    } catch (error) {

                        console.error(
                            "Erro ao excluir imagem do Cloudinary:",
                            error
                        );

                    }

                }

            }


            // Upload das novas imagens
            const novasImagens = [];


            for (
                const arquivo of req.files || []
            ) {

                const resultado =
                    await new Promise(
                        (resolve, reject) => {

                            const stream =
                                cloudinary.uploader.upload_stream(
                                    {
                                        folder:
                                            "sundfeld-engenharia/produtos"
                                    },

                                    (error, result) => {

                                        if (error) {
                                            reject(error);
                                        } else {
                                            resolve(result);
                                        }

                                    }
                                );


                            stream.end(
                                arquivo.buffer
                            );

                        }
                    );


                novasImagens.push(
                    resultado.secure_url
                );

            }


            // Atualizar produto
            produto.titulo =
                req.body.titulo;

            produto.codigo =
                req.body.codigo;

            produto.marca =
                req.body.marca;

            produto.descricao =
                req.body.descricao;

            produto.imagens = [
                ...imagensExistentes,
                ...novasImagens
            ];


            await produto.save();


            res.json({

                mensagem:
                    "Produto atualizado com sucesso!",

                produto: produto

            });


        } catch (error) {

            console.error(
                "Erro ao atualizar produto:",
                error
            );


            res.status(500).json({

                mensagem:
                    "Erro ao atualizar produto."

            });

        }

    }
);

app.delete(
    "/api/produtos/:id",
    verificarLoginAPI,
    async (req, res) => {

    try {

        const produto =
            await Produto.findById(
                req.params.id
            );


        if (!produto) {

            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });

        }


        // Excluir imagens do Cloudinary
        for (
            const imagemUrl of produto.imagens || []
        ) {

            const publicId =
                getCloudinaryPublicId(
                    imagemUrl
                );


            if (publicId) {

                try {

                    await cloudinary.uploader.destroy(
                        publicId
                    );

                } catch (error) {

                    console.error(
                        "Erro ao excluir imagem do Cloudinary:",
                        error
                    );

                }

            }

        }


        // Excluir produto do MongoDB
        await Produto.findByIdAndDelete(
            req.params.id
        );


        res.json({

            mensagem:
                "Produto e imagens excluídos com sucesso!"

        });


    } catch (error) {

        console.error(
            "Erro ao excluir produto:",
            error
        );


        res.status(500).json({

            mensagem:
                "Erro ao excluir produto."

        });

    }

});

app.get("/api/produtos", async (req, res) => {

    try {

        const produtos =
            await Produto.find()
                .sort({ createdAt: -1 });

        res.json(produtos);

    } catch (error) {

        console.error(
            "Erro ao buscar produtos:",
            error
        );

        res.status(500).json({

            mensagem:
                "Erro ao buscar produtos."

        });

    }

});

app.get("/api/produtos/:id", async (req, res) => {

    try {

        const produto =
            await Produto.findById(req.params.id);


        if (!produto) {

            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });

        }


        res.json(produto);


    } catch (error) {

        console.error(
            "Erro ao buscar produto:",
            error
        );


        res.status(500).json({
            mensagem: "Erro ao buscar produto."
        });

    }

});

app.post("/api/login", loginLimiter, async (req, res) => {

    try {

        const { email, senha } = req.body;

        if (!email || !senha) {

            return res.status(400).json({
                mensagem: "E-mail e senha são obrigatórios."
            });

        }


        const administrador =
            await Administrador.findOne({
                email: email.toLowerCase()
            });


        if (!administrador) {

            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos."
            });

        }


        const senhaCorreta =
            await bcrypt.compare(
                senha,
                administrador.senha
            );


        if (!senhaCorreta) {

            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos."
            });

        }

        req.session.administradorId =
            administrador._id.toString();

        req.session.administradorNome =
            administrador.nome;        


        res.json({

            mensagem: "Login realizado com sucesso!"

        });


    } catch (error) {

        console.error(
            "Erro ao realizar login:",
            error
        );


        res.status(500).json({

            mensagem:
                "Erro interno ao realizar login."

        });

    }

});

app.post("/api/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error(
                "Erro ao fazer logout:",
                error
            );

            return res.status(500).json({
                mensagem: "Erro ao sair."
            });

        }

        res.clearCookie("connect.sid");

        res.json({
            mensagem: "Logout realizado com sucesso!"
        });

    });

});

app.post("/api/orcamento", orcamentoLimiter, async (req, res) => {

    try {

        const {
            nome,
            empresa,
            email,
            telefone,
            quantidade,
            mensagem,
            produto,
            codigo
        } = req.body;


        if (!nome || !email || !produto) {

            return res.status(400).json({
                mensagem: "Preencha os campos obrigatórios."
            });

        }


        await transporter.sendMail({

            from: `"Site Sundfeld Engenharia" <${process.env.SMTP_USER}>`,

            to: "leonardo@sundfeldengenharia.com.br",

            replyTo: email,

            subject:
                `Solicitação de orçamento - ${produto}`,

            html: `

                <h2>Nova solicitação de orçamento</h2>

                <p>
                    <strong>Produto:</strong>
                    ${produto}
                </p>

                <p>
                    <strong>Código:</strong>
                    ${codigo || "Não informado"}
                </p>

                <hr>

                <p>
                    <strong>Nome:</strong>
                    ${nome}
                </p>

                <p>
                    <strong>Empresa:</strong>
                    ${empresa || "Não informado"}
                </p>

                <p>
                    <strong>E-mail:</strong>
                    ${email}
                </p>

                <p>
                    <strong>Telefone:</strong>
                    ${telefone || "Não informado"}
                </p>

                <p>
                    <strong>Quantidade:</strong>
                    ${quantidade || "Não informada"}
                </p>

                <p>
                    <strong>Mensagem:</strong>
                    ${mensagem || "Nenhuma mensagem informada."}
                </p>

            `

        });


        res.json({
            mensagem:
                "Solicitação enviada com sucesso!"
        });


    } catch (error) {

        console.error(
            "Erro ao enviar orçamento:",
            error
        );


        res.status(500).json({
            mensagem:
                "Não foi possível enviar a solicitação."
        });

    }

});

app.listen(PORT, "0.0.0.0", () => {
    console.log("=================================");
    console.log("SUNDFELD ENGENHARIA");
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("=================================");
});