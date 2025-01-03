const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection using mongoose
mongoose.connect('mongodb://localhost:27017/coffeeShop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to coffeeShop DB'))
  .catch(err => {
    console.error('Error connecting to coffeeShop DB:', err);
    process.exit(1);
});

const registerDB = mongoose.createConnection('mongodb://localhost:27017/coffeeShop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

registerDB.on('connected', () => console.log('Connected to register DB'));
registerDB.on('error', err => {
    console.error('Error connecting to register DB:', err);
    process.exit(1);
});

// Models
const Product = mongoose.model('Product', new mongoose.Schema({
    image: String,
    title: String,
    price: Number,
    stock: Number
}));

const Order = mongoose.model('Order', new mongoose.Schema({
    username: String,
    product_name: String,
    totalCost: Number,
    date: { type: Date, default: Date.now }
}));

const User = registerDB.model('User', new mongoose.Schema({
    name: String,
    email: String,
    password: String
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.send("User registered successfully!");
    } catch (error) {
        res.status(500).send("Error registering user");
        console.error(error);
    }
});


app.post('/login', async (req, res) => {
    try {
        const { us: name, pwd: password } = req.body;
        const user = await User.findOne({ name, password });
        if (user) {
            req.session.username = name;
            res.redirect('/coffeemst');
        } else {
            res.status(401).json({ success: false, message: "Invalid username or password." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error logging in" });
        console.error(error);
    }
});

app.post('/api/place-order', async (req, res) => {
    const { product_name, totalCost } = req.body;
    const username = req.session.username;

    if (!username || !product_name || !totalCost) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newOrder = new Order({ username, product_name, totalCost });

    try {
        await newOrder.save();
        res.json({ success: true, message: 'Order placed successfully!' });
    } catch (err) {
        console.error('Order placement error:', err);
        res.status(500).json({ success: false, message: `Error placing order: ${err.message}` });
    }
});

// Change Password route
app.post('/change-password', async (req, res) => {
    const { newPassword, username } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findOneAndUpdate(
            { name: username },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update password' });
    }
});

// Route to display orders page
app.get('/retrieve', (req, res) => {
    if (!req.session.username) return res.redirect('/');
    const filePath = path.join(__dirname, 'retrieve.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading retrieve.html:", err);
            return res.status(500).send("Error loading the coffee page");
        }
        const updatedHtml = data.replace(/{{username}}/g, req.session.username);
        res.send(updatedHtml);
    });
});

// Route to retrieve orders based on the username
app.get('/get-orders', async (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const orders = await Order.find({ username }).exec();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/coffeemst', (req, res) => {
    if (!req.session.username) return res.redirect('/');
    const filePath = path.join(__dirname, 'coffeemst.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading coffeemst.html:", err);
            return res.status(500).send("Error loading the coffee page");
        }
        const updatedHtml = data.replace(/{{username}}/g, req.session.username);
        res.send(updatedHtml);
    });
});

app.get('/addtocart', (req, res) => {
    if (!req.session.username) return res.redirect('/');
    const filePath = path.join(__dirname, 'addtocart.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading addtocart.html:", err);
            return res.status(500).send("Error loading the add to cart page");
        }
        const updatedHtml = data.replace(/{{username}}/g, req.session.username);
        res.send(updatedHtml);
    });
});

// API to get current username from session
app.get('/getUsername', (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.json({ username: null });
    }
});

// Get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to serve the admin page
app.get('/admin', (req, res) => {
    const filePath = path.join(__dirname, 'admin.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading admin.html:", err);
            return res.status(500).send("Error loading the admin page");
        }
        res.send(data);
    });
});

// Route to get all user login details
app.get('/admin/get-users', async (req, res) => {
    try {
        const users = await User.find().select('name email password').exec();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get all order details
app.get('/admin/get-orders', async (req, res) => {
    try {
        const orders = await Order.find().exec();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/cancel-order', async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const result = await Order.deleteOne({ _id: orderId });
        if (result.deletedCount === 1) {
            res.status(200).send({ success: true, message: 'Order canceled successfully' });
        } else {
            res.status(404).send({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error canceling the order.');
    }
});

app.get('/admin/get-users', async (req, res) => {
    try {
        // Fetch users and include their password (not recommended for production use)
        const users = await User.find().exec();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/admin/delete-user', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const result = await User.findByIdAndDelete(userId); 
        if (result) {
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to delete a product (on admin page)
app.delete('/admin/delete-product', async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const result = await Product.findByIdAndDelete(productId); 
        if (result) {
            res.json({ success: true, message: 'Product deleted successfully' });
        } else {
            res.json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Password reset route
// Reset Password Route
app.post('/reset-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    console.log({ username, currentPassword, newPassword });  // Log incoming request data

    try {
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure that the stored password is hashed and compare with the incoming password
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;

        // Save the updated password to the database
        await user.save();

        res.json({ message: 'Password updated successfully' });

    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ message: 'Failed to reset password' });
    }
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
