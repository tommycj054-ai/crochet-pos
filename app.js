/* =====================================================
   CROCHET POS - PHASE 5
===================================================== */


/* =====================================================
   DATA
===================================================== */

let products =
    JSON.parse(
        localStorage.getItem("crochetProducts")
    ) || [];

let sales =
    JSON.parse(
        localStorage.getItem("crochetSales")
    ) || [];

let events =
    JSON.parse(
        localStorage.getItem("crochetEvents")
    ) || [];

let activeEventId =
    localStorage.getItem("crochetActiveEvent")
    || "";

let cart = [];

let selectedBarcodes =
    new Set();

let editingProductId = null;


/* =====================================================
   LABEL SETTINGS
===================================================== */

let labelSettings =
    JSON.parse(
        localStorage.getItem(
            "crochetLabelSettings"
        )
    ) || {
        size: "medium",
        width: 2,
        height: 1.25
    };


/* =====================================================
   SAVE
===================================================== */

function saveData() {

    localStorage.setItem(
        "crochetProducts",
        JSON.stringify(products)
    );

    localStorage.setItem(
        "crochetSales",
        JSON.stringify(sales)
    );

    localStorage.setItem(
        "crochetEvents",
        JSON.stringify(events)
    );

    localStorage.setItem(
        "crochetActiveEvent",
        activeEventId || ""
    );

    localStorage.setItem(
        "crochetLabelSettings",
        JSON.stringify(labelSettings)
    );
}


/* =====================================================
   NAVIGATION
===================================================== */

document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.page
                );

            }
        );

    });


function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );

        });


    const page =
        document.getElementById(
            pageId
        );


    if (page) {

        page.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page ===
                pageId
            );

        });


    if (pageId === "dashboard")
        updateDashboard();

    if (pageId === "inventory")
        displayInventory();

    if (pageId === "barcodes")
        displayBarcodes();

    if (pageId === "checkout")
        displayCheckoutProducts();

    if (pageId === "events")
        displayEvents();

    if (pageId === "sales")
        displaySales();

}


/* =====================================================
   PRODUCT MODAL
===================================================== */

const productModal =
    document.getElementById(
        "productModal"
    );


document
    .getElementById("openAddProduct")
    .addEventListener(
        "click",
        openAddProduct
    );


function openAddProduct() {

    editingProductId = null;

    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Add Product";


    document
        .getElementById(
            "productName"
        )
        .value = "";


    document
        .getElementById(
            "productCategory"
        )
        .value = "";


    document
        .getElementById(
            "productPrice"
        )
        .value = "";


    document
        .getElementById(
            "productStock"
        )
        .value = "";


    document
        .getElementById(
            "productLowStock"
        )
        .value = 2;


    document
        .getElementById(
            "productSKU"
        )
        .value = "";


    productModal.classList.add(
        "show"
    );

}


function closeProductModal() {

    productModal.classList.remove(
        "show"
    );

}


document
    .getElementById(
        "closeProductModal"
    )
    .addEventListener(
        "click",
        closeProductModal
    );


document
    .getElementById(
        "cancelProduct"
    )
    .addEventListener(
        "click",
        closeProductModal
    );


/* =====================================================
   SKU
===================================================== */

function generateSKU() {

    let sku;

    do {

        sku =
            "CR-" +
            Math.floor(
                100000 +
                Math.random() *
                900000
            );

    } while (
        products.some(
            product =>
                product.sku === sku
        )
    );


    return sku;
}


/* =====================================================
   SAVE PRODUCT
===================================================== */

document
    .getElementById(
        "saveProduct"
    )
    .addEventListener(
        "click",
        saveProduct
    );


function saveProduct() {

    const name =
        document
            .getElementById(
                "productName"
            )
            .value
            .trim();


    const category =
        document
            .getElementById(
                "productCategory"
            )
            .value
            .trim();


    const price =
        Number(
            document
                .getElementById(
                    "productPrice"
                )
                .value
        );


    const stock =
        Number(
            document
                .getElementById(
                    "productStock"
                )
                .value
        );


    const lowStock =
        Number(
            document
                .getElementById(
                    "productLowStock"
                )
                .value
        );


    let sku =
        document
            .getElementById(
                "productSKU"
            )
            .value
            .trim();


    if (!name) {

        alert(
            "Please enter a product name."
        );

        return;
    }


    if (
        Number.isNaN(price) ||
        price < 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;
    }


    if (
        Number.isNaN(stock) ||
        stock < 0
    ) {

        alert(
            "Please enter valid stock."
        );

        return;
    }


    if (!sku) {

        sku =
            generateSKU();

    }


    if (editingProductId) {

        const product =
            products.find(
                p =>
                    p.id ===
                    editingProductId
            );


        if (product) {

            product.name =
                name;

            product.category =
                category;

            product.price =
                price;

            product.stock =
                stock;

            product.lowStock =
                lowStock;

            product.sku =
                sku;

        }

    }

    else {

        products.push({

            id:
                Date.now(),

            name:
                name,

            category:
                category,

            price:
                price,

            stock:
                stock,

            lowStock:
                lowStock,

            sku:
                sku

        });

    }


    saveData();

    closeProductModal();

    refreshEverything();

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(id) {

    const product =
        products.find(
            p =>
                p.id === id
        );


    if (!product)
        return;


    editingProductId =
        id;


    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Edit Product";


    document
        .getElementById(
            "productName"
        )
        .value =
        product.name;


    document
        .getElementById(
            "productCategory"
        )
        .value =
        product.category || "";


    document
        .getElementById(
            "productPrice"
        )
        .value =
        product.price;


    document
        .getElementById(
            "productStock"
        )
        .value =
        product.stock;


    document
        .getElementById(
            "productLowStock"
        )
        .value =
        product.lowStock ?? 2;


    document
        .getElementById(
            "productSKU"
        )
        .value =
        product.sku;


    productModal.classList.add(
        "show"
    );

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

function deleteProduct(id) {

    const product =
        products.find(
            p =>
                p.id === id
        );


    if (!product)
        return;


    if (
        !confirm(
            `Delete "${product.name}"?`
        )
    )
        return;


    products =
        products.filter(
            p =>
                p.id !== id
        );


    selectedBarcodes.delete(
        id
    );


    cart =
        cart.filter(
            item =>
                item.productId !== id
        );


    saveData();

    refreshEverything();

}


/* =====================================================
   INVENTORY
===================================================== */

document
    .getElementById(
        "inventorySearch"
    )
    .addEventListener(
        "input",
        displayInventory
    );


function displayInventory() {

    const list =
        document.getElementById(
            "inventoryList"
        );


    const search =
        document
            .getElementById(
                "inventorySearch"
            )
            .value
            .toLowerCase();


    const filtered =
        products.filter(
            product => {

                return (
                    product.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    product.sku
                        .toLowerCase()
                        .includes(search)

                    ||

                    (product.category || "")
                        .toLowerCase()
                        .includes(search)
                );

            }
        );


    if (!filtered.length) {

        list.innerHTML = `

            <div class="panel">

                <p>
                    No products found.
                </p>

            </div>

        `;

        return;
    }


    list.innerHTML =
        filtered.map(
            product => {

                const low =
                    product.stock <=
                    product.lowStock;


                return `

                    <div
                        class="
                        inventory-card
                        ${low
                            ? "low-stock"
                            : ""
                        }">

                        <h3>

                            ${escapeHTML(
                                product.name
                            )}

                        </h3>


                        <div class="sku">

                            SKU:
                            ${escapeHTML(
                                product.sku
                            )}

                        </div>


                        <p>

                            ${
                                product.category
                                ? escapeHTML(
                                    product.category
                                  )
                                : "No category"
                            }

                        </p>


                        <strong>

                            $${Number(
                                product.price
                            ).toFixed(2)}

                        </strong>


                        <div
                            class="stock-number">

                            ${product.stock}

                        </div>


                        ${
                            low

                            ?

                            `<div
                                class="stock-warning">

                                🟡 Low Stock

                            </div>`

                            :

                            `<div
                                class="stock-warning">

                                🟢 In Stock

                            </div>`

                        }


                        <div
                            class="modal-buttons">

                            <button
                                class="secondary-btn"
                                onclick="
                                editProduct(
                                    ${product.id}
                                )">

                                ✏️ Edit

                            </button>


                            <button
                                class="secondary-btn"
                                onclick="
                                deleteProduct(
                                    ${product.id}
                                )">

                                🗑️ Delete

                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   BARCODES
===================================================== */

document
    .getElementById(
        "labelSize"
    )
    .addEventListener(
        "change",
        changeLabelSize
    );


document
    .getElementById(
        "applyCustomSize"
    )
    .addEventListener(
        "click",
        applyCustomLabelSize
    );


function changeLabelSize() {

    const size =
        document
            .getElementById(
                "labelSize"
            )
            .value;


    const custom =
        document
            .getElementById(
                "customLabelControls"
            );


    if (
        size === "custom"
    ) {

        custom.classList.add(
            "show"
        );

    }

    else {

        custom.classList.remove(
            "show"
        );


        if (
            size === "small"
        ) {

            labelSettings.width =
                1.5;

            labelSettings.height =
                1;

        }


        if (
            size === "medium"
        ) {

            labelSettings.width =
                2;

            labelSettings.height =
                1.25;

        }


        if (
            size === "large"
        ) {

            labelSettings.width =
                3;

            labelSettings.height =
                2;

        }


        labelSettings.size =
            size;


        saveData();

        displayBarcodes();

    }

}


function applyCustomSize() {

    const width =
        Number(
            document
                .getElementById(
                    "customWidth"
                )
                .value
        );


    const height =
        Number(
            document
                .getElementById(
                    "customHeight"
                )
                .value
        );


    if (
        width <= 0 ||
        height <= 0
    ) {

        alert(
            "Please enter valid dimensions."
        );

        return;
    }


    labelSettings = {

        size:
            "custom",

        width:
            width,

        height:
            height

    };


    saveData();

    displayBarcodes();

}


function displayBarcodes() {

    const list =
        document.getElementById(
            "barcodeList"
        );


    updateBarcodeSelectionCount();


    if (!products.length) {

        list.innerHTML = `

            <div class="panel">

                <p>
                    Add a product first.
                </p>

            </div>

        `;

        return;
    }


    list.innerHTML = "";


    products.forEach(
        product => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "barcode-card";


            const checked =
                selectedBarcodes.has(
                    product.id
                );


            card.innerHTML = `

                <label
                    class="barcode-select">

                    <input
                        type="checkbox"
                        data-barcode-id="
                            ${product.id}
                        "
                        ${
                            checked
                            ? "checked"
                            : ""
                        }>

                    Select

                </label>


                <div
                    class="
                    barcode-preview">

                    <div
                        class="
                        barcode-preview-name">

                        ${escapeHTML(
                            product.name
                        )}

                    </div>


                    <svg
                        id="
                        barcode-preview-${product.id}">

                    </svg>


                    <div
                        class="
                        barcode-preview-sku">

                        ${escapeHTML(
                            product.sku
                        )}

                    </div>


                    <div
                        class="
                        barcode-preview-price">

                        $${Number(
                            product.price
                        ).toFixed(2)}

                    </div>

                </div>

            `;


            list.appendChild(
                card
            );


            const svg =
                document.getElementById(
                    `barcode-preview-${product.id}`
                );


            try {

                JsBarcode(
                    svg,
                    String(
                        product.sku
                    ),
                    {

                        format:
                            "CODE128",

                        width:
                            1.8,

                        height:
                            48,

                        displayValue:
                            false,

                        margin:
                            3

                    }
                );

            }

            catch(error) {

                console.error(
                    "Barcode error:",
                    error
                );

            }


            card
                .querySelector(
                    "input"
                )
                .addEventListener(
                    "change",
                    function() {

                        if (
                            this.checked
                        ) {

                            selectedBarcodes.add(
                                product.id
                            );

                        }

                        else {

                            selectedBarcodes.delete(
                                product.id
                            );

                        }


                        updateBarcodeSelectionCount();

                    }
                );

        }
    );

}


function selectAllBarcodes() {

    products.forEach(
        product =>
            selectedBarcodes.add(
                product.id
            )
    );


    displayBarcodes();

}


function clearBarcodeSelection() {

    selectedBarcodes.clear();

    displayBarcodes();

}


function updateBarcodeSelectionCount() {

    document
        .getElementById(
            "barcodeSelectionCount"
        )
        .textContent =
        `${selectedBarcodes.size} selected`;

}


/* =====================================================
   PRINT BARCODES
===================================================== */

document
    .getElementById(
        "printBarcodes"
    )
    .addEventListener(
        "click",
        printBarcodes
    );


function printBarcodes() {

    const selected =
        products.filter(
            product =>
                selectedBarcodes.has(
                    product.id
                )
        );


    if (!selected.length) {

        alert(
            "Select at least one barcode."
        );

        return;
    }


    const printArea =
        document.getElementById(
            "printArea"
        );


    printArea.innerHTML = "";


    printArea.style.setProperty(
        "--print-width",
        `${labelSettings.width}in`
    );


    printArea.style.setProperty(
        "--print-height",
        `${labelSettings.height}in`
    );


    selected.forEach(
        product => {

            const label =
                document.createElement(
                    "div"
                );


            label.className =
                "print-label";


            const svgId =
                `print-barcode-${product.id}`;


            label.innerHTML = `

                <div
                    class="
                    print-label-name">

                    ${escapeHTML(
                        product.name
                    )}

                </div>


                <svg
                    id="${svgId}">
                </svg>


                <div
                    class="
                    print-label-sku">

                    ${escapeHTML(
                        product.sku
                    )}

                </div>


                <div
                    class="
                    print-label-price">

                    $${Number(
                        product.price
                    ).toFixed(2)}

                </div>

            `;


            printArea.appendChild(
                label
            );


            try {

                JsBarcode(
                    `#${svgId}`,
                    String(
                        product.sku
                    ),
                    {

                        format:
                            "CODE128",

                        width:
                            1.5,

                        height:
                            35,

                        displayValue:
                            false,

                        margin:
                            2

                    }
                );

            }

            catch(error) {

                console.error(
                    error
                );

            }

        }
    );


    setTimeout(
        () => {

            window.print();

        },
        400
    );

}


/* =====================================================
   CHECKOUT
===================================================== */

document
    .getElementById(
        "checkoutSearch"
    )
    .addEventListener(
        "input",
        displayCheckoutProducts
    );


function displayCheckoutProducts() {

    const list =
        document.getElementById(
            "checkoutProducts"
        );


    const search =
        document
            .getElementById(
                "checkoutSearch"
            )
            .value
            .toLowerCase();


    const filtered =
        products.filter(
            product => {

                return (

                    product.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    product.sku
                        .toLowerCase()
                        .includes(search)

                    ||

                    (product.category || "")
                        .toLowerCase()
                        .includes(search)

                );

            }
        );


    list.innerHTML =
        filtered.map(
            product => {

                const out =
                    product.stock <= 0;


                return `

                    <div
                        class="
                        checkout-product
                        ${out
                            ? "out-of-stock"
                            : ""
                        }"
                        data-product-id="
                            ${product.id}">

                        <h3>

                            ${escapeHTML(
                                product.name
                            )}

                        </h3>


                        <div
                            class="
                            checkout-product-price">

                            $${Number(
                                product.price
                            ).toFixed(2)}

                        </div>


                        <div
                            class="
                            checkout-product-stock">

                            ${
                                out
                                ? "Out of Stock"
                                : `${product.stock} available`
                            }

                        </div>

                    </div>

                `;

            }
        ).join("");


    list
        .querySelectorAll(
            ".checkout-product"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    addToCart(
                        Number(
                            card.dataset.productId
                        )
                    );

                }
            );

        });

}


/* =====================================================
   CART
===================================================== */

function addToCart(
    productId
) {

    const product =
        products.find(
            p =>
                p.id ===
                productId
        );


    if (!product)
        return;


    if (
        product.stock <= 0
    ) {

        alert(
            "This product is out of stock."
        );

        return;
    }


    const item =
        cart.find(
            item =>
                item.productId ===
                productId
        );


    if (item) {

        if (
            item.quantity >=
            product.stock
        ) {

            alert(
                "You don't have enough stock."
            );

            return;
        }


        item.quantity++;

    }

    else {

        cart.push({

            productId:
                productId,

            quantity:
                1

        });

    }


    displayCart();

}


function changeCartQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            x =>
                x.productId ===
                productId
        );


    const product =
        products.find(
            p =>
                p.id ===
                productId
        );


    if (
        !item ||
        !product
    )
        return;


    if (
        amount > 0 &&
        item.quantity >=
        product.stock
    ) {

        alert(
            "You don't have enough stock."
        );

        return;
    }


    item.quantity +=
        amount;


    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(
                x =>
                    x.productId !==
                    productId
            );

    }


    displayCart();

}


function clearCart() {

    cart = [];

    displayCart();

}


document
    .getElementById(
        "clearCart"
    )
    .addEventListener(
        "click",
        clearCart
    );


function displayCart() {

    const list =
        document.getElementById(
            "cartItems"
        );


    let subtotal = 0;

    let itemCount = 0;


    if (!cart.length) {

        list.innerHTML = `

            <div class="empty-cart">

                <div>🛒</div>

                <p>
                    Your cart is empty.
                </p>

                <small>
                    Tap a product to add it.
                </small>

            </div>

        `;

    }

    else {

        list.innerHTML =
            cart.map(
                item => {

                    const product =
                        products.find(
                            p =>
                                p.id ===
                                item.productId
                        );


                    if (!product)
                        return "";


                    const total =
                        product.price *
                        item.quantity;


                    subtotal +=
                        total;


                    itemCount +=
                        item.quantity;


                    return `

                        <div
                            class="
                            cart-item">

                            <div>

                                <div
                                    class="
                                    cart-item-name">

                                    ${escapeHTML(
                                        product.name
                                    )}

                                </div>


                                <div
                                    class="
                                    quantity-controls">

                                    <button
                                        onclick="
                                        changeCartQuantity(
                                            ${product.id},
                                            -1
                                        )">

                                        −

                                    </button>


                                    <strong>

                                        ${item.quantity}

                                    </strong>


                                    <button
                                        onclick="
                                        changeCartQuantity(
                                            ${product.id},
                                            1
                                        )">

                                        +

                                    </button>

                                </div>

                            </div>


                            <div
                                class="
                                cart-item-price">

                                $${total.toFixed(2)}

                            </div>

                        </div>

                    `;

                }
            ).join("");

    }


    document
        .getElementById(
            "cartItemCount"
        )
        .textContent =
        `${itemCount} ${
            itemCount === 1
            ? "item"
            : "items"
        }`;


    document
        .getElementById(
            "cartSubtotal"
        )
        .textContent =
        `$${subtotal.toFixed(2)}`;


    document
        .getElementById(
            "cartTotal"
        )
        .textContent =
        `$${subtotal.toFixed(2)}`;

}


/* =====================================================
   CHECKOUT BUTTONS
===================================================== */

document
    .getElementById(
        "cashCheckout"
    )
    .addEventListener(
        "click",
        () =>
            completeSale(
                "Cash"
            )
    );


document
    .getElementById(
        "cardCheckout"
    )
    .addEventListener(
        "click",
        () =>
            completeSale(
                "Card"
            )
    );


function completeSale(
    paymentMethod
) {

    if (!cart.length) {

        alert(
            "Your cart is empty."
        );

        return;
    }


    if (!activeEventId) {

        alert(
            "Please select a craft fair first."
        );

        showPage(
            "events"
        );

        return;
    }


    for (
        const item of cart
    ) {

        const product =
            products.find(
                p =>
                    p.id ===
                    item.productId
            );


        if (
            !product ||
            product.stock <
            item.quantity
        ) {

            alert(
                "There is not enough stock."
            );

            return;
        }

    }


    let total = 0;

    let itemCount = 0;

    const saleItems = [];


    cart.forEach(
        item => {

            const product =
                products.find(
                    p =>
                        p.id ===
                        item.productId
                );


            const lineTotal =
                product.price *
                item.quantity;


            total +=
                lineTotal;


            itemCount +=
                item.quantity;


            product.stock -=
                item.quantity;


            saleItems.push({

                productId:
                    product.id,

                name:
                    product.name,

                sku:
                    product.sku,

                quantity:
                    item.quantity,

                price:
                    product.price,

                total:
                    lineTotal

            });

        }
    );


    sales.push({

        id:
            Date.now(),

        date:
            new Date().toISOString(),

        eventId:
            activeEventId,

        paymentMethod:
            paymentMethod,

        total:
            total,

        itemCount:
            itemCount,

        items:
            saleItems

    });


    cart = [];


    saveData();

    refreshEverything();


    alert(
        `Sale Complete!\n\n` +
        `${paymentMethod}\n` +
        `$${total.toFixed(2)}`
    );

}


/* =====================================================
   EVENTS
===================================================== */

const eventModal =
    document.getElementById(
        "eventModal"
    );


document
    .getElementById(
        "newEvent"
    )
    .addEventListener(
        "click",
        openEventModal
    );


function openEventModal() {

    document
        .getElementById(
            "eventName"
        )
        .value = "";


    document
        .getElementById(
            "eventDate"
        )
        .value =
        new Date()
            .toISOString()
            .split("T")[0];


    eventModal.classList.add(
        "show"
    );

}


function closeEventModal() {

    eventModal.classList.remove(
        "show"
    );

}


document
    .getElementById(
        "closeEventModal"
    )
    .addEventListener(
        "click",
        closeEventModal
    );


document
    .getElementById(
        "cancelEvent"
    )
    .addEventListener(
        "click",
        closeEventModal
    );


document
    .getElementById(
        "saveEvent"
    )
    .addEventListener(
        "click",
        createEvent
    );


function createEvent() {

    const name =
        document
            .getElementById(
                "eventName"
            )
            .value
            .trim();


    const date =
        document
            .getElementById(
                "eventDate"
            )
            .value;


    if (!name) {

        alert(
            "Please enter a craft fair name."
        );

        return;
    }


    const event = {

        id:
            String(
                Date.now()
            ),

        name:
            name,

        date:
            date

    };


    events.push(
        event
    );


    activeEventId =
        event.id;


    saveData();

    closeEventModal();

    displayEvents();

    alert(
        "Craft fair created and selected."
    );

}


/* =====================================================
   DISPLAY EVENTS
===================================================== */

function displayEvents() {

    const activeContainer =
        document.getElementById(
            "activeEvent"
        );


    const list =
        document.getElementById(
            "eventsList"
        );


    const active =
        events.find(
            event =>
                String(
                    event.id
                ) ===
                String(
                    activeEventId
                )
        );


    if (active) {

        const eventSales =
            sales.filter(
                sale =>
                    String(
                        sale.eventId
                    ) ===
                    String(
                        active.id
                    )
            );


        const total =
            eventSales.reduce(
                (
                    sum,
                    sale
                ) =>
                    sum +
                    sale.total,
                0
            );


        const items =
            eventSales.reduce(
                (
                    sum,
                    sale
                ) =>
                    sum +
                    sale.itemCount,
                0
            );


        activeContainer.innerHTML = `

            <div
                class="active-event">

                <h2>
                    🟢 Active Craft Fair
                </h2>

                <h3>
                    ${escapeHTML(
                        active.name
                    )}
                </h3>

                <p>
                    ${formatDate(
                        active.date
                    )}
                </p>


                <div
                    class="event-stats">

                    <div
                        class="event-stat">

                        <strong>
                            $${total.toFixed(2)}
                        </strong>

                        <span>
                            Sales
                        </span>

                    </div>


                    <div
                        class="event-stat">

                        <strong>
                            ${items}
                        </strong>

                        <span>
                            Items
                        </span>

                    </div>


                    <div
                        class="event-stat">

                        <button
                            class="small-btn"
                            onclick="
                            finishEvent()">

                            Finish Event

                        </button>

                    </div>

                </div>

            </div>

        `;

    }

    else {

        activeContainer.innerHTML = "";

    }


    list.innerHTML =
        events
            .slice()
            .reverse()
            .map(
                event => {

                    const eventSales =
                        sales.filter(
                            sale =>
                                String(
                                    sale.eventId
                                ) ===
                                String(
                                    event.id
                                )
                        );


                    const total =
                        eventSales.reduce(
                            (
                                sum,
                                sale
                            ) =>
                                sum +
                                sale.total,
                            0
                        );


                    const items =
                        eventSales.reduce(
                            (
                                sum,
                                sale
                            ) =>
                                sum +
                                sale.itemCount,
                            0
                        );


                    const isActive =
                        String(
                            event.id
                        ) ===
                        String(
                            activeEventId
                        );


                    return `

                        <div
                            class="event-card">

                            <h3>

                                ${
                                    isActive
                                    ? "🟢 "
                                    : ""
                                }

                                ${escapeHTML(
                                    event.name
                                )}

                            </h3>


                            <p>
                                ${formatDate(
                                    event.date
                                )}
                            </p>


                            <p>
                                💰
                                $${total.toFixed(2)}
                            </p>


                            <p>
                                🧸
                                ${items}
                                items sold
                            </p>


                            ${
                                !isActive

                                ?

                                `<button
                                    class="primary-btn"
                                    onclick="
                                    selectEvent(
                                        '${event.id}'
                                    )">

                                    Select

                                </button>`

                                :

                                `<strong>
                                    🟢 Active
                                </strong>`

                            }

                        </div>

                    `;

                }
            )
            .join("");

}


function selectEvent(
    id
) {

    activeEventId =
        String(id);

    saveData();

    displayEvents();

    alert(
        "Craft fair selected."
    );

}


function finishEvent() {

    activeEventId = "";

    saveData();

    displayEvents();

}


/* =====================================================
   SALES
===================================================== */

function displaySales() {

    const total =
        sales.reduce(
            (
                sum,
                sale
            ) =>
                sum +
                sale.total,
            0
        );


    const items =
        sales.reduce(
            (
                sum,
                sale
            ) =>
                sum +
                sale.itemCount,
            0
        );


    const cash =
        sales
            .filter(
                sale =>
                    sale.paymentMethod ===
                    "Cash"
            )
            .reduce(
                (
                    sum,
                    sale
                ) =>
                    sum +
                    sale.total,
                0
            );


    document
        .getElementById(
            "salesTotal"
        )
        .textContent =
        `$${total.toFixed(2)}`;


    document
        .getElementById(
            "salesItems"
        )
        .textContent =
        items;


    document
        .getElementById(
            "salesTransactions"
        )
        .textContent =
        sales.length;


    document
        .getElementById(
            "salesCash"
        )
        .textContent =
        `$${cash.toFixed(2)}`;


    displayBestSellers();

    displayPaymentBreakdown();

    displaySalesHistory();

}


function displayBestSellers() {

    const totals = {};


    sales.forEach(
        sale => {

            sale.items.forEach(
                item => {

                    if (
                        !totals[
                            item.productId
                        ]
                    ) {

                        totals[
                            item.productId
                        ] = {

                            name:
                                item.name,

                            quantity:
                                0

                        };

                    }


                    totals[
                        item.productId
                    ].quantity +=
                        item.quantity;

                }
            );

        }
    );


    const sorted =
        Object.values(
            totals
        )
        .sort(
            (
                a,
                b
            ) =>
                b.quantity -
                a.quantity
        );


    const container =
        document.getElementById(
            "bestSellers"
        );


    if (!sorted.length) {

        container.innerHTML =
            "<p>No sales yet.</p>";

        return;

    }


    container.innerHTML =
        sorted
            .slice(0, 10)
            .map(
                (
                    item,
                    index
                ) => `

                    <div
                        class="
                        best-seller-row">

                        <span>

                            ${index + 1}.
                            ${escapeHTML(
                                item.name
                            )}

                        </span>

                        <strong>

                            ${item.quantity}
                            sold

                        </strong>

                    </div>

                `
            )
            .join("");

}


function displayPaymentBreakdown() {

    let cash = 0;

    let card = 0;


    sales.forEach(
        sale => {

            if (
                sale.paymentMethod ===
                "Cash"
            )
                cash += sale.total;

            if (
                sale.paymentMethod ===
                "Card"
            )
                card += sale.total;

        }
    );


    document
        .getElementById(
            "paymentBreakdown"
        )
        .innerHTML = `

            <div
                class="
                best-seller-row">

                <span>
                    💵 Cash
                </span>

                <strong>
                    $${cash.toFixed(2)}
                </strong>

            </div>


            <div
                class="
                best-seller-row">

                <span>
                    💳 Card
                </span>

                <strong>
                    $${card.toFixed(2)}
                </strong>

            </div>

        `;

}


function displaySalesHistory() {

    const container =
        document.getElementById(
            "salesHistory"
        );


    if (!sales.length) {

        container.innerHTML =
            "<p>No sales yet.</p>";

        return;

    }


    container.innerHTML =
        sales
            .slice()
            .reverse()
            .slice(0, 20)
            .map(
                sale => `

                    <div
                        class="sale-row">

                        <div>

                            ${formatDateTime(
                                sale.date
                            )}

                        </div>


                        <div>

                            ${sale.itemCount}
                            items

                        </div>


                        <div>

                            ${escapeHTML(
                                sale.paymentMethod
                            )}

                        </div>


                        <div>

                            <strong>

                                $${sale.total.toFixed(2)}

                            </strong>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totalStock =
        products.reduce(
            (
                sum,
                product
            ) =>
                sum +
                product.stock,
            0
        );


    const lowStock =
        products.filter(
            product =>
                product.stock <=
                product.lowStock
        );


    const totalSales =
        sales.reduce(
            (
                sum,
                sale
            ) =>
                sum +
                sale.total,
            0
        );


    document
        .getElementById(
            "dashboardProducts"
        )
        .textContent =
        products.length;


    document
        .getElementById(
            "dashboardStock"
        )
        .textContent =
        totalStock;


    document
        .getElementById(
            "dashboardLowStock"
        )
        .textContent =
        lowStock.length;


    document
        .getElementById(
            "dashboardSales"
        )
        .textContent =
        `$${totalSales.toFixed(2)}`;


    const lowList =
        document.getElementById(
            "dashboardLowStockList"
        );


    if (!lowStock.length) {

        lowList.innerHTML =
            "<p>🟢 Everything is stocked!</p>";

    }

    else {

        lowList.innerHTML =
            lowStock
                .map(
                    product => `

                        <div
                            class="
                            best-seller-row">

                            <span>

                                ${escapeHTML(
                                    product.name
                                )}

                            </span>

                            <strong>

                                ${product.stock}
                                left

                            </strong>

                        </div>

                    `
                )
                .join("");

    }


    const best =
        getBestSellerData();


    const bestList =
        document.getElementById(
            "dashboardBestSellers"
        );


    if (!best.length) {

        bestList.innerHTML =
            "<p>No sales yet.</p>";

    }

    else {

        bestList.innerHTML =
            best
                .slice(0, 5)
                .map(
                    (
                        item,
                        index
                    ) => `

                        <div
                            class="
                            best-seller-row">

                            <span>

                                ${index + 1}.
                                ${escapeHTML(
                                    item.name
                                )}

                            </span>

                            <strong>

                                ${item.quantity}
                                sold

                            </strong>

                        </div>

                    `
                )
                .join("");

    }

}


function getBestSellerData() {

    const totals = {};


    sales.forEach(
        sale => {

            sale.items.forEach(
                item => {

                    if (
                        !totals[
                            item.productId
                        ]
                    ) {

                        totals[
                            item.productId
                        ] = {

                            name:
                                item.name,

                            quantity:
                                0

                        };

                    }


                    totals[
                        item.productId
                    ].quantity +=
                        item.quantity;

                }
            );

        }
    );


    return Object.values(
        totals
    )
    .sort(
        (
            a,
            b
        ) =>
            b.quantity -
            a.quantity
    );

}


/* =====================================================
   HELPERS
===================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


function formatDate(
    date
) {

    if (!date)
        return "No date";


    return new Date(
        date + "T00:00:00"
    )
    .toLocaleDateString();

}


function formatDateTime(
    date
) {

    return new Date(
        date
    )
    .toLocaleString();

}


/* =====================================================
   REFRESH
===================================================== */

function refreshEverything() {

    displayInventory();

    displayBarcodes();

    displayCheckoutProducts();

    displayCart();

    displayEvents();

    displaySales();

    updateDashboard();

}


/* =====================================================
   INITIALIZE LABEL SETTINGS
===================================================== */

document
    .getElementById(
        "labelSize"
    )
    .value =
    labelSettings.size;


if (
    labelSettings.size ===
    "custom"
) {

    document
        .getElementById(
            "customLabelControls"
        )
        .classList.add(
            "show"
        );


    document
        .getElementById(
            "customWidth"
        )
        .value =
        labelSettings.width;


    document
        .getElementById(
            "customHeight"
        )
        .value =
        labelSettings.height;

}


/* =====================================================
   START
===================================================== */

refreshEverything();