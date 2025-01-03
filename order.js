const mongoose = require('mongoose');

// Define the schema for an order
const orderSchema = new mongoose.Schema({
    username: String,
    products: [
        {
            name: String,
            price: Number,
            image: String,
            quantity: Number
        }
    ],
    totalCost: Number,
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;