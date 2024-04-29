import { Database } from 'sqlite3';

export function addGroceryItem(db: Database, name: string, price: number, quantity: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const sql = 'INSERT INTO grocery_items (name, price, quantity) VALUES (?, ?, ?)';
        db.run(sql, [name, price, quantity], function (err: Error | null) {
            if (err) {
                console.error('Error adding grocery item:', err);
                reject(err); // Reject the Promise with the error
            } else {
                console.log(`Grocery item added with ID: ${this.lastID}`);
                resolve(true); // Resolve the Promise with true indicating success
            }
        });
    });
}


export async function removeGroceryItem(db: Database, itemId: number) {
    try {
        await db.run('DELETE FROM grocery_items WHERE id = ?', [itemId]);
        return true; // Success
    } catch (error) {
        console.error('Error removing grocery item:', error);
        return false; // Failure
    }
}

export async function updateGroceryItem(db: Database, itemId: number, newName: string, newPrice: number) {
    try {
        await db.run('UPDATE grocery_items SET name = ?, price = ? WHERE id = ?', [newName, newPrice, itemId]);
        return true; // Success
    } catch (error) {
        console.error('Error updating grocery item:', error);
        return false; // Failure
    }
}

export async function manageInventory(db: Database, itemId: number, newQuantity: number) {
    try {
        await db.run('UPDATE grocery_items SET quantity = ? WHERE id = ?', [newQuantity, itemId]);
        return true; // Success
    } catch (error) {
        console.error('Error managing inventory for grocery item:', error);
        return false; // Failure
    }
}
