// Cart Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadCartPage();
});

async function loadCartPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Try to sync with server cart
    if (currentUser) {
        try {
            const response = await fetch(`/api/cart/${currentUser.id}`);
            const serverCart = await response.json();
            if (serverCart.length > 0) {
                cart = serverCart;
                localStorage.setItem('cart', JSON.stringify(cart));
            }
        } catch (error) {
            console.log('Using local cart data');
        }
    }
    
    updateCartCount();
    displayCartItems(cart);
    calculateTotal(cart);
}

function displayCartItems(cart) {
    const container = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 4rem;">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <button onclick="location.href='products.html'" class="btn-primary">Browse Products</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            ${getCartItemImageHTML(item)}
            <div class="cart-item-details" style="flex: 1;">
                <h3>${item.name}</h3>
                <div class="product-category">${item.category}</div>
                <div class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.productId}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.productId}, 1)">+</button>
                </div>
            </div>
            <button onclick="removeFromCart(${item.productId})" class="remove-btn">Remove</button>
        </div>
    `).join('');
}

function getCartItemImageHTML(item) {
    if (item.image && item.image.startsWith('http')) {
        return `<img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                <div class="cart-item-image emoji" style="display:none">📦</div>`;
    } else {
        return `<div class="cart-item-image emoji">${item.image || '📦'}</div>`;
    }
}

async function updateQuantity(productId, change) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const itemIndex = cart.findIndex(item => item.productId == productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        // Update server cart
        if (currentUser) {
            try {
                if (cart[itemIndex] && cart[itemIndex].quantity > 0) {
                    await fetch('/api/cart/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: currentUser.id,
                            productId: productId,
                            quantity: change
                        })
                    });
                } else {
                    await fetch('/api/cart/remove', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: currentUser.id,
                            productId: productId
                        })
                    });
                }
            } catch (error) {
                console.log('Using local cart update');
            }
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartPage();
    }
}

async function removeFromCart(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        try {
            await fetch('/api/cart/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    productId: productId
                })
            });
        } catch (error) {
            console.log('Using local cart removal');
        }
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.productId != productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartPage();
}

function calculateTotal(cart) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = cart.reduce((sum, item) => sum + (item.price * (item.discount || 0) / 100 * item.quantity), 0);
    const finalTotal = total - discount;
    
    document.getElementById('cartTotal').innerHTML = `
        <div>Subtotal: ₹${total}</div>
        <div>Discount: -₹${Math.round(discount)}</div>
        <div style="font-size: 1.3rem; font-weight: bold; margin-top: 10px; color: #059669;">Total: ₹${Math.round(finalTotal)}</div>
    `;
}

async function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = cart.reduce((sum, item) => sum + (item.price * (item.discount || 0) / 100 * item.quantity), 0);
    const finalTotal = total - discount;
    
    alert(`Order placed successfully!\n\nTotal Amount: ₹${Math.round(finalTotal)}\nThank you for shopping with LoopCart!`);
    
    // Clear cart from server
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        try {
            await fetch('/api/cart/clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id })
            });
        } catch (error) {
            console.log('Using local cart clear');
        }
    }
    
    // Clear local cart
    localStorage.setItem('cart', JSON.stringify([]));
    loadCartPage();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cartCount');
    if (countElement) {
        countElement.textContent = totalItems;
    }
}

// Make functions global
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;