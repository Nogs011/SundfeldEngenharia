let editingProductId = null;

let existingImages = [];

let newImages = [];

let allProducts = [];

let filteredProducts = [];

let currentPage = 1;

const productsPerPage = 10;


// =========================
// LOADING
// =========================

const loadingOverlay =
    document.getElementById("loading-overlay");

const loadingMessage =
    document.getElementById("loading-message");


function showLoading(text = "Carregando...") {

    if (!loadingOverlay || !loadingMessage) {
        return;
    }

    loadingMessage.textContent = text;

    loadingOverlay.classList.add("active");

}


function hideLoading() {

    if (!loadingOverlay) {
        return;
    }

    loadingOverlay.classList.remove("active");

}

const form =
    document.getElementById("product-form");


const formTitle =
    document.getElementById("form-title");


const submitButton =
    document.getElementById("submit-button");


const cancelButton =
    document.getElementById("cancel-button");


const message =
    document.getElementById("form-message");


const productsList =
    document.getElementById(
        "admin-products-list"
    );

const productsCount =
    document.getElementById(
        "admin-products-count"
    );


const pagination =
    document.getElementById(
        "admin-pagination"
    );


const adminSearch =
    document.getElementById(
        "admin-product-search"
    );


const adminSearchButton =
    document.getElementById(
        "admin-search-button"
    );

const adminSearchInput =
    document.getElementById(
        "admin-product-search"
    );



const imagesInput =
    document.getElementById("imagens");


const newImagesPreview =
    document.getElementById(
        "new-images-preview"
    );


const imagesCounter =
    document.getElementById(
        "images-counter"
    );


const existingImagesContainer =
    document.getElementById(
        "existing-images-container"
    );


const existingImagesElement =
    document.getElementById(
        "existing-images"
    );



// =========================
// CARREGAR PRODUTOS
// =========================

async function loadProducts() {

    showLoading("Carregando produtos...");

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


        allProducts = products;

        filteredProducts = [...products];

        currentPage = 1;


        updateProductsCount();

        displayProducts(filteredProducts);


    } catch (error) {

        console.error(error);


        productsList.innerHTML = `
            <p>
                Erro ao carregar produtos.
            </p>
        `;


        productsCount.textContent =
            "Erro ao carregar quantidade de produtos.";


    } finally {

        hideLoading();

    }

}

// =========================
// MOSTRAR PRODUTOS
// =========================

function displayProducts(products) {

    productsList.innerHTML = "";


    if (products.length === 0) {

        productsList.innerHTML = `
            <p>
                Nenhum produto encontrado.
            </p>
        `;

        renderPagination(0);

        return;

    }


    const totalPages =
        Math.ceil(
            products.length / productsPerPage
        );


    if (currentPage > totalPages) {

        currentPage = totalPages;

    }


    const startIndex =
        (currentPage - 1) *
        productsPerPage;


    const endIndex =
        startIndex +
        productsPerPage;


    const productsToDisplay =
        products.slice(
            startIndex,
            endIndex
        );


    productsToDisplay.forEach(product => {

        const productElement =
            document.createElement("div");


        productElement.classList.add(
            "admin-product"
        );


        productElement.innerHTML = `

            <div class="admin-product-info">

                <div class="admin-product-image">

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


                <div>

                    <h3>
                        ${product.titulo}
                    </h3>


                    <p>
                        Código: ${product.codigo}
                    </p>


                    <p>
                        Marca: ${product.marca || "Não informada"}
                    </p>


                    <p>
                        ${
                            product.imagens
                            ? product.imagens.length
                            : 0
                        }
                        foto(s)
                    </p>

                </div>

            </div>


            <div class="admin-product-actions">

                <button
                    type="button"
                    class="edit-button"
                    data-action="edit"
                    data-id="${product._id}"
                >
                    Editar
                </button>


                <button
                    type="button"
                    class="delete-button"
                    data-action="delete"
                    data-id="${product._id}"
                >
                    Excluir
                </button>

            </div>

        `;


        productsList.appendChild(
            productElement
        );


        const editButton =
            productElement.querySelector(
                '[data-action="edit"]'
            );


        const deleteButton =
            productElement.querySelector(
                '[data-action="delete"]'
            );


        editButton.addEventListener(
            "click",
            () => {
                editProduct(product._id);
            }
        );


        deleteButton.addEventListener(
            "click",
            () => {
                deleteProduct(product._id);
            }
        );

    });


    renderPagination(
        totalPages
    );

}

function updateProductsCount() {

    const total =
        allProducts.length;


    if (total === 0) {

        productsCount.textContent =
            "Nenhum produto cadastrado.";

        return;

    }


    if (total === 1) {

        productsCount.textContent =
            "1 produto no catálogo.";

        return;

    }


    productsCount.textContent =
        `${total} produtos no catálogo.`;

}

function renderPagination(totalPages) {

    pagination.innerHTML = "";


    if (totalPages <= 1) {

        return;

    }


    const previousButton =
        document.createElement("button");


    previousButton.type = "button";

    previousButton.className =
        "pagination-button";


    previousButton.textContent =
        "← Anterior";


    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        () => {

            if (currentPage > 1) {

                currentPage--;

                displayProducts(
                    filteredProducts
                );

                window.scrollTo({
                    top:
                        pagination.offsetTop - 150,
                    behavior: "smooth"
                });

            }

        }
    );


    pagination.appendChild(
        previousButton
    );


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            document.createElement("button");


        pageButton.type = "button";

        pageButton.className =
            "pagination-button";


        if (page === currentPage) {

            pageButton.classList.add(
                "active"
            );

        }


        pageButton.textContent =
            page;


        pageButton.addEventListener(
            "click",
            () => {

                currentPage =
                    page;

                displayProducts(
                    filteredProducts
                );

                window.scrollTo({
                    top:
                        pagination.offsetTop - 150,
                    behavior: "smooth"
                });

            }
        );


        pagination.appendChild(
            pageButton
        );

    }


    const nextButton =
        document.createElement("button");


    nextButton.type = "button";

    nextButton.className =
        "pagination-button";


    nextButton.textContent =
        "Próxima →";


    nextButton.disabled =
        currentPage === totalPages;


    nextButton.addEventListener(
        "click",
        () => {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                displayProducts(
                    filteredProducts
                );

                window.scrollTo({
                    top:
                        pagination.offsetTop - 150,
                    behavior: "smooth"
                });

            }

        }
    );


    pagination.appendChild(
        nextButton
    );

}

// =========================
// PESQUISA DE PRODUTOS - ADMIN
// =========================

function searchAdminProducts() {

    const searchTerm =
        adminSearchInput.value
            .toLowerCase()
            .trim();


    const filteredProducts =
        allProducts.filter(product => {

            const productData = `

                ${product.titulo || ""}
                ${product.codigo || ""}
                ${product.marca || ""}
                ${product.descricao || ""}

            `.toLowerCase();


            return productData.includes(
                searchTerm
            );

        });


    displayProducts(
        filteredProducts
    );

}

// =========================
// EVENTOS DA PESQUISA ADMIN
// =========================

if (adminSearchButton) {

    adminSearchButton.addEventListener(
        "click",
        searchAdminProducts
    );

}


if (adminSearchInput) {

    adminSearchInput.addEventListener(
        "input",
        searchAdminProducts
    );


    adminSearchInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                searchAdminProducts();

            }

        }
    );

}


// =========================
// SELECIONAR NOVAS FOTOS
// =========================

imagesInput.addEventListener(
    "change",
    handleImageSelection
);


function handleImageSelection(event) {

    const selectedFiles =
        Array.from(event.target.files);


    const totalImages =
        existingImages.length +
        newImages.length +
        selectedFiles.length;


    if (totalImages > 5) {

        alert(
            "Cada produto pode ter no máximo 5 fotos."
        );

        imagesInput.value = "";

        return;

    }


    selectedFiles.forEach(file => {

        if (!file.type.startsWith("image/")) {
            return;
        }

        newImages.push(file);

    });


    imagesInput.value = "";

    renderNewImages();

}



// =========================
// PREVIEW DAS NOVAS FOTOS
// =========================

function renderNewImages() {

    newImagesPreview.innerHTML = "";


    newImages.forEach(
        (file, index) => {

            const reader =
                new FileReader();


            reader.onload = function(event) {

                const imageContainer =
                    document.createElement("div");


                imageContainer.classList.add(
                    "admin-image-item"
                );

                imageContainer.draggable = true;

                imageContainer.dataset.index =
                    index;


                imageContainer.innerHTML = `

                    <img
                        src="${event.target.result}"
                        alt="Nova imagem ${index + 1}"
                        draggable="false"
                    >

                    <button
                        type="button"
                        class="remove-image-button"
                        title="Remover foto"
                    >
                        ×
                    </button>

                `;


                // =========================
                // REMOVER FOTO
                // =========================

                const removeButton =
                    imageContainer.querySelector(
                        ".remove-image-button"
                    );


                removeButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        newImages.splice(
                            index,
                            1
                        );


                        renderNewImages();

                    }
                );


                // =========================
                // ARRASTAR FOTO
                // =========================

                imageContainer.addEventListener(
                    "dragstart",
                    () => {

                        imageContainer.classList.add(
                            "dragging"
                        );

                        imageContainer.dataset.dragIndex =
                            index;

                    }
                );


                imageContainer.addEventListener(
                    "dragend",
                    () => {

                        imageContainer.classList.remove(
                            "dragging"
                        );

                        document
                            .querySelectorAll(
                                "#new-images-preview .admin-image-item"
                            )
                            .forEach(item => {

                                item.classList.remove(
                                    "drag-over"
                                );

                            });

                    }
                );


                imageContainer.addEventListener(
                    "dragover",
                    event => {

                        event.preventDefault();

                        imageContainer.classList.add(
                            "drag-over"
                        );

                    }
                );


                imageContainer.addEventListener(
                    "dragleave",
                    () => {

                        imageContainer.classList.remove(
                            "drag-over"
                        );

                    }
                );


                imageContainer.addEventListener(
                    "drop",
                    event => {

                        event.preventDefault();


                        imageContainer.classList.remove(
                            "drag-over"
                        );


                        const dragging =
                            document.querySelector(
                                "#new-images-preview .dragging"
                            );


                        if (!dragging) {
                            return;
                        }


                        const fromIndex =
                            Number(
                                dragging.dataset.index
                            );


                        const toIndex =
                            Number(
                                imageContainer.dataset.index
                            );


                        if (
                            Number.isNaN(fromIndex) ||
                            Number.isNaN(toIndex) ||
                            fromIndex === toIndex
                        ) {
                            return;
                        }


                        const movedImage =
                            newImages.splice(
                                fromIndex,
                                1
                            )[0];


                        newImages.splice(
                            toIndex,
                            0,
                            movedImage
                        );


                        renderNewImages();

                    }
                );


                newImagesPreview.appendChild(
                    imageContainer
                );

            };


            reader.readAsDataURL(file);

        }
    );


    updateImagesCounter();

}



// =========================
// CONTADOR
// =========================

function updateImagesCounter() {

    const total =
        existingImages.length +
        newImages.length;


    imagesCounter.textContent =
        `${total} / 5 fotos selecionadas`;

}



// =========================
// MOSTRAR FOTOS EXISTENTES
// =========================

function displayExistingImages(images) {

    existingImagesElement.innerHTML = "";


    if (!images || images.length === 0) {

        existingImagesContainer.style.display =
            "none";

        updateImagesCounter();

        return;

    }


    existingImagesContainer.style.display =
        "flex";


    images.forEach(
        (image, index) => {

            const imageContainer =
                document.createElement("div");


            imageContainer.classList.add(
                "admin-image-item"
            );

            imageContainer.draggable = true;

            imageContainer.dataset.index = index;


            imageContainer.innerHTML = `

                <img
                    src="${image}"
                    alt="Imagem ${index + 1}"
                    draggable="false"
                >

                <button
                    type="button"
                    class="remove-image-button"
                    title="Remover foto"
                >
                    ×
                </button>

            `;


            // =========================
            // REMOVER FOTO
            // =========================

            const removeButton =
                imageContainer.querySelector(
                    ".remove-image-button"
                );


            removeButton.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    existingImages.splice(
                        index,
                        1
                    );


                    displayExistingImages(
                        existingImages
                    );

                }
            );


            // =========================
            // ARRASTAR FOTO
            // =========================

            imageContainer.addEventListener(
                "dragstart",
                () => {

                    imageContainer.classList.add(
                        "dragging"
                    );

                    imageContainer.dataset.dragIndex =
                        index;

                }
            );


            imageContainer.addEventListener(
                "dragend",
                () => {

                    imageContainer.classList.remove(
                        "dragging"
                    );

                    document
                        .querySelectorAll(
                            "#existing-images .admin-image-item"
                        )
                        .forEach(item => {

                            item.classList.remove(
                                "drag-over"
                            );

                        });

                }
            );


            imageContainer.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();

                    imageContainer.classList.add(
                        "drag-over"
                    );

                }
            );


            imageContainer.addEventListener(
                "dragleave",
                () => {

                    imageContainer.classList.remove(
                        "drag-over"
                    );

                }
            );


            imageContainer.addEventListener(
                "drop",
                event => {

                    event.preventDefault();


                    imageContainer.classList.remove(
                        "drag-over"
                    );


                    const fromIndex =
                        Number(
                            document.querySelector(
                                "#existing-images .dragging"
                            )?.dataset.index
                        );


                    const toIndex =
                        Number(
                            imageContainer.dataset.index
                        );


                    if (
                        Number.isNaN(fromIndex) ||
                        Number.isNaN(toIndex) ||
                        fromIndex === toIndex
                    ) {
                        return;
                    }


                    const movedImage =
                        existingImages.splice(
                            fromIndex,
                            1
                        )[0];


                    existingImages.splice(
                        toIndex,
                        0,
                        movedImage
                    );


                    displayExistingImages(
                        existingImages
                    );

                }
            );


            existingImagesElement.appendChild(
                imageContainer
            );

        }
    );


    updateImagesCounter();

}



// =========================
// CADASTRAR / EDITAR
// =========================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const formData =
            new FormData();


        formData.append(
            "titulo",
            document.getElementById(
                "titulo"
            ).value
        );


        formData.append(
            "codigo",
            document.getElementById(
                "codigo"
            ).value
        );

        formData.append(
            "marca",
            document.getElementById("marca").value
        );

        formData.append(
            "descricao",
            document.getElementById(
                "descricao"
            ).value
        );


        // Fotos antigas que continuam
        formData.append(
            "imagensExistentes",
            JSON.stringify(
                existingImages
            )
        );


        // Novas fotos
        newImages.forEach(
            imagem => {

                formData.append(
                    "imagens",
                    imagem
                );

            }
        );

            showLoading(
                editingProductId
                    ? "Salvando alterações..."
                    : "Cadastrando produto..."
        );

        try {

            let response;


            // =========================
            // EDIÇÃO
            // =========================

            if (editingProductId) {

                response =
                    await fetch(
                        `/api/produtos/${editingProductId}`,
                        {
                            method: "PUT",
                            body: formData
                        }
                    );

            }


            // =========================
            // CADASTRO
            // =========================

            else {

                response =
                    await fetch(
                        "/api/produtos",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.mensagem ||
                    "Erro ao salvar produto."
                );

            }


            message.textContent =
                data.mensagem;


            message.className =
                "form-message success";


            resetForm();


            await loadProducts();


        } catch (error) {

            console.error(error);


            message.textContent =
                error.message;


            message.className =
                "form-message error";

        } finally {

            hideLoading();

        }

    }
);



// =========================
// EDITAR PRODUTO
// =========================

async function editProduct(id) {

    try {

        const response =
            await fetch(
                `/api/produtos/${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Produto não encontrado."
            );

        }


        const product =
            await response.json();


        existingImages =
            [...(product.imagens || [])];


        newImages = [];


        displayExistingImages(
            existingImages
        );


        renderNewImages();


        document.getElementById(
            "titulo"
        ).value =
            product.titulo;


        document.getElementById(
            "codigo"
        ).value =
            product.codigo;

        document.getElementById(
            "marca"
        ).value =
            product.marca || "";

        document.getElementById(
            "descricao"
        ).value =
            product.descricao;


        editingProductId =
            product._id;


        formTitle.textContent =
            "Editar Produto";


        submitButton.textContent =
            "Salvar alterações";


        cancelButton.style.display =
            "inline-block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);


        alert(
            "Erro ao carregar produto."
        );

    }

}



// =========================
// EXCLUIR PRODUTO
// =========================

async function deleteProduct(id) {

    const confirmation =
        confirm(
            "Tem certeza que deseja excluir este produto?"
        );


    if (!confirmation) {
        return;
    }

    showLoading("Excluindo produto...");

    try {

        const response =
            await fetch(
                `/api/produtos/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.mensagem ||
                "Erro ao excluir produto."
            );

        }


        message.textContent =
            data.mensagem;


        message.className =
            "form-message success";


        loadProducts();


    } catch (error) {

        console.error(error);


        message.textContent =
            error.message;


        message.className =
            "form-message error";

    } finally {

        hideLoading();

    }

}


// =========================
// CANCELAR EDIÇÃO
// =========================

cancelButton.addEventListener(
    "click",
    resetForm
);


function resetForm() {

    form.reset();


    existingImages = [];

    newImages = [];


    existingImagesElement.innerHTML = "";

    newImagesPreview.innerHTML = "";


    existingImagesContainer.style.display =
        "none";


    updateImagesCounter();


    editingProductId = null;


    formTitle.textContent =
        "Cadastrar Produto";


    submitButton.textContent =
        "Cadastrar produto";


    cancelButton.style.display =
        "none";

}

const logoutButton =
    document.getElementById("logout-button");


logoutButton.addEventListener(
    "click",
    async () => {

        const confirmation =
            confirm(
                "Deseja realmente sair?"
            );


        if (!confirmation) {
            return;
        }


        try {

            const response =
                await fetch(
                    "/api/logout",
                    {
                        method: "POST"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.mensagem ||
                    "Erro ao sair."
                );

            }


            window.location.href =
                "/login.html";


        } catch (error) {

            console.error(error);

            alert(
                error.message
            );

        }

    }
);

function searchProducts() {

    const search =
        adminSearch.value
            .trim()
            .toLowerCase();


    if (!search) {

        filteredProducts =
            [...allProducts];

    } else {

        filteredProducts =
            allProducts.filter(product => {

                const titulo =
                    (
                        product.titulo || ""
                    ).toLowerCase();


                const codigo =
                    (
                        product.codigo || ""
                    ).toLowerCase();


                const marca =
                    (
                        product.marca || ""
                    ).toLowerCase();


                return (
                    titulo.includes(search) ||
                    codigo.includes(search) ||
                    marca.includes(search)
                );

            });

    }


    currentPage = 1;


    displayProducts(
        filteredProducts
    );

}

adminSearchButton.addEventListener(
    "click",
    searchProducts
);

adminSearch.addEventListener(
    "input",
    searchProducts
);

// =========================
// INICIAR
// =========================

loadProducts();