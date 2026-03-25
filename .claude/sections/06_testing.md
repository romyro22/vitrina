# Testing

## Stack

- **Unit/Integration:** Vitest
- **Component:** React Testing Library + `@testing-library/jest-dom`
- **Coverage minimum:** 80%

## Structure

Tests mirror source: `src/lib/whatsapp.ts` -> `tests/lib/whatsapp.test.ts`

```
tests/
├── lib/
│   ├── whatsapp.test.ts
│   └── payload-helpers.test.ts
├── components/
│   ├── product-card.test.tsx
│   └── whatsapp-button.test.tsx
└── setup.ts
```

## Example Test

```tsx
// tests/lib/whatsapp.test.ts
import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("buildWhatsAppUrl", () => {
  it("should encode product name in WhatsApp message URL", () => {
    const url = buildWhatsAppUrl({
      whatsappNumber: "5491112345678",
      messageTemplate: "Hola! Me interesa {productName} ({price}). {url}",
      productName: "Camiseta Azul",
      price: 1500,
      currencySymbol: "$",
      url: "https://vitrina.test/products/camiseta-azul",
    });
    expect(url).toContain("https://wa.me/5491112345678");
    expect(url).toContain("Camiseta%20Azul");
  });
});
```

## Commands

```bash
npx vitest                    # Watch mode
npx vitest run                # Single run
npx vitest run --coverage     # With coverage report
```
