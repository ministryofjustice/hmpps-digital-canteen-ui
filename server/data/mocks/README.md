# Mock API responses

Every Digital Canteen API endpoint the UI calls has a mock here, in
[`digitalCanteenApiMocks.ts`](digitalCanteenApiMocks.ts), that returns the same shape of response as the real API.

## The rule

- **UI-only ticket** (the real endpoint doesn't exist yet): add the endpoint's method to `DigitalCanteenApiClient`
  and its mock here, with `realEndpointReady: false`.
- **Integration ticket** (the real endpoint is in dev): check the mock exists and matches the real endpoint's
  responses, add or fix it if not, then set `realEndpointReady: true`.

The unit tests fail if an endpoint has no mock. `npm run typecheck` (run by the pre-commit hook) fails if a mock's
arguments or response don't match the real method's types.

## Which is used: the mock or the real endpoint

| | `realEndpointReady: true` | `realEndpointReady: false` |
|---|---|---|
| `MOCK_API=false` (the default): dev, test, and your machine | Real endpoint | Mock |
| `MOCK_API=true`: your machine, e.g. offline or for a demo | Mock | Mock |
| Anywhere else (preprod, prod, or any other environment): always | Real endpoint | Real endpoint |

So in dev, QA test UI-only features with mock data, and integrated features with the real API, at the same time,
with no configuration. When an integration ticket sets `realEndpointReady: true`, dev starts using the real endpoint.

Mocks are only used where `ENVIRONMENT_NAME` is `DEV` or `TEST`, or locally (no `ENVIRONMENT_NAME`, and not a
production build). Anywhere else, including preprod, prod, and a deployment missing `ENVIRONMENT_NAME`, mocks are never
used, and the app won't start if `MOCK_API=true` (see `mockSettings` in [`server/config.ts`](../../config.ts)). A
feature whose real endpoint isn't ready doesn't work there: e.g. the canteen page shows "Products can't be shown at the
moment".

When mocks are used, the app logs which, e.g. `Using mock API responses for: getProductCategories, getProducts`.

## Files

| File | What it is |
|---|---|
| `digitalCanteenApiMocks.ts` | A mock of every endpoint, and whether its real endpoint is ready |
| `withMocks.ts` | Replaces the real client's methods with mocks, as above |
| `data/catalogue.json` | The product catalogue from the UCD designs: 13 categories, 159 products. Allergens must be from the 14 UK food allergens |
| `data/basket.json` | A basket of products from the catalogue |

Route tests use these mocks too (`server/routes/canteen-home-page.test.ts`), so tests, local development and dev
show the same data.
