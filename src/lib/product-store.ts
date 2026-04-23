import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import type { Product } from "@/contexts/CartContext";
import { db } from "@/lib/firebase";
import { products as defaultProducts } from "@/lib/products";

export interface ProductRecord extends Product {
  originalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

const PRODUCTS_COLLECTION = "products";

function normalizeProduct(record: Partial<ProductRecord> & { id: string }): ProductRecord {
  const fallback = defaultProducts.find((product) => product.id === record.id);

  return {
    id: record.id,
    name: record.name || fallback?.name || "Unnamed Product",
    description: record.description || fallback?.description || "",
    category: record.category || fallback?.category || "General",
    image: record.image || fallback?.image || "",
    price: Number(record.price ?? fallback?.price ?? 0),
    originalPrice: Number(record.originalPrice || fallback?.originalPrice || record.price || fallback?.price || 0),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function ensureProductsSeeded() {
  const existing = await getDocs(collection(db, PRODUCTS_COLLECTION));

  if (!existing.empty) {
    return existing.docs
      .map((snapshot) => normalizeProduct({ id: snapshot.id, ...(snapshot.data() as Partial<ProductRecord>) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const timestamp = new Date().toISOString();

  await Promise.all(
    defaultProducts.map((product) =>
      setDoc(doc(db, PRODUCTS_COLLECTION, product.id), {
        ...product,
        originalPrice: product.originalPrice ?? product.price,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    )
  );

  return defaultProducts
    .map((product) => normalizeProduct({ ...product, originalPrice: product.originalPrice ?? product.price, createdAt: timestamp, updatedAt: timestamp }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getManagedProducts() {
  const snapshots = await getDocs(collection(db, PRODUCTS_COLLECTION));

  if (snapshots.empty) {
    return ensureProductsSeeded();
  }

  return snapshots.docs
    .map((snapshot) => normalizeProduct({ id: snapshot.id, ...(snapshot.data() as Partial<ProductRecord>) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}