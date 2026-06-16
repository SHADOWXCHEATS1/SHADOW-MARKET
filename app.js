// ============================================
// SHADOW × CHEATS - MARKETPLACE APP
// ============================================

// Owner credentials
const OWNER_EMAIL = 'abhinavshiva36@gmail.com';
const OWNER_PASSWORD = 'admin123'; // Change this in production

// Data Storage (Using localStorage)
let users = JSON.parse(localStorage.getItem('users')) || [];
let products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Default Products
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: 'INTERNAL PC',
            description: 'Advanced internal tool for PC systems',
            price: 29.99,
            scanner: 'Premium Scanner'
        },
        {
            id: 2,
            name: 'AIM SILENT',
            description: 'Silent aiming assistant',
            price: 19.99,
            scanner: 'Standard Scanner'
        },
        {
            id: 3,
            name: 'UID BYPASS',
            description: 'UID bypass utility',
            price: 24.99,
            scanner: 'Basic Scanner'
        }
    ];
}

// ============================================
// AUTHENTICATION
// ============================================

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }

    if (users.find(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }

    users.push({ id: Date.now(), name, email, password, isAdmin: false });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created! Please login.');
    switchTab('login');
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirm').value = '';
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user && email === OWNER_EMAIL && password === OWNER_PASSWORD) {
        currentUser = { email: OWNER_EMAIL, isAdmin: true, name: 'Admin' };
    } else if (user) {
        currentUser = user;
    } else {
        alert('Invalid credentials!');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showDashboard();
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        cart = [];
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
        document.getElementById('authModal').classList.add('active');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    }
}

// ============================================
// DASHBOARD
// ============================================

function showDashboard() {
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('userGreeting').textContent = `Welcome, ${currentUser.name}!`;
    
    if (currentUser.isAdmin) {
        document.getElementById('adminBtn').style.display = 'block';
    } else {
        document.getElementById('adminBtn').style.display = 'none';
    }
    
    displayProducts();
    updateCart();
}

// ============================================
// PRODUCTS
// ============================================

function displayProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            ${product.scanner ? `<div class="product-scanner">Scanner: ${product.scanner}</div>` : ''}
            <div class="product-actions">
                <button class="product-actions button btn-buy" onclick="buyProduct(${product.id})">Buy</button>
                <button class="product-actions button btn-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(c => c.id === productId);
    
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    alert(`${product.name} added to cart!`);
}

function buyProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (confirm(`Purchase ${product.name} for $${product.price.toFixed(2)}?`)) {
        alert(`Purchase successful! Your ${product.scanner || 'Scanner'} will be provided shortly.`);
    }
}

// ============================================
// CART
// ============================================

function openCart() {
    document.getElementById('cartModal').classList.add('active');
    updateCartDisplay();
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

function updateCart() {
    document.getElementById('cartCount').textContent = cart.length;
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        cartTotal.textContent = '0.00';
        document.getElementById('checkoutBtn').disabled = true;
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div>
                <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    updateCartDisplay();
}

function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Order placed! Total: $${total.toFixed(2)}\n\nScanner will be provided shortly.`);
    cart = [];
    localStorage.removeItem('cart');
    updateCart();
    closeCart();
    displayProducts();
}

// ============================================
// ADMIN PANEL
// ============================================

function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.toggle('hidden');
    if (!adminPanel.classList.contains('hidden')) {
        displayAdminProducts();
    }
}

function handleAddProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const scanner = document.getElementById('productScanner').value;
    
    const newProduct = {
        id: Date.now(),
        name,
        description,
        price,
        scanner
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productScanner').value = '';
    
    alert('Product added successfully!');
    displayAdminProducts();
    displayProducts();
}

function displayAdminProducts() {
    const adminList = document.getElementById('adminProductList');
    adminList.innerHTML = '';
    
    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'admin-product-item';
        item.innerHTML = `
            <div class="admin-product-info">
                <h4>${product.name}</h4>
                <p>Price: $${product.price.toFixed(2)} | Scanner: ${product.scanner || 'None'}</p>
                <p>${product.description}</p>
            </div>
            <div class="admin-product-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        `;
        adminList.appendChild(item);
    });
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    const newPrice = prompt(`Enter new price for ${product.name}:`, product.price);
    const newName = prompt(`Enter new name:`, product.name);
    const newScanner = prompt(`Enter scanner name:`, product.scanner || '');
    
    if (newPrice !== null) {
        product.price = parseFloat(newPrice);
        product.name = newName || product.name;
        product.scanner = newScanner || product.scanner;
        localStorage.setItem('products', JSON.stringify(products));
        displayAdminProducts();
        displayProducts();
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        displayAdminProducts();
        displayProducts();
    }
}

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('load', () => {
    if (currentUser) {
        showDashboard();
    } else {
        document.getElementById('authModal').classList.add('active');
        document.getElementById('dashboard').classList.add('hidden');
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('cartModal').classList.remove('active');
        if (currentUser && currentUser.isAdmin) {
            document.getElementById('adminPanel').classList.add('hidden');
        }
    }
});