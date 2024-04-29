import { Database } from 'sqlite3';

export async function viewGroceryItems(db: Database): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        db.all('SELECT * FROM grocery_items', (err, rows) => {
            if (err) {
                console.error("Error fetching grocery items:", err);
                reject(err); // Reject the Promise with the error
            } else {
                console.log("Retrieved grocery items:", rows);
                resolve(rows); // Resolve the Promise with the rows
            }
        });
    });
}
