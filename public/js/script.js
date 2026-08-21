let products = [];


// ===============================
// BUSCAR PRODUTOS DO BANCO
// ===============================

async function loadProducts() {

    try {

        const response = await fetch("/api/produtos");

        if (!response.ok) {
            throw new Error("Erro ao buscar produtos");
        }

        products = await response.json();

        displayProducts(products);

    } catch (error) {

        console.error("Erro:", error);

        const productsGrid =
            document.getElementById("products-grid");

        if (productsGrid) {

            productsGrid.innerHTML = `
                <p>
                    Não foi possível carregar os produtos.
                </p>
            `;

        }

    }

}


// ===============================
// EXIBIR PRODUTOS
// ===============================

function displayProducts(productsToDisplay) {

    const productsGrid =
        document.getElementById("products-grid");

    const resultsCount =
        document.getElementById("results-count");


    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML = "";


    if (resultsCount) {

        resultsCount.textContent =
            `${productsToDisplay.length} produto(s) encontrado(s)`;

    }


    // Nenhum produto encontrado
    if (productsToDisplay.length === 0) {

        productsGrid.innerHTML = `

            <div class="no-products">

                <h3>
                    Nenhum produto encontrado
                </h3>

                <p>
                    Tente pesquisar por outro nome, código ou fabricante.
                </p>

            </div>

        `;

        return;

    }


    productsToDisplay.forEach(product => {

        const card =
            document.createElement("article");


        card.classList.add("product-card");


        card.addEventListener("click", () => {

            window.location.href =
                `/produto/${product._id}`;

        });


        card.innerHTML = `

            <div class="product-image">

                ${
                    product.imagens &&
                    product.imagens.length > 0

                    ? `
                        <img
                            src="${product.imagens[0]}"
                            alt="${product.titulo}"
                            loading="lazy"
                        >
                    `

                    : `
                        <span>
                            Sem imagem
                        </span>
                    `
                }

            </div>


            <div class="product-info">

                <span class="product-brand">
                    ${product.marca || ""}
                </span>

                <h3>
                    ${product.titulo}
                </h3>


                <p>
                    Código: ${product.codigo}
                </p>

            </div>

        `;


        productsGrid.appendChild(card);

    });

}


// ===============================
// PESQUISA
// ===============================

function searchProducts() {

    const searchInput =
        document.getElementById("product-search");


    if (!searchInput) {
        return;
    }


    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();


    const filteredProducts =
        products.filter(product => {

            const productData = `

                ${product.titulo}
                ${product.codigo}
                ${product.marca || ""}
                ${product.descricao}

            `.toLowerCase();


            return productData.includes(searchTerm);

        });


    displayProducts(filteredProducts);

}


// ===============================
// EVENTOS DA PESQUISA
// ===============================

const searchButton =
    document.getElementById("search-button");


const searchInput =
    document.getElementById("product-search");


if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchProducts
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// ===============================
// DETALHES DO PRODUTO
// ===============================

async function displayProductDetail() {

    const productDetail =
        document.getElementById(
            "product-detail-content"
        );


    if (!productDetail) {
        return;
    }


    const currentUrl =
        window.location.pathname;


    const productId =
        currentUrl.split("/").pop();


    try {

        const response =
            await fetch(
                `/api/produtos/${productId}`
            );


        if (!response.ok) {
            throw new Error("Produto não encontrado");
        }


        const product =
            await response.json();


        productDetail.innerHTML = `

            <div class="product-detail-gallery">

                <div class="product-main-image">

                    ${
                        product.imagens &&
                        product.imagens.length > 0

                        ? `
                            <img
                                id="main-product-image"
                                src="${product.imagens[0]}"
                                alt="${product.titulo}"
                            >
                        `

                        : `
                            <span>
                                Sem imagem
                            </span>
                        `
                    }

                </div>


                ${
                    product.imagens &&
                    product.imagens.length > 1

                    ? `
                        <div class="product-thumbnails">

                            ${product.imagens.map((imagem, index) => `

                                <button
                                    type="button"
                                    class="product-thumbnail ${
                                        index === 0 ? "active" : ""
                                    }"
                                    data-image="${imagem}"
                                >

                                    <img
                                        src="${imagem}"
                                        alt="${product.titulo} - imagem ${index + 1}"
                                    >

                                </button>

                            `).join("")}

                        </div>
                    `

                    : ""
                }

            </div>


            <div class="product-detail-info">

                <h1>
                    ${product.titulo}
                </h1>


                <p class="product-code">
                    Código: ${product.codigo}
                </p>


                <div class="product-description">

                    <h2>
                        Descrição
                    </h2>

                    <p>
                        ${product.descricao}
                    </p>

                </div>


                <a
                    href="https://wa.me/5512997045150?text=${encodeURIComponent(
                        `Olá! Gostaria de solicitar um orçamento do produto: ${product.titulo}`
                    )}"
                    target="_blank"
                    class="whatsapp-product-button"
                >
                    Solicitar orçamento pelo WhatsApp
                </a>


               <a
                    href="/orcamento.html?produto=${product._id}"
                    class="email-product-button"
                >
                    Solicitar orçamento por e-mail
                </a>

            </div>

        `;

        // ===============================
        // EVENTOS DAS MINIATURAS
        // ===============================

        function setupThumbnailEvents() {

            const thumbnails =
                document.querySelectorAll(
                    ".product-thumbnail"
                );


            thumbnails.forEach(thumbnail => {

                thumbnail.addEventListener(
                    "click",
                    () => {

                        const imageUrl =
                            thumbnail.dataset.image;


                        changeMainImage(
                            imageUrl,
                            thumbnail
                        );

                    }
                );

            });

        }

        setupThumbnailEvents();
        setupImageZoom();


    } catch (error) {

        console.error(error);


        productDetail.innerHTML = `

            <h1>
                Produto não encontrado
            </h1>

            <p>
                O produto que você procura não existe.
            </p>

        `;

    }

}

// ===============================
// PRODUTOS EM DESTAQUE - HOME
// ===============================

async function loadFeaturedProducts() {

    const featuredGrid =
        document.getElementById(
            "featured-products-grid"
        );


    // Se não estiver na página inicial,
    // não faz nada.
    if (!featuredGrid) {
        return;
    }


    try {

        const response =
            await fetch("/api/produtos");


        if (!response.ok) {

            throw new Error(
                "Erro ao buscar produtos."
            );

        }


        const products =
            await response.json();


        // Pega somente os 4 primeiros produtos
        const featuredProducts =
            products.slice(0, 4);


        featuredGrid.innerHTML = "";


        if (featuredProducts.length === 0) {

            featuredGrid.innerHTML = `
                <p>
                    Nenhum produto cadastrado.
                </p>
            `;

            return;

        }


        featuredProducts.forEach(product => {

            const card =
                document.createElement("article");


            card.classList.add(
                "product-card"
            );


            card.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `/produto/${product._id}`;

                }
            );


            card.innerHTML = `

                <div class="product-image">

                    ${
                        product.imagens &&
                        product.imagens.length > 0

                        ? `
                            <img
                                src="${product.imagens[0]}"
                                alt="${product.titulo}"
                            >
                        `

                        : `
                            <span>
                                Sem imagem
                            </span>
                        `
                    }

                </div>


                <div class="product-info">

                    <span class="product-brand">

                        ${product.marca || ""}

                    </span>


                    <h3>

                        ${product.titulo}

                    </h3>


                    <p>

                        Código: ${product.codigo}

                    </p>

                </div>

            `;


            featuredGrid.appendChild(
                card
            );

        });


    } catch (error) {

        console.error(
            "Erro ao carregar produtos em destaque:",
            error
        );


        featuredGrid.innerHTML = `
            <p>
                Não foi possível carregar os produtos.
            </p>
        `;

    }

}

// ===============================
// ZOOM DA IMAGEM PRINCIPAL
// ===============================

function setupImageZoom() {

    const imageContainer =
        document.querySelector(
            ".product-main-image"
        );

    const image =
        document.getElementById(
            "main-product-image"
        );


    if (!imageContainer || !image) {
        return;
    }


    imageContainer.addEventListener(
        "mouseenter",
        () => {

            imageContainer.classList.add(
                "zoom-active"
            );

        }
    );


    imageContainer.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                imageContainer.getBoundingClientRect();


            const x =
                ((event.clientX - rect.left) /
                    rect.width) * 100;


            const y =
                ((event.clientY - rect.top) /
                    rect.height) * 100;


            image.style.transformOrigin =
                `${x}% ${y}%`;

        }
    );


    imageContainer.addEventListener(
        "mouseleave",
        () => {

            imageContainer.classList.remove(
                "zoom-active"
            );


            image.style.transformOrigin =
                "center center";

        }
    );

}

// ===============================
// PÁGINA DE ORÇAMENTO
// ===============================

async function loadBudgetProduct() {

    const budgetForm =
        document.getElementById("budget-form");

    if (!budgetForm) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("produto");


    if (!productId) {

        document.getElementById(
            "budget-product"
        ).textContent =
            "Produto não informado";

        return;

    }


    try {

        const response =
            await fetch(
                `/api/produtos/${productId}`
            );


        if (!response.ok) {
            throw new Error(
                "Produto não encontrado"
            );
        }


        const product =
            await response.json();


        document.getElementById(
            "budget-product"
        ).textContent =
            product.titulo;


        document.getElementById(
            "budget-code"
        ).textContent =
            `Código: ${product.codigo}`;


        // Guardar os dados do produto
        // para enviar posteriormente
        budgetForm.dataset.productId =
            product._id;

        budgetForm.dataset.productTitle =
            product.titulo;

        budgetForm.dataset.productCode =
            product.codigo;


    } catch (error) {

        console.error(
            "Erro ao carregar produto:",
            error
        );


        document.getElementById(
            "budget-product"
        ).textContent =
            "Produto não encontrado";


        document.getElementById(
            "budget-code"
        ).textContent =
            "Código: -";

    }

}

// ===============================
// INICIALIZAÇÃO
// ===============================

function changeMainImage(imageUrl, thumbnail) {

    const mainImage =
        document.getElementById(
            "main-product-image"
        );


    if (!mainImage) {
        return;
    }


    mainImage.src = imageUrl;


    const thumbnails =
        document.querySelectorAll(
            ".product-thumbnail"
        );


    thumbnails.forEach(item => {

        item.classList.remove(
            "active"
        );

    });


    thumbnail.classList.add(
        "active"
    );

}

loadProducts();
displayProductDetail();
loadFeaturedProducts();
loadBudgetProduct();

// ===============================
// ENVIO DO ORÇAMENTO
// ===============================

const budgetForm =
    document.getElementById("budget-form");


if (budgetForm) {

    budgetForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const message =
                document.getElementById(
                    "budget-message"
                );


            const submitButton =
                budgetForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled = true;

            submitButton.textContent =
                "Enviando...";


            message.textContent = "";


            const data = {

                nome:
                    document.getElementById(
                        "nome"
                    ).value.trim(),

                empresa:
                    document.getElementById(
                        "empresa"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "email"
                    ).value.trim(),

                telefone:
                    document.getElementById(
                        "telefone"
                    ).value.trim(),

                quantidade:
                    document.getElementById(
                        "quantidade"
                    ).value,

                mensagem:
                    document.getElementById(
                        "mensagem"
                    ).value.trim(),

                produto:
                    budgetForm.dataset
                        .productTitle,

                codigo:
                    budgetForm.dataset
                        .productCode

            };


            try {

                const response =
                    await fetch(
                        "/api/orcamento",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.mensagem ||
                        "Erro ao enviar orçamento."
                    );

                }


                message.textContent =
                    "Solicitação enviada com sucesso! Nossa equipe entrará em contato.";


                budgetForm.reset();


            } catch (error) {

                console.error(
                    "Erro ao enviar orçamento:",
                    error
                );


                message.textContent =
                    "Não foi possível enviar a solicitação. Tente novamente.";

            }


            submitButton.disabled = false;

            submitButton.textContent =
                "Enviar solicitação";

        }
    );

}

// ===============================
// MENU MOBILE
// ===============================

const menuToggle =
    document.getElementById("menu-toggle");

const navigation =
    document.getElementById("navigation");


if (menuToggle && navigation) {

    menuToggle.addEventListener(
        "click",
        () => {

            const menuAberto =
                navigation.classList.toggle("active");


            menuToggle.setAttribute(
                "aria-expanded",
                menuAberto
            );

        }
    );


    // Fecha o menu ao clicar em um link
    navigation.querySelectorAll("a").forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navigation.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }
        );

    });

}

// ===============================
// NAVEGAÇÃO PARA SOBRE NÓS / CONTATO
// ===============================

document.querySelectorAll('a[href="/#sobre"], a[href="/#contato"]').forEach(link => {

    link.addEventListener("click", function(event) {

        const destino = this.getAttribute("href");

        // Se já estiver na página inicial
        if (
            window.location.pathname === "/" ||
            window.location.pathname === ""
        ) {

            event.preventDefault();

            const id =
                destino === "/#sobre"
                    ? "sobre"
                    : "contato";

            const elemento =
                document.getElementById(id);

            if (elemento) {

                elemento.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }

        // Se estiver em outra página,
        // deixa o navegador ir para /#sobre ou /#contato normalmente.

    });

});