import { openDB } from 'idb';

const dbName = 'image-database';
const image_store = 'images';
const video_store = 'videos';
const version = 2;

// Open the database
async function openDatabase() {
  console.log('Opening database');
  const db = await openDB(dbName, version, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(image_store)) {
        db.createObjectStore(image_store, { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(video_store)) {
        db.createObjectStore(video_store, { autoIncrement: true });
      }
    },
  });
  return db;
}

// Add an image to the database
export async function addImage(imageFile: File, image_id: string) {
  const db = await openDatabase();
  const tx = db.transaction(image_store, 'readwrite');
  const store = tx.objectStore(image_store);
  await store.put(imageFile, image_id);
  await tx.done;
}

// Get an image from the database
export async function getImage(image_id: string) {
  const db = await openDatabase();
  const tx = db.transaction(image_store, 'readonly');
  const store = tx.objectStore(image_store);
  const image = await store.get(image_id);
  await tx.done;
  return image;
}

// Delete an image from the database
export async function deleteImage(image_id: string) {
  const db = await openDatabase();
  const tx = db.transaction(image_store, 'readwrite');
  const store = tx.objectStore(image_store);
  await store.delete(image_id);
  await tx.done;
}

export async function addVideo(imageList: File[], video_id: string) {
  const db = await openDatabase();
  const tx = db.transaction(video_store, 'readwrite');
  const store = tx.objectStore(video_store);
  await store.put(imageList, video_id);
  await tx.done;
}

export async function getVideo(video_id: string) {
  const db = await openDatabase();
  const tx = db.transaction(video_store, 'readonly');
  const store = tx.objectStore(video_store);
  const video = await store.get(video_id);
  await tx.done;
  return video;
}

export async function deleteVideo(video_id: string) {
  const db = await openDatabase();
  const tx = db.transaction(video_store, 'readwrite');
  const store = tx.objectStore(video_store);
  await store.delete(video_id);
  await tx.done;
}
