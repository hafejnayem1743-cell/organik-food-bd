import { collection, getDocsFromServer, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db, firebaseConfig } from './firebase';
import { Product } from '../types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';

export const mapFirestoreProduct = (docSnap: { id: string; data: () => DocumentData }): Product => {
  const d = docSnap.data() || {};
  const rawImages = Array.isArray(d.images) ? d.images.filter(Boolean) : [];
  const mainImg = d.image || rawImages[0] || FALLBACK_IMAGE;

  return {
    id: String(docSnap.id || d.id || ''),
    name: String(d.name || ''),
    bnName: d.bnName || d.name || '',
    caption: d.caption || d.shortDescription || d.name || '',
    shortDescription: d.shortDescription || d.caption || d.name || '',
    benefits: d.benefits || d.fullDescription || '',
    fullDescription: d.fullDescription || d.benefits || '',
    price: Number(d.price) || 0,
    discountPrice: d.discountPrice !== undefined && d.discountPrice !== null && d.discountPrice !== '' ? Number(d.discountPrice) : undefined,
    category: d.category || 'General',
    stock: d.stock !== undefined && d.stock !== null && d.stock !== '' ? Number(d.stock) : 50,
    unit: d.unit || 'Kg',
    image: mainImg,
    images: rawImages.length ? rawImages : [mainImg],
    rating: Number(d.rating) || 5,
    reviewCount: Number(d.reviewCount) || 10,
    status: String(d.status || '').toLowerCase() === 'disabled' ? 'disabled' : 'active',
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : (d.createdAt || new Date().toISOString())
  };
};

// Firestore REST returns typed values. Convert them into normal JavaScript values.
const decodeValue = (value: any): any => {
  if (!value || typeof value !== 'object') return value;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) {
    const fields = value.mapValue.fields || {};
    return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeValue(v)]));
  }
  return value;
};

const mapRestDocument = (doc: any): Product => {
  const fields = Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, decodeValue(v)]));
  return mapFirestoreProduct({ id: doc.name?.split('/').pop() || fields.id || '', data: () => fields });
};

/**
 * Primary read path: Firestore SDK, forced to fetch from the server.
 * Secondary read path: Firestore REST API. This makes the storefront resilient
 * if the SDK WebChannel transport is blocked by a browser/network.
 */
export async function fetchProductsFromFirebase(): Promise<Product[]> {
  let sdkError: unknown = null;

  try {
    const snap = await getDocsFromServer(collection(db, 'products'));
    const products = snap.docs.map(mapFirestoreProduct).filter(p => p.id && p.name);
    if (products.length > 0) return products;
  } catch (error) {
    sdkError = error;
    console.warn('[Organik Food BD] Firestore SDK product read failed; trying REST fallback.', error);
  }

  try {
    const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseConfig.projectId)}/databases/(default)/documents/products`;
    const products: Product[] = [];
    let pageToken = '';

    do {
      const url = new URL(base);
      url.searchParams.set('pageSize', '100');
      if (firebaseConfig.apiKey) url.searchParams.set('key', firebaseConfig.apiKey);
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const response = await fetch(url.toString(), { cache: 'no-store' });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Firestore REST ${response.status}: ${body.slice(0, 300)}`);
      }

      const payload = await response.json();
      for (const doc of payload.documents || []) {
        const product = mapRestDocument(doc);
        if (product.id && product.name) products.push(product);
      }
      pageToken = payload.nextPageToken || '';
    } while (pageToken);

    if (products.length > 0) return products;
    if (sdkError) throw sdkError;
    return [];
  } catch (restError) {
    console.error('[Organik Food BD] Firebase REST product read failed.', restError);
    throw restError;
  }
}

export function subscribeToProducts(
  onProducts: (products: Product[]) => void,
  onError: (error: unknown) => void
) {
  return onSnapshot(
    collection(db, 'products'),
    (snap: QuerySnapshot<DocumentData>) => {
      const products = snap.docs.map(mapFirestoreProduct).filter(p => p.id && p.name);
      // An empty snapshot can be a stale/transport edge case. Let the REST/server
      // read decide whether Firebase actually contains products.
      if (products.length > 0) onProducts(products);
      else fetchProductsFromFirebase().then(onProducts).catch(onError);
    },
    onError
  );
}
