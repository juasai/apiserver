const fs = require('fs');
const express = require('express');

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
}

const app = express();
const PORT = 8080;
const productManager = new ProductManager('./products.json');

app.use(express.json());

app.get('/products', (req, res) => {
    res.json(productManager.getProducts());
});

app.get('/products/:pid', (req, res) => {
    const productId = parseInt(req.params.pid, 10);
    const product = productManager.getProductById(productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

