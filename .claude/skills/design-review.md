# /design-review

Review the current UI components against the design system spec.

## Steps

1. Spawn the `ui-architect` agent
2. Ask it to read all files in `src/components/` and `src/styles/`
3. Check for:
   - Color tokens used correctly (no hardcoded hex values outside variables.css)
   - Canvas components cleaned up properly (requestAnimationFrame cancelled on unmount)
   - Spring physics on TunerDial within acceptable stiffness/damping range
   - Responsive layout — does it hold at 375px width?
4. Report issues with file:line references and suggest fixes
