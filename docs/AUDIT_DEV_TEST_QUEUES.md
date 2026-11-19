# Sending audit events to the real HMPPS audit queues (dev and test)

This guide covers, step by step, what is needed for the UI deployed in the `dev` (and `test`) cluster namespaces to
send audit events to the real HMPPS audit queues, and how to check that it works for a prisoner and a staff user.

To test against fake queues on your laptop instead, see [AUDIT_LOCAL_TESTING.md](AUDIT_LOCAL_TESTING.md).

---

## How it works in the cluster

```
 Browser ──▶ hmpps-digital-canteen-ui pod (service account: hmpps-digital-canteen-ui)
               │
               ├── prisoner page views ──▶ Digital-Prison-Services-dev-hmpps_prisoner_audit_queue
               └── staff page views ─────▶ Digital-Prison-Services-dev-hmpps_audit_queue
                                              (both owned by the hmpps-audit-dev namespace)
```

- **Queue URLs** come from two Kubernetes secrets, loaded by `namespace_secrets` in
  `helm_deploy/hmpps-digital-canteen-ui/values.yaml`:

  | Secret | Created by | Becomes |
  |---|---|---|
  | `sqs-hmpps-audit-secret` | the `hmpps-audit-dev` namespace | `AUDIT_SQS_QUEUE_URL` (staff) |
  | `sqs-hmpps-prisoner-audit-secret` | the canteen namespace | `AUDIT_PRISONER_SQS_QUEUE_URL` (prisoner) |

- **Write access** comes from IRSA. The pod runs as the `hmpps-digital-canteen-ui` service account, which is linked
  to an AWS role allowed to send to both queues. No AWS keys are used.
- **The test environment uses the dev audit queues**, as there is no test audit environment.
- The app can only write to the queues. The HMPPS Audit service reads them.

---

## Prerequisites

### 1. Cloud Platform changes (`cloud-platform-environments`)

All are from CRC-828. Each namespace needs them before the CRC-828 UI change is deployed to it:

| Branch | Change | Creates |
|---|---|---|
| `CRC-828-hmpps-audit-dev-staff-audit-secret-for-canteen-dev-and-test` | Adds `hmpps-digital-canteen-dev` and `hmpps-digital-canteen-test` to `hmpps-audit-dev/resources/audit-namespaces-secrets.tf` | `sqs-hmpps-audit-secret` in both namespaces |
| `CRC-828-hmpps-digital-canteen-dev-irsa-audit-queues-and-prisoner-secret` | `hmpps-digital-canteen-dev/resources/irsa.tf` and `hmpps-prisoner-audit-queue.tf` | The `hmpps-digital-canteen-ui` service account with access to both queues, and `sqs-hmpps-prisoner-audit-secret` |
| `CRC-828-hmpps-digital-canteen-test-irsa-audit-queues-and-prisoner-secret` | The same for `hmpps-digital-canteen-test` | The same, in test |

`CRC-828-canteen-namespace-and-audit-permissions` contains the changes for all environments in one branch. Use either
it or the per-environment branches, not both.

> **Status, checked 9 November 2026:** none of these changes were on the `cloud-platform-environments` `main`
> branch, and neither `hmpps-digital-canteen-dev` nor `hmpps-digital-canteen-test` had the service account or either
> secret. Run [step 1](#step-1-check-the-cloud-platform-resources-exist) to see the current state. If the resources
> are still missing, check with the Cloud Platform and HMPPS Audit teams that the PRs have been merged and applied.

### 2. This UI change

The CRC-828 PR in `hmpps-digital-canteen-ui`. It sets the service account and loads both audit secrets.

### 3. Access

| What | Why |
|---|---|
| `kubectl` connected to Cloud Platform, with access to `hmpps-digital-canteen-dev` (and `-test`) | To check the resources, pod and logs. |
| Permission to run GitHub Actions in `hmpps-digital-canteen-ui` | To deploy the PR. |
| A DPS dev (HMPPS Auth) account | To view the staff page. Any signed-in staff user can view it. |
| A dev Launchpad prisoner account at a prison active in dev (`server/constants/activeAgencies.ts`) | To view the prisoner page. |

---

## Step 1: Check the Cloud Platform resources exist

```bash
NS=hmpps-digital-canteen-dev   # or hmpps-digital-canteen-test

kubectl -n $NS get serviceaccount hmpps-digital-canteen-ui \
  -o jsonpath='{.metadata.annotations.eks\.amazonaws\.com/role-arn}{"\n"}'
kubectl -n $NS get secret sqs-hmpps-audit-secret sqs-hmpps-prisoner-audit-secret
```

The first command should print an IAM role ARN, and the second should list both secrets.

> **Don't deploy until all three exist.** The UI change requires the service account and both secrets. Without them
> the pods won't start, even with auditing turned off.

---

## Step 2: Turn auditing on

Auditing is off in every environment by default. In `helm_deploy/values-dev.yaml` (and `values-test.yaml` for test):

```yaml
    AUDIT_ENABLED: "true"
```

Nothing else is needed. The queue URLs come from the secrets.

---

## Step 3: Deploy

Use one of these:

- **Deploy the PR** (no merge needed): in GitHub, go to **Actions → Deploy PR to dev / test → Run workflow**, choose
  `dev` (or `test`), and enter the PR number. This replaces what is deployed in that environment, so tell the team.
- **Merge the PR**: the pipeline deploys `main` to dev and test. Merge only once
  [step 1](#step-1-check-the-cloud-platform-resources-exist) passes for **every** environment the pipeline deploys
  to, including preprod and prod, or the deployment fails there.

---

## Step 4: Check the deployed pod

```bash
kubectl -n $NS rollout status deploy/hmpps-digital-canteen-ui

# Expect: hmpps-digital-canteen-ui
kubectl -n $NS get deploy hmpps-digital-canteen-ui -o jsonpath='{.spec.template.spec.serviceAccountName}{"\n"}'

# Expect AUDIT_ENABLED=true and both queue URLs
kubectl -n $NS exec deploy/hmpps-digital-canteen-ui -- printenv | grep '^AUDIT_'
```

---

## Step 5: Watch the audit sends

In a separate terminal:

```bash
kubectl -n $NS logs -f deploy/hmpps-digital-canteen-ui | grep --line-buffered 'HMPPS Audit SQS'
```

---

## Step 6: Send a staff audit event

1. Open https://staff.digital-canteen-ui-dev.hmpps.service.justice.gov.uk/staff-canteen
   (test: `staff.digital-canteen-ui-test.hmpps.service.justice.gov.uk`).
2. Sign in with your DPS dev account.
3. The log shows two lines: `HMPPS Audit SQS message sent (<message id>)`.

These are `VIEW_STAFF_CANTEEN_LANDING_ATTEMPT` and `VIEW_STAFF_CANTEEN_LANDING_SUCCESS`, sent to the **staff** queue
with `who` = your username.

---

## Step 7: Send a prisoner audit event

1. Sign in to Launchpad dev (https://launchpad-home-dev.hmpps.service.justice.gov.uk/) as the dev prisoner.
2. Open https://digital-canteen-ui-dev.hmpps.service.justice.gov.uk/canteen
   (test: `digital-canteen-ui-test.hmpps.service.justice.gov.uk`).
3. The log shows two more `HMPPS Audit SQS message sent (<message id>)` lines.

These are `VIEW_CANTEEN_LANDING_ATTEMPT` and `VIEW_CANTEEN_LANDING_SUCCESS`, sent to the **prisoner** queue with
`who` and `subjectId` = the prisoner's username.

> **Check this value.** Launchpad sets a prisoner's username to the `sub` of their ID token. The audit standard needs
> the NOMIS prisoner number (e.g. `A1234BC`) for `PRISONER_ID` subjects. Confirm the `who` of these events is the
> prisoner number, by asking the HMPPS Audit team or checking the Launchpad token, before switching auditing on in
> preprod or prod.

---

## Step 8: Confirm the events were stored

Note the message IDs from the logs. The app can't read the queues, so ask the HMPPS Audit team, or use the
hmpps-audit-api query endpoints if you have access, to find events with `service` = `hmpps-digital-canteen-ui`, for
your username (staff) and the prisoner number (prisoner).

---

## If something goes wrong

| What you see | Cause | Fix |
|---|---|---|
| Pod stuck in `CreateContainerConfigError` | A secret is missing. | Step 1. |
| Pod not created, service account not found | The IRSA change isn't applied. | Step 1. |
| `Error sending HMPPS Audit SQS message` with `AccessDenied` | The IRSA role can't send to the queue, or the pod isn't using the service account. | Step 1 and step 4. Ask Cloud Platform to check the IRSA policies. |
| No `HMPPS Audit SQS` log lines | `AUDIT_ENABLED` isn't `"true"` in the deployed values. | Step 2, then redeploy. |
| Prisoner sees "access denied" (403) | The prisoner's prison isn't active in that environment. | Use a prisoner at a prison in `server/constants/activeAgencies.ts`. |
| `/staff-canteen` returns 404 | It was opened on the prisoner host. | Use the `staff.` host. |

---

## Turning it off

Set `AUDIT_ENABLED: "false"` in the environment's values file and redeploy. The service account and secrets can stay.
