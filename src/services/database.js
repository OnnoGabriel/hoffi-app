import { openDB } from 'idb'

const DB_NAME = 'hoffi-store-db'
const DB_VERSION = 1
const STORE_NAME = 'bauteile'

let dbPromise = null

// Initialize database
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object store for bauteile
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          })
          // Create index for kdNummer for fast lookups
          store.createIndex('kdNummer', 'kdNummer', { unique: false })
          store.createIndex('erfasstAm', 'erfasstAm', { unique: false })
        }
      }
    })
  }
  return dbPromise
}

// Add a new Bauteil to the database
export async function addBauteil(bauteil) {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  const bauteilData = {
    kdNummer: bauteil.kdNummer,
    anzahl: bauteil.anzahl,
    reihe: bauteil.reihe,
    fach: bauteil.fach,
    position: bauteil.position,
    erfasstAm: Date.now()
  }

  const id = await store.add(bauteilData)
  await tx.done

  return { id, ...bauteilData }
}

// Get all Bauteile
export async function getAllBauteile() {
  const db = await getDB()
  return await db.getAll(STORE_NAME)
}

// Get Bauteile by KD-Nummer
export async function getBauteileByKdNummer(kdNummer) {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const index = tx.objectStore(STORE_NAME).index('kdNummer')
  return await index.getAll(kdNummer)
}

// Get count of all Bauteile (summed)
export async function getBauteileCount() {
  const db = await getDB()
  const bauteile = await db.getAll(STORE_NAME)
  return bauteile.reduce((sum, b) => sum + b.anzahl, 0)
}

// Get count of unique entries
export async function getUniqueEntriesCount() {
  const db = await getDB()
  const bauteile = await db.getAll(STORE_NAME)
  return bauteile.length
}

// Update Bauteil (reduce quantity or delete)
export async function updateBauteilAnzahl(id, neueAnzahl) {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  if (neueAnzahl <= 0) {
    // Delete if quantity is 0 or less
    await store.delete(id)
  } else {
    // Update quantity
    const bauteil = await store.get(id)
    if (bauteil) {
      bauteil.anzahl = neueAnzahl
      await store.put(bauteil)
    }
  }

  await tx.done
}

// Delete Bauteil by ID
export async function deleteBauteil(id) {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await tx.objectStore(STORE_NAME).delete(id)
  await tx.done
}

// Clear all data (for testing/reset)
export async function clearAllBauteile() {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await tx.objectStore(STORE_NAME).clear()
  await tx.done
}
