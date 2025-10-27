const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 8080;

// Clase ProductManager
class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.loadProducts();
    }

    loadProducts() {
        if (fs.existsSync(this.path)) {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.products = JSON.parse(data);
        }
    }

    saveProducts() {
        fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
    }

    addProduct(product) {
        const newProduct = {
            id: this.products.length > 0 ? this.products[this.products.length - 1].id + 1 : 1,
            ...product
        };
        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    updateProduct(id, updatedFields) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products[productIndex] = { ...this.products[productIndex], ...updatedFields };
            this.saveProducts();
            return this.products[productIndex];
        }
        return null;
    }

    deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            const deletedProduct = this.products.splice(productIndex, 1);
            this.saveProducts();
            return deletedProduct;
        }
        return null;
    }
}

//  definicion clase CartManager
class CartManager {
    constructor(path) {
        this.path = path;
        this.carts = [];
        this.loadCarts();
    }

    loadCarts() {
        if (fs.existsSync(this.path)) {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.carts = JSON.parse(data);
        }
    }

    saveCarts() {
        fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
    }

    createCart() {
        const newCart = {
            id: this.carts.length > 0 ? this.carts[this.carts.length - 1].id + 1 : 1,
            products: []
        };
        this.carts.push(newCart);
        this.saveCarts();
        return newCart;
    }

    getCartById(id) {
        return this.carts.find(cart => cart.id === id);
    }

    addProductToCart(cartId, productId) {
        const cart = this.getCartById(cartId);
        if (cart) {
            const productInCart = cart.products.find(p => p.product === productId);
            if (productInCart) {
                productInCart.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }
            this.saveCarts();
            return cart;
        }
        return null;
    }
}

// Rutas
const productRouter = express.Router();
const cartRouter = express.Router();

const productManager = new ProductManager('./data/products.json');
const cartManager = new CartManager('./data/carts.json');

// Middleware
app.use(express.json());

// Rutas producto
productRouter.get('/', (req, res) => {
    res.json(productManager.getProducts());
});

productRouter.get('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid, 10);
    const product = productManager.getProductById(productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

productRouter.post('/', (req, res) => {
    const newProduct = productManager.addProduct(req.body);
    res.status(201).json(newProduct);
});

productRouter.put('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid, 10);
    const updatedProduct = productManager.updateProduct(productId, req.body);
    if (updatedProduct) {
        res.json(updatedProduct);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

productRouter.delete('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid, 10);
    const deletedProduct = productManager.deleteProduct(productId);
    if (deletedProduct) {
        res.json(deletedProduct);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

// Rutas Cart
cartRouter.post('/', (req, res) => {
    const newCart = cartManager.createCart();
    res.status(201).json(newCart);
});

cartRouter.get('/:cid', (req, res) => {
    const cartId = parseInt(req.params.cid, 10);
    const cart = cartManager.getCartById(cartId);
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

cartRouter.post('/:cid/product/:pid', (req, res) => {
    const cartId = parseInt(req.params.cid, 10);
    const productId = parseInt(req.params.pid, 10);
    const updatedCart = cartManager.addProductToCart(cartId, productId);
    if (updatedCart) {
        res.json(updatedCart);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

// Use Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Start Server
app.listen(PORT, () => {
    console.log(`Servidor express corriendo en http://localhost:${PORT}`);
});

