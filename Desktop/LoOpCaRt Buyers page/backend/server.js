const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/loopcart';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Connection Failed:', err.message));
// Demo Products Data (Fallback) - Using emojis for now
const demoProducts = [
    // Electronics
    {
        id: 1, 
        name: "Samsung Galaxy M34", 
        price: 18999, 
        category: "Electronics", 
        image: "📱", 
        description: "6GB RAM, 128GB Storage, 6000mAh Battery",
        discount: 15,
        inStock: true
    },
    {
        id: 2, 
        name: "Boat Rockerz 450", 
        price: 1499, 
        category: "Electronics", 
        image: "🎧", 
        description: "Wireless Bluetooth Headphones, 20hrs battery",
        discount: 20,
        inStock: true
    },
    {
        id: 3, 
        name: "Dell Inspiron Laptop", 
        price: 54999, 
        category: "Electronics", 
        image: "💻", 
        description: "Intel i5, 8GB RAM, 512GB SSD, Windows 11",
        discount: 10,
        inStock: true
    },
    
    // Clothing
    {
        id: 4, 
        name: "Men's Cotton T-Shirt", 
        price: 499, 
        category: "Clothing", 
        image: "👕", 
        description: "Premium cotton fabric, all sizes available",
        discount: 25,
        inStock: true
    },
    {
        id: 5, 
        name: "Women's Kurti", 
        price: 899, 
        category: "Clothing", 
        image: "👚", 
        description: "Cotton silk blend, elegant design",
        discount: 30,
        inStock: true
    },
    {
        id: 6, 
        name: "Jeans for Men", 
        price: 1299, 
        category: "Clothing", 
        image: "👖", 
        description: "Slim fit, stretchable denim, all sizes",
        discount: 20,
        inStock: true
    },
    
    // Books
    {
        id: 7, 
        name: "Python Programming Book", 
        price: 699, 
        category: "Books", 
        image: "📚", 
        description: "Latest edition with practical examples and projects",
        discount: 15,
        inStock: true
    },
    {
        id: 8, 
        name: "JavaScript Guide", 
        price: 599, 
        category: "Books", 
        image: "📖", 
        description: "Beginner to advanced concepts with examples",
        discount: 10,
        inStock: true
    },
    {
        id: 9, 
        name: "Rich Dad Poor Dad", 
        price: 299, 
        category: "Books", 
        image: "💰", 
        description: "Financial education bestseller, life-changing",
        discount: 25,
        inStock: true
    },
    
    // Furniture
    {
        id: 10, 
        name: "Wooden Study Table", 
        price: 4599, 
        category: "Furniture", 
        image: "🪑", 
        description: "Solid wood construction, easy assembly",
        discount: 20,
        inStock: true
    },
    {
        id: 11, 
        name: "Office Chair", 
        price: 2999, 
        category: "Furniture", 
        image: "💺", 
        description: "Ergonomic design, comfortable seating",
        discount: 15,
        inStock: true
    },
    {
        id: 12, 
        name: "Bookshelf", 
        price: 3599, 
        category: "Furniture", 
        image: "📚", 
        description: "4-shelf wooden bookshelf, sturdy design",
        discount: 30,
        inStock: true
    },
    
    // Second Hand
    {
        id: 13, 
        name: "Used iPhone 12", 
        price: 34999, 
        category: "Second Hand", 
        image: "📱", 
        description: "Good condition, 6 months warranty, 128GB",
        discount: 35,
        inStock: true
    },
    {
        id: 14, 
        name: "Used DSLR Camera", 
        price: 21999, 
        category: "Second Hand", 
        image: "📷", 
        description: "Canon EOS, 2 lenses included, excellent condition",
        discount: 40,
        inStock: true
    },
    {
        id: 15, 
        name: "Used Gaming Console", 
        price: 18999, 
        category: "Second Hand", 
        image: "🎮", 
        description: "PlayStation 4 with 2 controllers, 500GB",
        discount: 25,
        inStock: true
    }
];

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'LoopCart Server is running',
        timestamp: new Date().toISOString()
    });
});

// Products API - Always returns demo products for now
app.get('/api/products', (req, res) => {
    console.log('📦 Serving products:', demoProducts.length);
    res.json(demoProducts);
});

// Get products by category
app.get('/api/products/category/:category', (req, res) => {
    const category = req.params.category;
    const filteredProducts = demoProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
    );
    res.json(filteredProducts);
});

// Cart APIs (in-memory storage)
let carts = {};

app.post('/api/cart/add', (req, res) => {
    try {
        const { userId, productId, quantity = 1 } = req.body;
        
        console.log('🛒 Adding to cart:', { userId, productId, quantity });
        
        if (!carts[userId]) {
            carts[userId] = [];
        }
        
        const product = demoProducts.find(p => p.id == productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const existingItemIndex = carts[userId].findIndex(item => item.productId == productId);
        if (existingItemIndex > -1) {
            carts[userId][existingItemIndex].quantity += quantity;
        } else {
            carts[userId].push({
                productId: parseInt(productId),
                quantity: quantity,
                name: product.name,
                price: product.price,
                image: product.image,
                discount: product.discount,
                category: product.category
            });
        }
        
        console.log('✅ Cart updated:', carts[userId]);
        res.json({ success: true, cart: carts[userId] });
    } catch (error) {
        console.error('❌ Cart error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    res.json(carts[userId] || []);
});

app.post('/api/cart/remove', (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        console.log('🗑️ Removing from cart:', { userId, productId });
        
        if (carts[userId]) {
            carts[userId] = carts[userId].filter(item => item.productId != productId);
        }
        
        res.json({ success: true, cart: carts[userId] || [] });
    } catch (error) {
        console.error('❌ Remove from cart error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/cart/clear', (req, res) => {
    const { userId } = req.body;
    carts[userId] = [];
    res.json({ success: true, cart: [] });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 LoopCart Server running on http://localhost:${PORT}`);
    console.log('📊 Demo products loaded:', demoProducts.length);
    console.log('💡 Test the API: http://localhost:5000/api/products');
});