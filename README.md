# JAGENT — Website

Static site + Pages worker for https://jagent.pages.dev (source of truth for the sale page, `agent.json`, `llms.txt`, and NFT metadata/images).

- `index.html` — sale page (reads sale status live from the NFT contract)
- `agent.json` / `llms.txt` — machine-readable mint instructions for agents
- `_worker.js` — serves `/metadata/<tokenId>` (deterministic jacket assignment from a frozen image pool) and `/img/<tokenId>.svg` (jacket image with BNB logo on the chest + "JAGENT" + "#<tokenId>" overlay)
- `img/pool-*.jpg` — jacket artwork pool (frozen before the sale opens; never changed after the first mint)

Contracts: https://github.com/JACKETAGENT-ID/jagent-contracts
