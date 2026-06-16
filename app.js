// ============================================
// SHADOW × CHEATS - MARKETPLACE APP
// ============================================

// Owner credentials
const OWNER_EMAIL = 'abhinavshiva36@gmail.com';
const OWNER_PASSWORD = 'admin123';

// Data Storage (Using localStorage)
let users = JSON.parse(localStorage.getItem('users')) || [];
let products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
let scanners = JSON.parse(localStorage.getItem('scanners')) || [];
let contactDetails = JSON.parse(localStorage.getItem('contactDetails')) || getDefaultContact();
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let pendingOTP = null;
let pendingSignupData = null;

// Default Products
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: 'INTERNAL PC',
            description: 'Advanced internal tool for PC systems',
            price: 2999,
            scanner: 'Premium Scanner'
        },
        {
            id: 2,
            name: 'AIM SILENT',
            description: 'Silent aiming assistant',
            price: 1999,
            scanner: 'Standard Scanner'
        },
        {
            id: 3,
            name: 'UID BYPASS',
            description: 'UID bypass utility',
            price: 2499,
            scanner: 'Basic Scanner'
        }
    ];
}

function getDefaultContact() {
    return {
        email: 'abhinavshiva36@gmail.com',
        phone: '+91-XXXXXXXXXX',
        address: 'Contact owner for address',
        info: 'Contact information will be updated by owner'
    };
}

// Generate random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.admin-tab-btn').forEach(el => el.classList.remove('active'));
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

    // Generate OTP and show verification modal
    pendingOTP = generateOTP();
    pendingSignupData = { name, email, password };
    
    // In production, send OTP via email. For demo, show in alert
    alert(`OTP sent to ${email}!\n\nDemo OTP: ${pendingOTP}`);
    
    document.getElementById('otpMessage').textContent = `Enter the OTP sent to ${email}`;
    document.getElementById('otpModal').classList.add('active');
}

function verifyOTP(event) {
    event.preventDefault();
    const enteredOTP = document.getElementById('otpInput').value;
    
    if (enteredOTP === pendingOTP) {
        // OTP verified, create account
        users.push({ 
            id: Date.now(), 
            name: pendingSignupData.name, 
            email: pendingSignupData.email, 
            password: pendingSignupData.password, 
            isAdmin: false,
            verified: true 
        });
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Email verified! Account created successfully. Please login.');
        document.getElementById('otpModal').classList.remove('active');
        document.getElementById('otpInput').value = '';
        switchTab('login');
        
        // Clear signup form
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupConfirm').value = '';
    } else {
        alert('Invalid OTP! Please try again.');
    }
}

function resendOTP() {
    pendingOTP = generateOTP();
    alert(`New OTP sent!\n\nDemo OTP: ${pendingOTP}`);
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user && email === OWNER_EMAIL && password === OWNER_PASSWORD) {
        currentUser = { email: OWNER_EMAIL, isAdmin: true, name: 'Admin', verified: true };
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
            <div class="product-price">₹${product.price.toFixed(2)}</div>
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
    if (confirm(`Purchase ${product.name} for ₹${product.price.toFixed(2)}?`)) {
        sendPurchaseEmail(product);
        alert(`Purchase successful!\n\nYour ${product.scanner || 'Scanner'} will be provided shortly.\n\nConfirmation email sent to ${currentUser.email}`);
    }
}

function sendPurchaseEmail(product) {
    const emailContent = `
    Dear ${currentUser.name},
    
    Thank you for your purchase!
    
    Product: ${product.name}
    Price: ₹${product.price.toFixed(2)}
    Scanner: ${product.scanner || 'N/A'}
    
    Contact Details for Support:
    Email: ${contactDetails.email}
    Phone: ${contactDetails.phone}
    Address: ${contactDetails.address}
    
    Your scanner will be provided shortly. Please keep this confirmation for reference.
    
    Best Regards,
    SHADOW × CHEATS Team
    `;
    
    console.log('Purchase email sent:', emailContent);
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
                <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div>
                <div class="cart-item-price">₹${itemTotal.toFixed(2)}</div>
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
    const emailContent = `
    Order Confirmation!
    
    Dear ${currentUser.name},
    
    Your order has been placed successfully!
    
    Order Summary:
    ${cart.map(item => `${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}
    
    Total: ₹${total.toFixed(2)}
    
    Contact for Scanner Details:
    Email: ${contactDetails.email}
    Phone: ${contactDetails.phone}
    
    Your scanner(s) will be provided shortly.
    
    Best Regards,
    SHADOW × CHEATS Team
    `;
    
    console.log('Order confirmation email:', emailContent);
    
    alert(`Order placed!\n\nTotal: ₹${total.toFixed(2)}\n\nConfirmation email sent to ${currentUser.email}\n\nScanner details will be provided shortly.`);
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
        displayScanners();
        displayContactInfo();
    }
}

// Products Tab Functions
function handleAddProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    
    const newProduct = {
        id: Date.now(),
        name,
        description,
        price,
        scanner: ''
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    
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
                <p>Price: ₹${product.price.toFixed(2)}</p>
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
    const newPrice = prompt(`Enter new price for ${product.name} (₹):`, product.price);
    const newName = prompt(`Enter new name:`, product.name);
    
    if (newPrice !== null) {
        product.price = parseFloat(newPrice);
        product.name = newName || product.name;
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

// Scanner Tab Functions
function handleAddScanner(event) {
    event.preventDefault();
    
    const name = document.getElementById('scannerName').value;
    const description = document.getElementById('scannerDescription').value;
    const price = parseFloat(document.getElementById('scannerPrice').value);
    const key = document.getElementById('scannerKey').value;
    
    const newScanner = {
        id: Date.now(),
        name,
        description,
        price,
        key
    };
    
    scanners.push(newScanner);
    localStorage.setItem('scanners', JSON.stringify(scanners));
    
    document.getElementById('scannerName').value = '';
    document.getElementById('scannerDescription').value = '';
    document.getElementById('scannerPrice').value = '';
    document.getElementById('scannerKey').value = '';
    
    alert('Scanner added successfully!');
    displayScanners();
}

function displayScanners() {
    const scannerList = document.getElementById('adminScannerList');
    scannerList.innerHTML = '';
    
    if (scanners.length === 0) {
        scannerList.innerHTML = '<p style="color: #888; text-align: center;">No scanners added yet</p>';
        return;
    }
    
    scanners.forEach(scanner => {
        const item = document.createElement('div');
        item.className = 'admin-product-item';
        item.innerHTML = `
            <div class="admin-product-info">
                <h4>${scanner.name}</h4>
                <p>Price: ₹${scanner.price.toFixed(2)}</p>
                <p>${scanner.description}</p>
                <p>License Key: <strong>${scanner.key}</strong></p>
            </div>
            <div class="admin-product-actions">
                <button class="btn-delete" onclick="deleteScanner(${scanner.id})">Delete</button>
            </div>
        `;
        scannerList.appendChild(item);
    });
}

function deleteScanner(scannerId) {
    if (confirm('Are you sure you want to delete this scanner?')) {
        scanners = scanners.filter(s => s.id !== scannerId);
        localStorage.setItem('scanners', JSON.stringify(scanners));
        displayScanners();
    }
}

// Contact Details Tab Functions
function handleUpdateContact(event) {
    event.preventDefault();
    
    contactDetails = {
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        address: document.getElementById('contactAddress').value,
        info: document.getElementById('contactInfo').value
    };
    
    localStorage.setItem('contactDetails', JSON.stringify(contactDetails));
    alert('Contact details updated successfully!');
    displayContactInfo();
}

function displayContactInfo() {
    const contactInfo = document.getElementById('currentContactInfo');
    contactInfo.innerHTML = `
        <div class="contact-info">
            <h4>Current Contact Information</h4>
            <p><strong>Email:</strong> ${contactDetails.email}</p>
            <p><strong>Phone:</strong> ${contactDetails.phone}</p>
            <p><strong>Address:</strong> ${contactDetails.address}</p>
            <p><strong>Additional Info:</strong> ${contactDetails.info || 'N/A'}</p>
        </div>
    `;
    
    // Also update form fields
    document.getElementById('contactEmail').value = contactDetails.email;
    document.getElementById('contactPhone').value = contactDetails.phone;
    document.getElementById('contactAddress').value = contactDetails.address;
    document.getElementById('contactInfo').value = contactDetails.info;
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
        document.getElementById('otpModal').classList.remove('active');
        if (currentUser && currentUser.isAdmin) {
            document.getElementById('adminPanel').classList.add('hidden');
        }
    }
});