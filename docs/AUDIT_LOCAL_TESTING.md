# Testing the HMPPS audit integration locally

This guide covers how to:

1. run fake SQS audit queues on your laptop (ElasticMQ),
2. point the UI at them,
3. run the end-to-end scenario for both audited user groups (prisoner and staff),
4. read the audit messages, and
5. switch to the real HMPPS audit queues.

Run the commands in this guide from the repository root.

> **Never commit secrets.** `.env` is git-ignored. Keep real values only there.

---

## How auditing works

The UI writes audit events straight onto an HMPPS audit SQS queue. There is one queue per audited user group:

| User group | Signs in with | Audited as (`who`) | Queue setting |
|---|---|---|---|
| Prisoner | Launchpad (prisoner portal, `localhost:3000`) | Username: the `sub` of their Launchpad ID token, expected to be their prisoner number | `AUDIT_PRISONER_SQS_QUEUE_URL` |
| Staff | HMPPS Auth (staff portal, `staff.localhost:3000`) | Username | `AUDIT_SQS_QUEUE_URL` |

Every page is a `PageHandler` (`server/routes/interfaces/pageHandler.ts`) that declares its `PAGE_NAME`. Pages are
added with the `route()` helper in `server/routes/index.ts`, which wraps the page and its guards in `auditMiddleware`.
For each page view it sends:

| Event (`what`) | When |
|---|---|
| `VIEW_<PAGE_NAME>_ATTEMPT` | Before the page's guards and handler run |
| `VIEW_<PAGE_NAME>_SUCCESS` | The response ended with HTTP 2xx or 3xx |
| `VIEW_<PAGE_NAME>_FAILURE` | The page or a guard failed with an error, the response ended with HTTP 4xx or 5xx, or the connection closed first. `details.failureReason` says why |

`server/routes/index.test.ts` fails if a page is added without `route()`, so new pages are always audited. Form
submissions (searches, creates, edits and deletes) are audited the same way: see
[AUDITING_PAGES_AND_FORMS.md](AUDITING_PAGES_AND_FORMS.md).

- Prisoner events have `subjectId` = their username and `subjectType` = `PRISONER_ID`. Staff pages show no
  personal data, so staff events have `subjectId` = `NONE` and `subjectType` = `NOT_APPLICABLE`.
- Requests rejected by a route guard (e.g. `requirePortal('staff')`) are audited as an attempt and a failure.
- If the queue can't be reached, the error is logged and the user still gets the page.
- `operationId` (the Application Insights trace ID) is only set when Application Insights is running, so it isn't
  present locally.

---

## What you need

| Item | Why |
|---|---|
| Node.js 24 (`nvm use 24`) | The project requires it. |
| Docker Desktop, running | For the fake SQS queues. |
| AWS CLI (`brew install awscli`) | To read the fake queues. |

---

## Step 1: Start the fake audit queues

```bash
docker compose -f docker-compose-audit.yml up -d
```

This starts ElasticMQ, which creates both queues from `elasticmq/elasticmq.conf`. Check they exist:

```bash
export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=eu-west-2

aws --endpoint-url http://localhost:9324 sqs list-queues
```

You should see:

```
http://localhost:9324/000000000000/hmpps-audit-queue
http://localhost:9324/000000000000/hmpps-prisoner-audit-queue
```

ElasticMQ keeps messages in memory. Restarting the container empties the queues, but recreates them.
There is also a queue statistics page at http://localhost:9325.

> **Why not LocalStack?** Newer LocalStack versions need an account token, and exit on startup without one.

---

## Step 2: Update `.env`

If you don't have a `.env`, copy `.env.example` to `.env`. Then add, or uncomment:

```
# Local audit queues (ElasticMQ)
AUDIT_ENABLED=true
AUDIT_SQS_QUEUE_URL=http://localhost:9324/000000000000/hmpps-audit-queue
AUDIT_PRISONER_SQS_QUEUE_URL=http://localhost:9324/000000000000/hmpps-prisoner-audit-queue
AUDIT_SERVICE_NAME=hmpps-digital-canteen-ui
AUDIT_SQS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# Prisons where the prisoner portal is active (server/constants/activeAgencies.ts)
ENVIRONMENT_NAME=DEV
```

| Setting | Meaning |
|---|---|
| `AUDIT_ENABLED=true` | Turns auditing on. Without it nothing is sent. |
| `AUDIT_SQS_QUEUE_URL` | Staff audit queue. |
| `AUDIT_PRISONER_SQS_QUEUE_URL` | Prisoner audit queue. |
| `AUDIT_SERVICE_NAME` | Sent as `service` in each message. |
| `AUDIT_SQS_REGION` | Required by the AWS SDK. Any value works locally. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Dummy keys. The AWS SDK won't send without some. The SDK uses the queue URL's host, so messages go to ElasticMQ, not AWS. |
| `ENVIRONMENT_NAME=DEV` | Without it no prison is active, and the prisoner portal returns "access denied" (403) before the page is audited. |

---

## Step 3: Start the UI

The quickest way to test both portals is to bypass sign-in. This signs you in as a fake prisoner (`G3682UE`,
Cookham Wood) on the prisoner portal and a fake staff user (`DEV_STAFF`) on the staff portal:

```bash
nvm use 24
npm run setup        # first time, or after pulling changes
BYPASS_AUTH=true npm run start:dev
```

Wait for `Server listening on port 3000`. The UI reads `.env` only when it starts, so restart it after changing `.env`.

### Signing in for real instead

Leave out `BYPASS_AUTH` and set the dev client credentials in `.env`. They are in Kubernetes secrets in the
`hmpps-digital-canteen-dev` namespace (secret names from `namespace_secrets` in
`helm_deploy/hmpps-digital-canteen-ui/values.yaml`):

| Secret | Keys | Used for |
|---|---|---|
| `hmpps-digital-canteen-ui-auth-code` | `AUTH_CODE_CLIENT_ID`, `AUTH_CODE_CLIENT_SECRET` | Staff sign-in (HMPPS Auth) |
| `hmpps-digital-canteen-ui-client-creds` | `CLIENT_CREDS_CLIENT_ID`, `CLIENT_CREDS_CLIENT_SECRET` | Calling backend APIs |
| `launchpad-secrets` | `LAUNCHPAD_API_CLIENT_ID`, `LAUNCHPAD_API_CLIENT_SECRET` | Prisoner sign-in (Launchpad) |

This prints them as `.env` lines:

```bash
for s in hmpps-digital-canteen-ui-auth-code hmpps-digital-canteen-ui-client-creds launchpad-secrets; do
  kubectl -n hmpps-digital-canteen-dev get secret "$s" -o json \
    | jq -r '.data | to_entries[] | "\(.key)=\(.value | @base64d)"'
done
```

Then sign in with a DPS dev account on the staff portal, or a dev Launchpad prisoner on the prisoner portal. The
audited `who` is then your real username or prisoner number.

---

## Step 4: Run the end-to-end scenario

### 4a. Empty the queues

```bash
export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=eu-west-2

for q in hmpps-audit-queue hmpps-prisoner-audit-queue; do
  aws --endpoint-url http://localhost:9324 sqs purge-queue --queue-url http://localhost:9324/000000000000/$q
done
```

### 4b. View a page as a prisoner and as staff

Open these in a browser, or use curl:

```bash
curl -s -o /dev/null -w "prisoner: %{http_code}\n" http://localhost:3000/canteen
curl -s -o /dev/null -w "staff:    %{http_code}\n" http://staff.localhost:3000/staff-canteen
```

Both should return `200`. The UI logs `HMPPS Audit SQS message sent (<id>)` four times: an attempt and a success for each page.

### 4c. Read both queues

```bash
for q in hmpps-prisoner-audit-queue hmpps-audit-queue; do
  echo "== $q"
  aws --endpoint-url http://localhost:9324 sqs receive-message \
    --queue-url http://localhost:9324/000000000000/$q \
    --max-number-of-messages 10 --visibility-timeout 0 \
    --query 'Messages[].Body' --output text | tr '\t' '\n'
done
```

`--visibility-timeout 0` leaves the messages on the queue, so you can read them again.

### 4d. Check the results

Expected output (from a real run, 9 Nov 2026):

```
== hmpps-prisoner-audit-queue
{"who":"G3682UE","subjectId":"G3682UE","subjectType":"PRISONER_ID","correlationId":"74b0967e-…","what":"VIEW_CANTEEN_LANDING_ATTEMPT","service":"hmpps-digital-canteen-ui","when":"2026-11-09T14:47:08.528Z"}
{"who":"G3682UE","subjectId":"G3682UE","subjectType":"PRISONER_ID","correlationId":"74b0967e-…","what":"VIEW_CANTEEN_LANDING_SUCCESS","service":"hmpps-digital-canteen-ui","when":"2026-11-09T14:47:08.572Z"}
== hmpps-audit-queue
{"who":"DEV_STAFF","subjectId":"NONE","subjectType":"NOT_APPLICABLE","correlationId":"b852d3d7-…","what":"VIEW_STAFF_CANTEEN_LANDING_ATTEMPT","service":"hmpps-digital-canteen-ui","when":"2026-11-09T14:47:08.591Z"}
{"who":"DEV_STAFF","subjectId":"NONE","subjectType":"NOT_APPLICABLE","correlationId":"b852d3d7-…","what":"VIEW_STAFF_CANTEEN_LANDING_SUCCESS","service":"hmpps-digital-canteen-ui","when":"2026-11-09T14:47:08.614Z"}
```

Check that:

- [ ] prisoner events are only on the prisoner queue, and staff events only on the staff queue
- [ ] `who` is the username: the prisoner number for the prisoner, never their name
- [ ] each page view has an `_ATTEMPT` followed by a `_SUCCESS`, with the same `correlationId`
- [ ] `service` is `hmpps-digital-canteen-ui`

### 4e. Optional: the user isn't blocked when the queue is down

```bash
docker stop digital-canteen-ui-elasticmq
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/canteen    # still 200
docker start digital-canteen-ui-elasticmq
```

The UI logs `Error sending HMPPS Audit SQS message` for the attempt and the success, but still returns the page.

### 4f. Optional: a request rejected by a guard is audited as a failure

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/staff-canteen   # 404: staff page on the prisoner portal
```

The prisoner queue gets `VIEW_STAFF_CANTEEN_LANDING_ATTEMPT` then `VIEW_STAFF_CANTEEN_LANDING_FAILURE`, with
`failureReason` = `Responded with HTTP 404`.

---

## Step 5: Switch to the real HMPPS audit queues

The real queues can't be reached from a laptop. The app writes to them through IRSA, an AWS role on the
`hmpps-digital-canteen-ui` service account, which only works inside the cluster. So the switch is made by deploying.
See [AUDIT_DEV_TEST_QUEUES.md](AUDIT_DEV_TEST_QUEUES.md) for the prerequisites and steps.

### Switching back to local

Locally, the `.env` queue URLs decide where messages go. Set `AUDIT_ENABLED=false` (or remove the audit lines) to
turn local auditing off.

---

## If something goes wrong

| What you see | Cause | Fix |
|---|---|---|
| The page loads but there's no `message sent` line | `AUDIT_ENABLED` isn't `true`, or the UI wasn't restarted. | Step 2, then restart. |
| `Error sending HMPPS Audit SQS message` | ElasticMQ isn't running, or a queue URL is wrong. | `docker ps` should show `digital-canteen-ui-elasticmq`. Check the URLs against `list-queues`. |
| Prisoner portal shows "access denied" (403) | `ENVIRONMENT_NAME` isn't set, so no prison is active. | Step 2. |
| AWS CLI: `Could not connect to the endpoint URL` | ElasticMQ isn't running, or the wrong port. | Use port **9324**. |
| Log line: `QueueUrl=… differs from SQSClient resolved endpoint` | Normal locally. The SDK sends to the queue URL's host. | None. |
| `staff.localhost` doesn't resolve | Some tools don't resolve `*.localhost`. | Use a browser or curl, or add `127.0.0.1 staff.localhost` to `/etc/hosts`. |

---

## Stopping and cleaning up

```bash
# Ctrl+C in the terminal running the UI, then:
docker compose -f docker-compose-audit.yml down
```
