const mongoose = require('mongoose');
require('dotenv').config();

const products = [
    {
        name: "Samsung Galaxy M34",
        price: 18999,
        category: "Electronics",
        image: "📱",
        description: "6GB RAM, 128GB Storage, 6000mAh Battery",
        discount: 15,
        inStock: true
    },
    {
        name: "Men's Cotton T-Shirt",
        price: 499,
        category: "Clothing", 
        image: "👕",
        description: "Premium cotton fabric, all sizes available",
        discount: 20,
        inStock: true
    },
    {
        name: "Python Programming Book",
        price: 699,
        category: "Books",
        image: "📚", 
        description: "Latest edition with practical examples",
        discount: 10,
        inStock: true
    },
    {
        name: "Wooden Study Table",
        price: 4599,
        category: "Furniture",
        image: "🪑",
        description: "Solid wood construction, easy assembly",
        discount: 25,
        inStock: true
    },
    {
        name: "Used iPhone 12",
        price: 34999,
        category: "Second Hand",
        image: "📱",
        description: "Good condition, 6 months warranty",
        discount: 30,
        inStock: true
    }
];

async function setupDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const db = mongoose.connection.db;
        
        // Clear existing products
        await db.collection('products').deleteMany({});
        
        // Insert products
        await db.collection('products').insertMany(products);
        
        console.log('✅ Database setup completed!');
        console.log('📦 Added 5 sample products');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

setupDatabase();