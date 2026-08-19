const products = [
    {
        id: 1,
        name: "Contator Siemens 3RT1056-6AP36",
        code: "3RT1056-6AP36",
        brand: "Siemens",
        stock: 3,
        description: "Contator Siemens para aplicações de automação industrial."
    },

    {
        id: 2,
        name: "Relé Auxiliar Siemens 3RH1921-1EA11",
        code: "3RH1921-1EA11",
        brand: "Siemens",
        stock: 5,
        description: "Relé auxiliar para aplicações industriais."
    },

    {
        id: 3,
        name: "Contator WEG CWM25",
        code: "CWM25",
        brand: "WEG",
        stock: 8,
        description: "Contator WEG para comando de motores e aplicações industriais."
    },

    {
        id: 4,
        name: "Disjuntor Schneider Electric",
        code: "EZ9F34216",
        brand: "Schneider",
        stock: 4,
        description: "Disjuntor para instalações e aplicações elétricas."
    },

    {
        id: 5,
        name: "CLP Siemens S7-1200",
        code: "6ES7214-1AG40-0XB0",
        brand: "Siemens",
        stock: 2,
        description: "Controlador lógico programável Siemens para automação industrial."
    }
];


function displayProducts(productsToDisplay) {

    const productsGrid = document.getElementById("products-grid");
    const resultsCount = document.getElementById("results-count");

    if (!productsGrid) {
        return;
    }

    productsGrid.innerHTML = "";

    if (resultsCount) {
        resultsCount.textContent =
            `${productsToDisplay.length} produto(s) encontrado(s)`;
    }


    productsToDisplay.forEach(product => {

        const card = document.createElement("article");

        card.classList.add("product-card");

        card.addEventListener("click", () => {
            window.location.href = `/produto/${product.id}`;
        });

        card.innerHTML = `
            <div class="product-image">
                Produto
            </div>

            <div class="product-info">

                <span class="product-brand">
                    ${product.brand}
                </span>

                <h3>
                    ${product.name}
                </h3>

                <p>
                    Código: ${product.code}
                </p>

                <span class="stock">
                    ● ${product.stock} unidade(s) disponível(is)
                </span>

            </div>
        `;

        productsGrid.appendChild(card);
    });
}


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


    const filteredProducts = products.filter(product => {

        const productData = `
            ${product.name}
            ${product.code}
            ${product.brand}
            ${product.description}
        `.toLowerCase();

        return productData.includes(searchTerm);
    });


    displayProducts(filteredProducts);
}


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


displayProducts(products);

function displayProductDetail() {

    const productDetail =
        document.getElementById("product-detail-content");

    if (!productDetail) {
        return;
    }


    const currentUrl =
        window.location.pathname;

    const productId =
        currentUrl.split("/").pop();


    const product =
        products.find(
            product => product.id === Number(productId)
        );


    if (!product) {

        productDetail.innerHTML = `
            <h1>Produto não encontrado</h1>

            <p>
                O produto que você procura não existe.
            </p>
        `;

        return;
    }


    productDetail.innerHTML = `

        <div class="product-detail-image">
            FOTO DO PRODUTO
        </div>


        <div class="product-detail-info">

            <span class="product-brand">
                ${product.brand}
            </span>

            <h1>
                ${product.name}
            </h1>

            <p class="product-code">
                Código: ${product.code}
            </p>


            <div class="product-stock-detail">

                <strong>Estoque</strong>

                <span>
                    ${product.stock} unidade(s) disponível(is)
                </span>

            </div>


            <div class="product-description">

                <h2>
                    Descrição
                </h2>

                <p>
                    ${product.description}
                </p>

            </div>


            <a
                href="https://wa.me/5512997045150?text=Olá!%20Gostaria%20de%20fazer%20um%20orçamento%20do%20produto:%20${encodeURIComponent(product.name)}"
                target="_blank"
                class="whatsapp-product-button"
            >
                Solicitar orçamento pelo WhatsApp
            </a>

        </div>

    `;
}


displayProductDetail();