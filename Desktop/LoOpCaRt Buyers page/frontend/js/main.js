// Configuration
const API_BASE = '/api';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LoopCart Frontend Loaded');
    initializeApp();
});

function initializeApp() {
    updateCartCount();
    loadFeaturedProducts();
    setupEventListeners();
    
    // Auto-show login modal if no user
    if (!currentUser) {
        setTimeout(() => {
            document.getElementById('loginModal').style.display = 'block';
        }, 1000);
    }
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
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
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

async function loadFeaturedProducts() {
    try {
        console.log('🔄 Loading products from API...');
        const response = await fetch(`${API_BASE}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        console.log('✅ Products loaded:', products);
        
        displayProducts(products);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        // Fallback to hardcoded products
        const fallbackProducts = [
            {
                id: 1, 
                name: "Samsung Phone", 
                price: 15999, 
                category: "Electronics", 
                image: "📱", 
                description: "Latest smartphone with great features",
                discount: 10
            },
            {
                id: 2, 
                name: "Cotton Shirt", 
                price: 799, 
                category: "Clothing", 
                image: "👕", 
                description: "Premium cotton fabric",
                discount: 20
            },
            {
                id: 3, 
                name: "Programming Book", 
                price: 599, 
                category: "Books", 
                image: "📚", 
                description: "Learn programming easily",
                discount: 15
            }
        ];
        displayProducts(fallbackProducts);
    }
}

function displayProducts(products) {
    const container = document.getElementById('featuredProducts');
    if (!container) {
        console.error('❌ Products container not found!');
        return;
    }
    
    console.log('🖼️ Displaying products:', products.length);
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image || '📦'}</div>
            <h3>${product.name}</h3>
            <p>${product.description || 'Quality product at great price'}</p>
            <div class="product-price">
                <span class="current-price">₹${calculateDiscountPrice(product.price, product.discount)}</span>
                <span class="original-price">₹${product.price}</span>
                <span class="discount">${product.discount}% OFF</span>
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
    
    console.log('✅ Products displayed successfully');
}

function calculateDiscountPrice(price, discount) {
    return Math.round(price - (price * discount / 100));
}

async function addToCart(productId) {
    if (!currentUser) {
        document.getElementById('loginModal').style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
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
            alert('✅ Product added to cart!');
        }
    } catch (error) {
        console.error('Cart error:', error);
        alert('Added to cart (demo mode)');
        
        // Fallback to local storage
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        const product = products.find(p => p.id == productId);
        
        if (product) {
            const existingItem = cart.find(item => item.productId == productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    productId: product.id,
                    quantity: 1,
                    price: product.price,
                    name: product.name,
                    image: product.image
                });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
    }
}

function updateCartCount() {
    const countElement = document.getElementById('cartCount');
    if (countElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.textContent = totalItems;
    }
}

function filterByCategory(category) {
    if (!currentUser) {
        document.getElementById('loginModal').style.display = 'block';
        return;
    }
    window.location.href = `products.html?category=${encodeURIComponent(category)}`;
}

function searchProducts() {
    const query = document.getElementById('searchInput').value;
    if (query.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

function scrollToCategories() {
    document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
}

// Make functions global for HTML onclick
window.addToCart = addToCart;
window.filterByCategory = filterByCategory;
window.searchProducts = searchProducts;
window.scrollToCategories = scrollToCategories;