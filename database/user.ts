import { Database } from 'sqlite3';

interface GroceryItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export async function bookGroceryItems(db: Database, items: { itemId: number, quantity: number }[]): Promise<boolean> {
    try {
        db.run('BEGIN TRANSACTION'); // Start a transaction

        for (const item of items) {
            // Retrieve the current quantity of the item from the database
            const existingItem: GroceryItem | undefined = await getItemById(db, item.itemId);
            if (!existingItem) {
                throw new Error(`Grocery item with ID ${item.itemId} not found`);
            }

            // Check if the requested quantity is available
            if (existingItem.quantity < item.quantity) {
                throw new Error(`Insufficient quantity available for item with ID ${item.itemId}`);
            }

            // Update the inventory quantity after booking
            const newQuantity = existingItem.quantity - item.quantity;
            db.run('UPDATE grocery_items SET quantity = ? WHERE id = ?', [newQuantity, item.itemId]);
        }

        db.run('COMMIT'); // Commit the transaction if all operations are successful
        return true; // Success
    } catch (error) {
        console.error('Error booking grocery items:', error);
        db.run('ROLLBACK'); // Rollback the transaction if any error occurs
        return false; // Failure
    }
}

async function getItemById(db: Database, itemId: number): Promise<GroceryItem | undefined> {
    return new Promise<GroceryItem | undefined>((resolve, reject) => {
        db.get('SELECT * FROM grocery_items WHERE id = ?', [itemId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row as GroceryItem);
            }
        });
    });
}
