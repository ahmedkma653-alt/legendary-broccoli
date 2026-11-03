<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Gambi data/state lives in src/lib/gambi.ts + src/data/events.ts using localStorage only (keys gambi_user, gambi_custom_items); no backend by product choice.
- Leaflet is imported dynamically inside MapView effects so SSR never touches window; tiles are free OpenStreetMap darkened via CSS filter.
- Account edits and notification preferences/read IDs are stored in gambi_user; notifications are derived from the existing catalog in a browser-safe module so no backend or push delivery is implied.

- AI recommendations live in src/lib/recommend.functions.ts (createServerFn + @lovable.dev/ai-gateway, model openai/gpt-6-astra) with a distance-based fallback when the gateway fails; the UI is src/routes/recommend.tsx.
