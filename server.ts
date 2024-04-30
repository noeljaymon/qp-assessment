import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { viewGroceryItems } from './database/shared';
import { addGroceryItem, removeGroceryItem, updateGroceryItem, manageInventory } from './database/admin';
import { bookGroceryItems } from './database/user';

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

// validation middleware function example. we can create a new folder for the same if we create for multiple routes
function validateUpdateBody(req: Request, res: Response, next: Function) {
    const { name, price, quantity } = req.body;
    const missingParams: string[] = [];

    // Check which parameters are missing and add them to the missingParams array
    if (!name) {
        missingParams.push('name');
    }
    if (price === undefined) {
        missingParams.push('price');
    }
    if (quantity === undefined) {
        missingParams.push('quantity');
    }

    // If any parameter is missing, construct the error message and send it
    if (missingParams.length > 0) {
        const errorMessage = `The following parameter(s) must be provided: ${missingParams.join(', ')}`;
        return res.status(400).send(errorMessage);
    }

    // If all required parameters are present, proceed to the next middleware or route handler
    next();
}

function isNormalUser(req: Request, res: Response, next: Function) {
    const isAuthenticated = true; // Replace with your authentication logic
    const isAdminUser = false; // Replace with your authorization logic to check if the user is an admin
    if (!isAuthenticated || isAdminUser) {
        return res.status(401).json({ error: 'Cannot Book Order As A Admin.' });
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

// Route to remove a grocery item (restricted to admins only)
app.delete('/api/grocery/item/:id', isAdmin, async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    const success = await removeGroceryItem(db, itemId);
    if (success) {
        res.status(200).send('Item removed successfully');
    } else {
        res.status(500).send('Error removing grocery item');
    }
});

// Route to update details of a grocery item (restricted to admins only)
app.put('/api/grocery/item/:id', isAdmin, validateUpdateBody, async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    const { name, price, quantity } = req.body;
    const success = await updateGroceryItem(db, itemId, name, price, quantity);
    if (success) {
        res.status(200).send('Item updated successfully');
    } else {
        res.status(500).send('Error updating grocery item');
    }
});

// Route to manage inventory of a grocery item (restricted to admins only)
app.patch('/api/grocery/item/:id/inventory', isAdmin, async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    const { quantity } = req.body;
    const success = await manageInventory(db, itemId, quantity);
    if (success) {
        res.status(200).send('Inventory managed successfully');
    } else {
        res.status(500).send('Error managing inventory for grocery item');
    }
});

// Route to fetch all grocery items (available to all users)
app.get('/api/grocery/items', async (req: Request, res: Response) => {
    try {
        console.log("Fetching all grocery items");
        const rows = await viewGroceryItems(db);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching grocery items:", error);
        res.status(500).json({ error: "Error fetching grocery items" });
    }
});

// book items for users only and not admins
app.post('/api/grocery/items/book', isNormalUser, async (req: Request, res: Response) => {
    const { items } = req.body;
    const success = await bookGroceryItems(db, items);
    if (success) {
        res.status(200).send('Items booked successfully');
    } else {
        res.status(500).send('Error booking grocery items');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
