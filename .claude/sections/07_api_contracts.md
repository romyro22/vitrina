# API Contracts

## Payload Auto-Generated APIs

Payload provides REST and GraphQL out of the box for every collection:

- **REST:** `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, etc.
- **GraphQL:** `POST /api/graphql` with introspection at `/api/graphql-playground`

## Collection Config Pattern

```ts
// src/collections/Products.ts
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  admin: { useAsTitle: "name" },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "price", type: "number", required: true },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    { name: "images", type: "upload", relationTo: "media", hasMany: true },
  ],
  hooks: {
    beforeChange: [trackPriceChanges],
  },
};
```

## Custom Endpoints

Add custom endpoints directly in collection config:

```ts
endpoints: [
  {
    path: "/featured",
    method: "get",
    handler: async (req) => {
      const products = await req.payload.find({
        collection: "products",
        where: { featured: { equals: true } },
        limit: 10,
      });
      return Response.json(products);
    },
  },
],
```

## Data Fetching (Server Components)

Always use `payload.find()` / `payload.findByID()` directly in server components — never fetch from the REST API internally.
