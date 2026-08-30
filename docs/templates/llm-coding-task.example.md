# LLM Coding Task — Copy And Complete

Do not send this template to a coding LLM until every required field is completed or marked `not applicable`.

## 1. Task identity

- Task name: `<SHORT_NAME>`
- Requested by: `<OWNER>`
- Date: `<YYYY-MM-DD>`
- Work mode: `<A diagnosis | B Alpha local implementation | C reusable/client implementation | D production operation>`
- Target component: `<generated website | Python Blog Dashboard | Content Factory | CDN/media | shared data contract>`
- Target environment: `<local | preview | staging | production>`

## 2. Objective

`<One observable outcome. Example: “Make the English blog detail route read the legacy post schema through a typed adapter while preserving existing live URLs.”>`

## 3. Non-goals

- `<What must not be changed>`
- `<Adjacent feature that is out of scope>`

## 4. Current evidence

- Symptom or desired change: `<DETAIL>`
- Known affected URL/API: `<ROUTE>`
- Current status/result: `<HTTP STATUS, ERROR, OR OUTPUT>`
- Expected result: `<MEASURABLE RESULT>`
- Evidence timestamp: `<YYYY-MM-DD HH:MM TZ>`

## 5. Required reading

- `docs/ALPHA_ARCHITECTURE_LLM_CODING_GUIDE.md`
- `<Relevant specification/runbook>`
- `<Relevant source files>`

## 6. Authorized scope

- Files/directories allowed to change: `<PATHS>`
- Files/directories read-only: `<PATHS>`
- Remote read-only inspection allowed: `<YES/NO AND RESOURCES>`
- Remote writes allowed: `<NO by default; otherwise exact pre-approved operation>`
- Deployment allowed: `<NO by default; otherwise exact project/environment>`

## 7. Runtime contract

- Cloudflare app/Worker: `<NAME OR PLACEHOLDER>`
- Required bindings by logical role: `<DB, R2, KV, AI, EMAIL, SERVICE, ETC.>`
- Required variables: `<NON-SECRET NAMES ONLY>`
- Required secrets: `<SECRET NAMES ONLY; NEVER VALUES>`
- Compatibility date/flags policy: `<KEEP CURRENT | APPROVED CHANGE>`

## 8. Database contract

- Database role: `<Blog DB | Factory DB | other>`
- Tables/columns involved: `<EXPLICIT LIST>`
- Current schema evidence: `<MIGRATION/QUERY/ADAPTER>`
- Migration needed: `<NO | ADDITIVE MIGRATION NAME>`
- Existing rows that must be preserved: `<COUNTS/IDENTIFIERS WITHOUT PRIVATE DATA>`
- Idempotency/concurrency rule: `<RULE>`
- Backup/rollback requirement: `<LOCAL/STAGING/PRODUCTION PLAN>`

## 9. HTTP and SEO contract

| Route | Method | Auth | Expected success | Missing/invalid | Dependency failure |
|---|---|---|---|---|---|
| `<ROUTE>` | `<GET/POST/...>` | `<PUBLIC/ADMIN/...>` | `<STATUS/BODY>` | `<STATUS/BODY>` | `<500/503 CONTRACT>` |

- Canonical policy: `<VALUE OR N/A>`
- Hreflang/locale relation: `<VALUE OR N/A>`
- Sitemap/robots effect: `<VALUE OR N/A>`
- Redirect compatibility: `<OLD -> NEW OR N/A>`

## 10. Security and privacy

- Input validation: `<RULES>`
- Authentication/authorization: `<RULES>`
- CSRF/origin/rate-limit/bot control: `<RULES>`
- Sensitive values that must not be logged: `<LIST>`
- Client data isolation requirement: `<RULE>`

## 11. Acceptance criteria

- [ ] `<Observable functional criterion>`
- [ ] `<Data-integrity criterion>`
- [ ] `<Error/status criterion>`
- [ ] `<Security criterion>`
- [ ] `<SEO criterion or N/A>`
- [ ] `<No unrelated changes>`
- [ ] `<No remote mutation unless explicitly approved>`

## 12. Required verification

```powershell
<FOCUSED TEST COMMAND>
<TYPE-CHECK COMMAND>
<BUILD OR WRANGLER DRY-RUN COMMAND>
<LOCAL/PREVIEW HTTP SMOKE COMMAND>
```

Required test cases:

1. `<Happy path>`
2. `<Missing/invalid input>`
3. `<Authorization failure>`
4. `<Dependency/database failure>`
5. `<Retry/idempotency or concurrency case>`

## 13. Required LLM output

Return the handoff format from section 16 of the architecture guide. Include exact pass/fail results, all assumptions, all remaining drift, and whether remote state changed.

## 14. Production approval — normally unchecked

- [ ] I explicitly approve this exact production operation: `<COMMAND/ACTION>`
- Target: `<EXACT NON-SECRET RESOURCE AND ENVIRONMENT>`
- Expected effect: `<EFFECT>`
- Backup/rollback: `<PLAN>`
- Approval owner and timestamp: `<OWNER, YYYY-MM-DD HH:MM TZ>`

If this section is incomplete, production mutation is not authorized.
