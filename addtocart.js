// Sample product data (replace this with a real API call or database query as needed)
const products = [
    { id: 1, name: "Espresso", price: 3.99, image: "https://i.pinimg.com/564x/21/ac/e2/21ace2518c601455c590e779ac2f418e.jpg" },
    { id: 2, name: "Cappuccino", price: 4.99, image: "https://i.pinimg.com/564x/ac/2b/05/ac2b058b8fef801b8d2936b13c56c911.jpg" },
    { id: 3, name: "Latte", price: 5.99, image: "https://i.pinimg.com/736x/79/08/1d/79081d99560b609a53efe0050725eb8c.jpg" },
    { id: 4, name: "Mocha", price: 6.99, image: "https://i.pinimg.com/564x/21/ac/e2/21ace2518c601455c590e779ac2f418e.jpg" }
];

// Cart variables
let cart = [];
let total = 0;

// Function to load products into the page
function loadProducts() {
    const productContainer = document.getElementById("root");
    productContainer.innerHTML = products.map(product => `
        <div class="box">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <h4>$${product.price.toFixed(2)}</h4>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join("");
}

// Function to add a product to the cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        total += product.price;
        updateCartDisplay();
    }
}

// Function to toggle the cart sidebar
function toggleCart() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

// Function to update the cart display
function updateCartDisplay() {
    const cartItemContainer = document.getElementById("cartItem");
    const totalElement = document.getElementById("total");
    const countElement = document.getElementById("count");

    // Display each product's image, name, and price in the cart
    cartItemContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <p>${item.name} - $${item.price.toFixed(2)}</p>
        </div>
    `).join("");

    totalElement.innerText = `$${total.toFixed(2)}`;
    countElement.innerText = `${cart.length} Cart`;
}

function toggleCart() {
    const sidebar = document.getElementById("sidebar");
    const productContainer = document.querySelector(".product-container");

    sidebar.classList.toggle("active");
    if (sidebar.classList.contains("active")) {
        productContainer.classList.add("shifted-left");
    } else {
        productContainer.classList.remove("shifted-left");
    }
}

// Function to add a product to the cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        total += product.price;
        updateCartDisplay();
    }
}

// Function to remove a product from the cart
function removeFromCart(productId) {
    const productIndex = cart.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        // Remove the product from the cart
        const product = cart.splice(productIndex, 1)[0];
        total -= product.price;
        updateCartDisplay();
    }
}

// Function to update the cart display
function updateCartDisplay() {
    const cartItemContainer = document.getElementById("cartItem");
    const totalElement = document.getElementById("total");
    const countElement = document.getElementById("count");

    // Display each product's image, name, price, and cancel button in the cart
    cartItemContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <p class="product-name">${item.name} - $${item.price.toFixed(2)}</p>
            <button class="cancel-btn" onclick="removeFromCart(${item.id})">X</button>
        </div>
    `).join("");

    totalElement.innerText = `$${total.toFixed(2)}`;
    countElement.innerText = `${cart.length} Cart`;
}


// Function to handle "Buy Now" action
// Function to handle "Buy Now" action
function buyNow() {
    if (cart.length > 0) {
        // Store cart details in localStorage
        localStorage.setItem('cartItems', JSON.stringify(cart));

        // Redirect to the place order page
        window.location.href = 'placeorder.html';
    } else {
        alert("Your cart is empty!");
    }
}

// Initialize products on page load
window.onload = loadProducts;