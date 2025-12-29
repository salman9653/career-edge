'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  query,
  onSnapshot,
  Query,
  DocumentData,
  QueryConstraint,
  DocumentReference,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Result type for Firestore hooks
 */
export interface FirestoreResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

/**
 * Options for useFirestoreCollection hook
 */
export interface UseFirestoreCollectionOptions<T> {
  /** Collection path (e.g., 'users', 'jobs') */
  collectionPath: string;
  /** Optional query constraints (where, orderBy, limit, etc.) */
  constraints?: QueryConstraint[];
  /** Optional transformer function to map Firestore docs to typed objects. Can be async. */
  transformer?: (id: string, data: DocumentData) => T | Promise<T>;
  /** Whether to enable real-time updates (default: true) */
  realtime?: boolean;
  /** Disable the hook (useful for conditional fetching) */
  disabled?: boolean;
}

/**
 * Options for useFirestoreDocument hook
 */
export interface UseFirestoreDocumentOptions<T> {
  /** Collection path (e.g., 'users', 'jobs') */
  collectionPath: string;
  /** Document ID */
  documentId: string | null | undefined;
  /** Optional transformer function to map Firestore doc to typed object. Can be async. */
  transformer?: (id: string, data: DocumentData) => T | Promise<T>;
  /** Whether to enable real-time updates (default: true) */
  realtime?: boolean;
}

/**
 * Default transformer that adds id to the document data
 */
const defaultTransformer = <T>(id: string, data: DocumentData): T => {
  return { id, ...data } as T;
};

/**
 * Generic hook for subscribing to a Firestore collection with real-time updates
 */
export function useFirestoreCollection<T>({
  collectionPath,
  constraints = [],
  transformer = defaultTransformer,
  realtime = true,
  disabled = false,
}: UseFirestoreCollectionOptions<T>): FirestoreResult<T[]> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(!disabled);
  const [error, setError] = useState<Error | null>(null);
  
  // Track current execution to avoid race conditions with async transformers
  const lastUpdateId = useRef(0);

  // Memoize constraints to prevent unnecessary re-renders
  const constraintsKey = useMemo(
    () => JSON.stringify(constraints.map((c) => c.toString())),
    [constraints]
  );

  useEffect(() => {
    if (disabled || !collectionPath) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: Unsubscribe = () => {};

    try {
      const collectionRef = collection(db, collectionPath);
      const q: Query<DocumentData> = constraints.length > 0
        ? query(collectionRef, ...constraints)
        : query(collectionRef);

      const handleSnapshot = async (docs: any[]) => {
        const updateId = ++lastUpdateId.current;
        try {
          const itemsPromises = docs.map((d) => transformer(d.id, d.data()));
          const items = await Promise.all(itemsPromises);
          
          if (updateId === lastUpdateId.current) {
            setData(items);
            setLoading(false);
          }
        } catch (err) {
          if (updateId === lastUpdateId.current) {
            console.error(`Error transforming ${collectionPath}:`, err);
            setError(err as Error);
            setLoading(false);
          }
        }
      };

      if (realtime) {
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            handleSnapshot(snapshot.docs);
          },
          (err) => {
            console.error(`Error fetching ${collectionPath}:`, err);
            setError(err as Error);
            setLoading(false);
          }
        );
      } else {
        // One-time fetch
        import('firebase/firestore').then(({ getDocs }) => {
          getDocs(q)
            .then((snapshot) => {
              handleSnapshot(snapshot.docs);
            })
            .catch((err) => {
              console.error(`Error fetching ${collectionPath}:`, err);
              setError(err as Error);
              setLoading(false);
            });
        });
      }
    } catch (err) {
      console.error(`Error setting up ${collectionPath} listener:`, err);
      setError(err as Error);
      setLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, [collectionPath, constraintsKey, disabled, realtime, transformer]);

  return { data, loading, error };
}

/**
 * Generic hook for subscribing to a single Firestore document with real-time updates
 */
export function useFirestoreDocument<T>({
  collectionPath,
  documentId,
  transformer = defaultTransformer,
  realtime = true,
}: UseFirestoreDocumentOptions<T>): FirestoreResult<T | null> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!documentId);
  const [error, setError] = useState<Error | null>(null);
  const lastUpdateId = useRef(0);

  useEffect(() => {
    if (!documentId || !collectionPath) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: Unsubscribe = () => {};

    try {
      const docRef: DocumentReference<DocumentData> = doc(db, collectionPath, documentId);

      const handleDocSnap = async (docSnap: any) => {
        const updateId = ++lastUpdateId.current;
        if (docSnap.exists()) {
          try {
            const transformed = await transformer(docSnap.id, docSnap.data());
            if (updateId === lastUpdateId.current) {
              setData(transformed as T);
              setLoading(false);
            }
          } catch (err) {
            if (updateId === lastUpdateId.current) {
              console.error(`Error transforming doc ${collectionPath}/${documentId}:`, err);
              setError(err as Error);
              setLoading(false);
            }
          }
        } else {
          if (updateId === lastUpdateId.current) {
            setData(null);
            setLoading(false);
          }
        }
      };

      if (realtime) {
        unsubscribe = onSnapshot(
          docRef,
          (docSnap) => {
            handleDocSnap(docSnap);
          },
          (err) => {
            console.error(`Error fetching ${collectionPath}/${documentId}:`, err);
            setError(err as Error);
            setLoading(false);
          }
        );
      } else {
        // One-time fetch
        import('firebase/firestore').then(({ getDoc }) => {
          getDoc(docRef)
            .then((docSnap) => {
              handleDocSnap(docSnap);
            })
            .catch((err) => {
              console.error(`Error fetching ${collectionPath}/${documentId}:`, err);
              setError(err as Error);
              setLoading(false);
            });
        });
      }
    } catch (err) {
      console.error(`Error setting up ${collectionPath}/${documentId} listener:`, err);
      setError(err as Error);
      setLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, [collectionPath, documentId, realtime, transformer]);

  return { data, loading, error };
}

/**
 * Helper hook to create a stable transformer function
 */
export function useFirestoreTransformer<T>(
  fn: (id: string, data: DocumentData) => T | Promise<T>,
  deps: React.DependencyList
): (id: string, data: DocumentData) => T | Promise<T> {
  return useCallback(fn, deps);
}
