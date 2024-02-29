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
export async function addImage(imageFile: File, image_id: string) {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.put(imageFile, image_id);
  await tx.done;
}

// Get an image from the database
export async function getImage(image_id: string) {
  const db = await openDatabase();
  const tx = db.transaction('images', 'readonly');
  const store = tx.objectStore('images');
  const image = await store.get(image_id);
  await tx.done;
  return image;
}

// Delete an image from the database
export async function deleteImage(image_id: string) {
  const db = await openDatabase();
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  await store.delete(image_id);
  await tx.done;
}
