import { GoogleAuth } from "google-auth-library";

// Helper to convert standard JS objects to Firestore REST format
export function toFirestoreDocument(data: Record<string, any>) {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === "string") {
      fields[key] = { stringValue: value };
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: value.toString() };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
      // Basic array support (assuming strings for simplicity, expand if needed)
      fields[key] = {
        arrayValue: {
          values: value.map(v => ({ stringValue: String(v) }))
        }
      };
    } else if (typeof value === "object") {
       fields[key] = { mapValue: { fields: toFirestoreDocument(value).fields } };
    }
  }
  return { fields };
}

// Helper to convert Firestore REST format back to standard JS objects
export function fromFirestoreDocument(document: any) {
  if (!document || !document.fields) return null;
  const result: Record<string, any> = {};
  
  const parseValue = (val: any): any => {
    if (val.stringValue !== undefined) return val.stringValue;
    if (val.integerValue !== undefined) return parseInt(val.integerValue, 10);
    if (val.doubleValue !== undefined) return parseFloat(val.doubleValue);
    if (val.booleanValue !== undefined) return val.booleanValue;
    if (val.timestampValue !== undefined) return new Date(val.timestampValue);
    if (val.nullValue !== undefined) return null;
    if (val.mapValue !== undefined) {
      const nested: Record<string, any> = {};
      for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
        nested[k] = parseValue(v);
      }
      return nested;
    }
    return val;
  };

  for (const [key, value] of Object.entries(document.fields)) {
    result[key] = parseValue(value);
  }
  return result;
}

// Get an OAuth2 token for Firestore REST API
export async function getFirestoreToken() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY");
  }

  const credentials = JSON.parse(serviceAccountJson);
  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/datastore"],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

export async function restSetDocument(collection: string, docId: string, data: Record<string, any>) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const token = await getFirestoreToken();
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  
  const response = await fetch(url, {
    method: "PATCH", // PATCH creates or updates the document
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toFirestoreDocument(data)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore REST API Error: ${errorText}`);
  }
  return await response.json();
}

export async function restAddDocument(collection: string, data: Record<string, any>) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const token = await getFirestoreToken();
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toFirestoreDocument(data)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore REST API Error: ${errorText}`);
  }
  return await response.json();
}

export async function restGetDocument(collection: string, docId: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const token = await getFirestoreToken();
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) return null;
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore REST API Error: ${errorText}`);
  }
  
  const data = await response.json();
  return fromFirestoreDocument(data);
}
