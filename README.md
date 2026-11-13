# JAGENT — 官网

https://jacketagent.pages.dev 的静态站点 + Pages Worker（发售页面、`agent.json`、`llms.txt` 与 NFT 元数据/图片的唯一来源）。

- `index.html` — 发售页面（实时从 NFT 合约读取发售状态）
- `agent.json` / `llms.txt` — 供智能体读取的机器可读铸造说明
- `_worker.js` — 提供 `/metadata/<tokenId>`（从冻结图片池按 tokenId 确定性分配夹克）与 `/img/<tokenId>.svg`（夹克图片：胸前 BNB 标志 + “JAGENT” + “#<tokenId>” 叠加层）
- `img/pool-*.jpg` — 夹克图池（发售开始前冻结；首次铸造后永不变更）

合约：https://github.com/JACKETAGENT-ID/jagent-contracts
