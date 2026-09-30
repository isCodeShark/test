---
name: deploy_with_vercel
description: User deploys the wedding site using Vercel (not Surge) — use .vercel config in the project
type: feedback
---

Always deploy using Vercel, not Surge. The project has a `.vercel/project.json` config already set up.

**Why:** User preference — they have the project configured on Vercel as "rs-wedding-invitation".

**How to apply:** When asked to deploy, run `vercel --prod` from the project directory.
