import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mengonversi dokumen MongoDB/BSON rekursif menjadi 100% Plain JavaScript Object.
 * Mengonversi ObjectId ke string, Date ke ISO string, membersihkan method .toJSON(),
 * dan menjamin keselarasan id dan _id sebagai string murni untuk React Server Components boundary.
 */
export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle BSON ObjectId
  if (
    typeof data === "object" &&
    data !== null &&
    (
      (data as any)._bsontype === "ObjectId" ||
      (data as any)._bsontype === "ObjectID" ||
      (data.constructor && data.constructor.name === "ObjectId") ||
      (typeof (data as any).toHexString === "function")
    )
  ) {
    return (data as any).toString() as unknown as T;
  }

  // Handle Date
  if (data instanceof Date) {
    return (isNaN(data.getTime()) ? data.toString() : data.toISOString()) as unknown as T;
  }

  // Handle Array
  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item)) as unknown as T;
  }

  // Handle Object
  if (typeof data === "object" && data !== null) {
    let targetObj: Record<string, any> = data as Record<string, any>;
    if (typeof targetObj.toObject === "function") {
      targetObj = targetObj.toObject();
    }

    const plainObj: Record<string, any> = {};

    for (const key of Object.keys(targetObj)) {
      if (key === "__v") continue; // Abaikan field internal version Mongoose

      const val = targetObj[key];

      if (key === "_id" && val !== undefined) {
        const idStr = val ? (typeof val === "object" && val.toString ? val.toString() : String(val)) : "";
        plainObj._id = idStr;
        if (!plainObj.id && !targetObj.id) {
          plainObj.id = idStr;
        }
      } else {
        plainObj[key] = serializeData(val);
      }
    }

    // Pastikan jika _id ada dan id belum ada, id diisi _id
    if (plainObj._id && !plainObj.id) {
      plainObj.id = plainObj._id;
    }

    return plainObj as T;
  }

  // Primitives (string, number, boolean, dll)
  return data;
}
