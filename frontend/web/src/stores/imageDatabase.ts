import { openDB } from 'idb';

const dbName = 'image-database';
const storeName = 'images';
const version = 1;

// Open the database
async function openDatabase() {
  const db = await openDB(dbName, version, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { autoIncrement: true });
      }
    },
  });
  return db;
}

// Add an image to the database
export async function addImage(imageFile: File) {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  const result = await store.add(imageFile);
  return result;
}

// Get an image from the database
export async function getImage(key: IDBValidKey) {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const result = await store.get(key);
  return result;
}

// Delete an image from the database
export async function deleteImage(key: IDBValidKey) {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.delete(key);
}
