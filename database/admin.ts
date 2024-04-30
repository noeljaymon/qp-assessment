import { Database, RunResult } from 'sqlite3';

// Helper function to run a SQL command with parameters and return a Promise
export function runSql(db: Database, sql: string, params: any[]): Promise<RunResult> {
    return new Promise<RunResult>((resolve, reject) => {
        db.run(sql, params, function (err: Error | null) {
            if (err) {
                console.error(`Error executing SQL command: ${sql}`, err);
                reject(err); // Reject the Promise with the error
            } else {
                console.log(`SQL command executed successfully: ${sql}`);
                resolve(this); // Resolve the Promise with the result
            }
        });
    });
}

// Function to add a new grocery item to the database
export async function addGroceryItem(db: Database, name: string, price: number, quantity: number): Promise<boolean> {
    const sql = 'INSERT INTO grocery_items (name, price, quantity) VALUES (?, ?, ?)';
    const params = [name, price, quantity];
    try {
        await runSql(db, sql, params);
        return true;
    } catch {
        return false;
    } // Return false if the operation fails
}

// Function to remove a grocery item from the database
export async function removeGroceryItem(db: Database, itemId: number): Promise<boolean> {
    const sql = 'DELETE FROM grocery_items WHERE id = ?';
    const params = [itemId];
    try {
        await runSql(db, sql, params);
        return true;
    } catch {
        return false;
    } // Return false if the operation fails
}

// Function to update details of a grocery item in the database
export async function updateGroceryItem(db: Database, itemId: number, newName: string, newPrice: number, quantity: number): Promise<boolean> {
    const sql = 'UPDATE grocery_items SET name = ?, price = ?, quantity = ? WHERE id = ?';
    const params = [newName, newPrice, quantity, itemId];
    try {
        await runSql(db, sql, params);
        return true;
    } catch {
        return false;
    } // Return false if the operation fails
}

// Function to manage inventory of a grocery item in the database
export async function manageInventory(db: Database, itemId: number, newQuantity: number): Promise<boolean> {
    const sql = 'UPDATE grocery_items SET quantity = ? WHERE id = ?';
    const params = [newQuantity, itemId];
    try {
        await runSql(db, sql, params);
        return true;
    } catch {
        return false;
    } // Return false if the operation fails
}
