# Payload CMS Collection Guide

## Step 1: Create the Collection Config

Create `src/collections/<Name>.ts` (PascalCase filename):

```typescript
import type { CollectionConfig } from "payload";

export const NewCollection: CollectionConfig = {
  slug: "new-collection",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "isActive", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value;
            if (data?.name) {
              return data.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // strip accents
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            }
            return value;
          },
        ],
      },
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
  ],
};
// Then register in src/payload.config.ts -> collections: [...]
```

## Step 2: Register in Payload Config

In `src/payload.config.ts`:

```typescript
import { Products } from "@/collections/Products";

export default buildConfig({
  collections: [
    // ... existing collections
    Products,
  ],
  // ...
});
```

## Step 3: Add Helper Functions

In `src/lib/payload-helpers.ts`:

```typescript
// Use the shared getPayloadClient() helper — never instantiate Payload directly
import { getPayloadClient } from "@/lib/payload-helpers";

export async function getNewItems(options?: { limit?: number; page?: number }) {
  const payload = await getPayloadClient();
  return payload.find({
    collection: "new-collection",
    where: { isActive: { equals: true } },
    limit: options?.limit ?? 12,
    page: options?.page ?? 1,
    sort: "-createdAt",
    depth: 2,
  });
}

export async function getNewItemBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "new-collection",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return result.docs[0] ?? null;
}
```

## Step 4: Generate Types

```bash
npm run generate:types
```

This updates `src/payload-types.ts` with the `Product` interface.

## Field Types Quick Reference

| Type | Use Case | Key Options |
|---|---|---|
| `text` | Short strings | `required`, `unique`, `maxLength` |
| `number` | Numeric values | `min`, `max`, `hasMany` |
| `richText` | Formatted content | Default Lexical editor |
| `select` | Enum/options | `options`, `hasMany` |
| `upload` | File/image | `relationTo: "media"` |
| `relationship` | FK to collection | `relationTo`, `hasMany` |
| `array` | Repeatable group | `fields`, `minRows`, `maxRows` |
| `group` | Nested object | `fields` |
| `checkbox` | Boolean | `defaultValue` |
| `date` | Date/datetime | `admin: { date: { pickerAppearance } }` |

## Hooks Reference

| Hook | Runs | Use Case |
|---|---|---|
| `beforeChange` | Before create/update | Side effects (e.g., price history tracking) |
| `afterChange` | After create/update | Cache invalidation, notifications |
| `beforeDelete` | Before delete | Cleanup related data |
| `afterRead` | After fetching | Transform data for API |

## Checklist

- [ ] Collection file created in `src/collections/` (PascalCase)
- [ ] Exported as `const <Name>: CollectionConfig`
- [ ] Registered in `payload.config.ts`
- [ ] Access control set (read public at minimum)
- [ ] Slug field with `beforeValidate` auto-generation hook (strips accents for Spanish)
- [ ] Helper functions added to `payload-helpers.ts`
- [ ] Types regenerated with `npm run generate:types`
- [ ] Admin panel tested: create, edit, list views
