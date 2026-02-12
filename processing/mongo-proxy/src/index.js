/**
 * Mukoko News — MongoDB Proxy Worker
 *
 * Provides MongoDB access to the Python Worker via Service Binding.
 * Uses the official MongoDB Node.js driver with TCP socket support.
 *
 * The Python Worker calls this via: env.MONGO.fetch(request)
 * Request body: { action, collection, ...params }
 *
 * Supported actions:
 *   find, findOne, count, aggregate,
 *   insertOne, insertMany, updateOne, updateMany,
 *   deleteOne, deleteMany
 */

import { MongoClient } from "mongodb";

/** @type {MongoClient | null} */
let client = null;

/**
 * Get or create a MongoDB client.
 * Connection pooling is handled by the driver; we use maxPoolSize=1
 * because Workers have short-lived request contexts.
 */
function getClient(env) {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI, {
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
  }
  return client;
}

/** Get the database, defaulting to mukoko_news. */
function getDb(env) {
  return getClient(env).db(env.MONGODB_DATABASE || "mukoko_news");
}

export default {
  async fetch(request, env) {
    // Only accept POST with JSON body
    if (request.method !== "POST") {
      return Response.json({ error: "POST required" }, { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { action, collection, ...params } = body;

    if (!action || !collection) {
      return Response.json(
        { error: "action and collection required" },
        { status: 400 }
      );
    }

    try {
      const db = getDb(env);
      const coll = db.collection(collection);
      let result;

      switch (action) {
        // ── Read ──
        case "find": {
          const cursor = coll.find(params.filter || {});
          if (params.projection) cursor.project(params.projection);
          if (params.sort) cursor.sort(params.sort);
          if (params.skip) cursor.skip(params.skip);
          cursor.limit(params.limit ?? 20);
          const documents = await cursor.toArray();
          result = { documents };
          break;
        }

        case "findOne": {
          const doc = await coll.findOne(
            params.filter || {},
            params.projection ? { projection: params.projection } : {}
          );
          result = { document: doc };
          break;
        }

        case "count": {
          const total = await coll.countDocuments(params.filter || {});
          result = { total };
          break;
        }

        case "aggregate": {
          const docs = await coll.aggregate(params.pipeline || []).toArray();
          result = { documents: docs };
          break;
        }

        // ── Write ──
        case "insertOne": {
          const ins = await coll.insertOne(params.document);
          result = { insertedId: ins.insertedId };
          break;
        }

        case "insertMany": {
          const insMany = await coll.insertMany(params.documents || []);
          result = { insertedIds: Object.values(insMany.insertedIds) };
          break;
        }

        case "updateOne": {
          const upd = await coll.updateOne(
            params.filter || {},
            params.update || {},
            { upsert: params.upsert || false }
          );
          result = {
            matchedCount: upd.matchedCount,
            modifiedCount: upd.modifiedCount,
            upsertedId: upd.upsertedId,
          };
          break;
        }

        case "updateMany": {
          const updMany = await coll.updateMany(
            params.filter || {},
            params.update || {}
          );
          result = {
            matchedCount: updMany.matchedCount,
            modifiedCount: updMany.modifiedCount,
          };
          break;
        }

        case "deleteOne": {
          const del = await coll.deleteOne(params.filter || {});
          result = { deletedCount: del.deletedCount };
          break;
        }

        case "deleteMany": {
          const delMany = await coll.deleteMany(params.filter || {});
          result = { deletedCount: delMany.deletedCount };
          break;
        }

        default:
          return Response.json(
            { error: `Unknown action: ${action}` },
            { status: 400 }
          );
      }

      return Response.json(result);
    } catch (err) {
      console.error(`[MONGO-PROXY] ${action} on ${collection} failed:`, err);
      return Response.json(
        { error: err.message || "MongoDB operation failed" },
        { status: 500 }
      );
    }
  },
};
