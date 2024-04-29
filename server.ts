import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { viewGroceryItems } from './database/shared';
import { addGroceryItem } from './database/admin';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Database opened successfully');
        // Create the grocery_items table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS grocery_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                price REAL,
                quantity INTEGER
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Table created successfully');
            }
        });
    }
});

// Middleware to check if user is an admin
function isAdmin(req: Request, res: Response, next: Function) {
    const isAuthenticated = true; // Replace with your authentication logic
    const isAdminUser = true; // Replace with your authorization logic to check if the user is an admin
    if (!isAuthenticated || !isAdminUser) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Route to add a new grocery item (restricted to admins only)
app.post('/api/grocery/item', isAdmin, async (req: Request, res: Response) => {
    const { name, price, quantity } = req.body;
    const success = await addGroceryItem(db, name, price, quantity);
    if (success) {
        res.status(201).send('Item added successfully');
    } else {
        res.status(500).send('Error adding grocery item');
    }
});

app.get('/api/grocery/items', async (req: Request, res: Response) => {
    try {
        console.log("Fetching all grocery items");
       let rows= await viewGroceryItems(db)
       res.json(rows)
    } catch (error) {
        console.error("Error fetching grocery items:", error);
        res.status(500).json({ error: "Error fetching grocery items" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
