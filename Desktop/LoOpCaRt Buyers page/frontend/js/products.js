// Products Page JavaScript
let allProducts = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Products page loaded');
    initializeProductsPage();
});

function initializeProductsPage() {
    updateCartCount();
    setupEventListeners();
    loadAllProducts();
}

function setupEventListeners() {
    // Login Modal
    const loginBtn = document.getElementById('loginBtn');
    const modal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    
    if (loginBtn) loginBtn.addEventListener('click', () => modal.style.display = 'block');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    
    // Auto-show login modal if no user
    if (!currentUser) {
        setTimeout(() => {
            document.getElementById('loginModal').style.display = 'block';
        }, 1000);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    
    if (!name || !email) {
        alert('Please enter your name and email');
        return;
    }
    
    currentUser = { id: Date.now().toString(), name, email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginBtn').textContent = `Hi, ${name}`;
    
    alert(`Welcome to LoopCart, ${name}!`);
}

async function loadAllProducts() {
    try {
        console.log('🔄 Loading all products...');
        const response = await fetch('/api/products');
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        allProducts = await response.json();
        console.log('✅ All products loaded:', allProducts.length);
        
        displayFilteredProducts(allProducts);
        setupCategoryFiltering();
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        // Fallback to demo products
        allProducts = getDemoProducts();
        displayFilteredProducts(allProducts);
        setupCategoryFiltering();
    }
}

function displayFilteredProducts(products) {
    const container = document.getElementById('productsContainer');
    const countElement = document.getElementById('productsCount');
    
    if (!container) {
        console.error('❌ Products container not found!');
        return;
    }
    
    // Update products count
    if (countElement) {
        countElement.textContent = `Showing ${products.length} products`;
    }
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <div style="font-size: 4rem;">🔍</div>
                <h3>No products found</h3>
                <p>Try selecting a different category or search term</p>
                <button onclick="clearFilters()" class="btn-primary">Show All Products</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-emoji">${getProductEmoji(product)}</div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-category">${product.category}</div>
            <div class="product-price">
                <span class="current-price">₹${calculateDiscountPrice(product.price, product.discount)}</span>
                <span class="original-price">₹${product.price}</span>
                <span class="discount">${product.discount}% OFF</span>
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

function setupCategoryFiltering() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category && category !== 'all') {
        filterProductsByCategory(category);
        updateActiveFilter(category);
    } else if (search) {
        filterProductsBySearch(search);
        document.getElementById('pageTitle').textContent = `Search: "${search}"`;
    }
}

function filterByCategory(category) {
    if (category === 'all') {
        displayFilteredProducts(allProducts);
        updateActiveFilter('all');
        document.getElementById('pageTitle').textContent = 'All Products';
    } else {
        filterProductsByCategory(category);
        updateActiveFilter(category);
    }
}

function filterProductsByCategory(category) {
    const filteredProducts = allProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
    );
    displayFilteredProducts(filteredProducts);
    document.getElementById('pageTitle').textContent = `${category} Products`;
}

function filterProductsBySearch(searchTerm) {
    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayFilteredProducts(filteredProducts);
}

function updateActiveFilter(activeCategory) {
    const filters = document.querySelectorAll('.category-filter');
    filters.forEach(filter => {
        if (filter.textContent.includes(activeCategory) || 
            (activeCategory === 'all' && filter.textContent.includes('All Products'))) {
            filter.classList.add('active');
        } else {
            filter.classList.remove('active');
        }
    });
}

function clearFilters() {
    displayFilteredProducts(allProducts);
    updateActiveFilter('all');
    document.getElementById('pageTitle').textContent = 'All Products';
}

function searchProducts() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    } else {
        window.location.href = 'products.html';
    }
}

// Utility functions
function getProductEmoji(product) {
    const emojiMap = {
        'Electronics': '📱',
        'Clothing': '👕',
        'Books': '📚',
        'Furniture': '🪑',
        'Second Hand': '🔄'
    };
    return emojiMap[product.category] || '📦';
}

function calculateDiscountPrice(price, discount) {
    return Math.round(price - (price * discount / 100));
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cartCount');
    if (countElement) {
        countElement.textContent = totalItems;
    }
}

// Cart functionality
async function addToCart(productId) {
    if (!currentUser) {
        document.getElementById('loginModal').style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                productId: productId,
                quantity: 1
            })
        });
        
        const result = await response.json();
        if (result.success) {
            cart = result.cart;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showNotification('✅ Product added to cart!', 'success');
        }
    } catch (error) {
        console.error('Cart error:', error);
        // Fallback to localStorage
        await addToCartLocal(productId);
    }
}

async function addToCartLocal(productId) {
    const product = allProducts.find(p => p.id == productId);
    
    if (product) {
        const existingItem = cart.find(item => item.productId == productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                quantity: 1,
                name: product.name,
                price: product.price,
                image: product.image,
                discount: product.discount,
                category: product.category
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('✅ Product added to cart!', 'success');
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Demo products fallback
function getDemoProducts() {
    return [
        {
            id: 1, 
            name: "Samsung Galaxy M34", 
            price: 18999, 
            category: "Electronics", 
            image: "📱", 
            description: "6GB RAM, 128GB Storage, 6000mAh Battery",
            discount: 15
        },
        {
            id: 2, 
            name: "Boat Rockerz 450", 
            price: 1499, 
            category: "Electronics", 
            image: "🎧", 
            description: "Wireless Bluetooth Headphones, 20hrs battery",
            discount: 20
        },
        {
            id: 3, 
            name: "Dell Inspiron Laptop", 
            price: 54999, 
            category: "Electronics", 
            image: "💻", 
            description: "Intel i5, 8GB RAM, 512GB SSD, Windows 11",
            discount: 10
        },
        {
            id: 4, 
            name: "Men's Cotton T-Shirt", 
            price: 499, 
            category: "Clothing", 
            image: "👕", 
            description: "Premium cotton fabric, all sizes available",
            discount: 25
        },
        {
            id: 5, 
            name: "Women's Kurti", 
            price: 899, 
            category: "Clothing", 
            image: "👚", 
            description: "Cotton silk blend, elegant design",
            discount: 30
        }
    ];
}

// Make functions global
window.addToCart = addToCart;
window.filterByCategory = filterByCategory;
window.searchProducts = searchProducts;
window.clearFilters = clearFilters;