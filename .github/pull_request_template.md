## Summary

<!-- What does this change and why? Link the issue it resolves, e.g. "Closes #123". -->

## Screenshots

<!-- For visual changes: before/after, ideally in both themes and on mobile. -->

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run test:smoke` passes (after `npm run build`)
- [ ] Lighthouse budgets hold (accessibility 1, best practices / SEO ≥ 0.95, performance ≥ 0.9)
- [ ] Checked in light and dark themes, on mobile width and with reduced motion
- [ ] No new inline scripts/styles or third-party origins (the CSP in `public/_headers` is `'self'`-only)
- [ ] README / docs updated if behaviour or scripts changed
