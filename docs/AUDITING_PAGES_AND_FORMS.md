# Auditing pages and forms

Every request to a page in this app is audited to HMPPS Audit, following the
[HMPPS Audit event standard](https://github.com/ministryofjustice/hmpps-audit-api): each action sends an `_ATTEMPT`
event, then one `_SUCCESS` or `_FAILURE` event, with the same `correlationId` and `operationId`.

This guide shows how to add a page or a form so it is audited correctly. To test auditing, see
[AUDIT_LOCAL_TESTING.md](AUDIT_LOCAL_TESTING.md).

---

## How it works

| Piece | File | What it does |
|---|---|---|
| `PageHandler` | `server/routes/interfaces/pageHandler.ts` | A page: its `PAGE_NAME`, `GET`, and optionally a form (`POST`) and how that form is audited (`POST_AUDIT`) |
| `route()` | `server/routes/pageRoute.ts` | Adds a page so every view and form submission is audited, including requests its guards reject |
| `auditMiddleware` | `server/middleware/auditMiddleware.ts` | Sends the attempt, then the outcome when the response ends |
| `AuditService` | `server/services/auditService.ts` | Sends `<ACTION>_<TARGET>_<OUTCOME>` to the staff or prisoner audit queue |

Every event has:

| Field | Value |
|---|---|
| `who` | The user's username. For prisoners, Launchpad sets this to the `sub` of their ID token, expected to be their prisoner number |
| `what` | `<ACTION>_<TARGET>_<OUTCOME>`, e.g. `VIEW_CANTEEN_LANDING_ATTEMPT`, `CREATE_ORDER_SUCCESS` |
| `subjectId`, `subjectType` | Who or what the action is about (see [Choosing the subject](#choosing-the-subject)) |
| `correlationId` | The request ID, the same for the attempt and the outcome |
| `operationId` | The Application Insights operation ID, when Application Insights is running |
| `details` | Optional, e.g. search parameters, changes, and `failureReason` on failure |
| `service`, `when` | Added by the audit client |

The outcome is SUCCESS when the response ends with HTTP 2xx or 3xx (e.g. a page, or a redirect after a form), and
FAILURE for an error, a 4xx or 5xx response (e.g. a validation error or a guard rejecting the request), or a closed
connection.

> **Every page must be added with `route()`.** `server/routes/index.test.ts` fails for a page added any other way, and
> `route()` refuses a page with a `POST` but no `POST_AUDIT`.

---

## Adding a page

1. Add the page name to the `Page` enum in `server/services/auditService.ts`, e.g. `ORDER_HISTORY = 'ORDER_HISTORY'`.
2. Create the handler:
   ```ts
   export default class OrderHistoryHandler implements PageHandler {
     public PAGE_NAME = Page.ORDER_HISTORY

     GET = async (req: Request, res: Response) => {
       res.render('pages/order-history', { ... })
     }
   }
   ```
3. Add it in `server/routes/index.ts`, with any guards after the handler:
   ```ts
   route('/orders', new OrderHistoryHandler(orderService), requirePortal('prisoner'))
   ```

Each view is audited as `VIEW_ORDER_HISTORY_ATTEMPT`, then `VIEW_ORDER_HISTORY_SUCCESS` or `_FAILURE`.

---

## Choosing the subject

The subject is who or what the action is about. By default:

| User | Subject |
|---|---|
| Prisoner | Themselves: their username (`PRISONER_ID`), as prisoners only see their own data |
| Staff | `NONE` (`NOT_APPLICABLE`), as staff pages show no personal data by default |

When a page shows someone else's data, give its subject with `auditSubject`. For example, a staff page showing a
prisoner's orders:

```ts
auditSubject = (req: Request) => ({ subjectId: req.params.prisonerNumber, subjectType: SubjectType.PRISONER_ID })
```

Use the subject types in `SubjectType`: `PRISONER_ID`, `CRN`, `SEARCH_TERM`, `USER_ID` (another staff member's
username), `NOT_APPLICABLE`, `NOMINAL_ID` or `REPORT_ID`.

---

## Adding a form: create, edit, delete or search

Give the page a `POST` and a `POST_AUDIT` saying what the submission does. `target` names what it acts on, in
`UPPER_SNAKE_CASE`, and becomes part of the event name.

### Create

```ts
POST_AUDIT = { action: AuditAction.CREATE, target: 'ORDER' }
```

Audited as `CREATE_ORDER_ATTEMPT`, then `CREATE_ORDER_SUCCESS` or `_FAILURE`.

### Edit

Include the entity edited and the fields changed. Only include old and new values for single-value fields, not free
text.

```ts
POST_AUDIT = {
  action: AuditAction.EDIT,
  target: 'ORDER',
  details: (req: Request) => ({
    entityId: req.params.orderId,
    changes: [{ field: 'quantity', newValue: req.body.quantity }],
  }),
}
```

To add the old value, set it in the handler before responding: `res.locals.auditDetails = { changes: [...] }`.

### Delete

```ts
POST_AUDIT = {
  action: AuditAction.DELETE,
  target: 'ORDER',
  details: (req: Request) => ({ entityId: req.params.orderId }),
}
```

### Search

A search is about the search term, with the other search parameters in the details. The handler adds the results to
the outcome:

```ts
POST_AUDIT = {
  action: AuditAction.SEARCH,
  target: 'PRODUCT',
  subject: (req: Request) => ({ subjectId: req.body.term, subjectType: SubjectType.SEARCH_TERM }),
  details: (req: Request) => ({ queryParams: { category: req.body.category } }),
}

POST = async (req: Request, res: Response) => {
  const products = await this.productService.search(req.body.term, req.body.category)
  res.locals.auditDetails = {
    results: { resultCount: products.length, returnedSubjectIds: products.map(product => product.id) },
  }
  res.render('pages/products', { products })
}
```

Audited as `SEARCH_PRODUCT_ATTEMPT`, then `SEARCH_PRODUCT_SUCCESS` with the results, or `_FAILURE`.

If the search redirects to a separate results page, give that page `auditSubject` returning the `SEARCH_TERM`, and set
the results in `res.locals.auditDetails` in its `GET`. Its views are then audited as
`VIEW_<RESULTS PAGE>_SUCCESS` with the results, as in the standard's `VIEW_PRISONER_SEARCH_RESULTS_SUCCESS` example.

---

## Testing

- `server/routes/pageRoute.test.ts` shows each kind of page and form, and the events it sends.
- In a handler's tests, check `auditService.logEvent` was called with the expected action, target, outcome, subject and
  details.
