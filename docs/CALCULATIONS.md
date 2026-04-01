# Portfolio Tracker — Calculation Logic

This document is the canonical reference for all financial calculations in the app. It covers what each metric means, how it is computed, and any intentional design decisions.

---

## Core Principles

- **Fees are part of cost basis.** Every fee paid (buy or sell) is considered a real spend and is folded into `avgPrice` and `invested`. There is no separate fee deduction in profit calculations — fees reduce profit implicitly by raising your cost basis.
- **Invested = deployed capital.** `invested` represents net capital currently deployed in a position, not total gross spend ever. When you sell, invested shrinks accordingly.
- **Cash is a position.** Portfolio profit % is measured against total deposits (not just invested capital), because holding cash is a deliberate allocation decision that affects overall returns.
- **Deleted holdings are kept.** When a position is fully sold, the holding is soft-deleted and retained. Its `realizedProfits` and `fees` continue to flow into portfolio-level KPIs.
- **Separate investment cycles.** Re-purchasing a previously sold ticker creates a new holding. The deleted holding preserves the history of the prior cycle.

---

## 1. Transaction-Level Calculations

### `totalValue`

> `shared/transformers/transactions.ts`

```
totalValue = shares × price + fees
```

Original gross cost of the transaction including fees. Uses original `shares` (not `actualShares`).

---

### `actualValue`

> `shared/transformers/transactions.ts`

```
actualValue = actualShares × price + fees
```

Cost of remaining/allocated shares after FIFO allocation. Used to compute `avgPrice` on the holding.

---

### `fundsValue`

> `shared/transformers/transactions.ts`

```
fundsValue = paidPrice ?? totalValue
```

Preferred cost basis for a transaction. For sell transactions, `paidPrice` (the FIFO-allocated original cost of sold shares, without fees) is used when available. Falls back to `totalValue` (with fees) for buy transactions.

Used in `invested` calculation.

---

### FIFO Sell Allocation — `allocateSellTransaction`

> `src/service/transactions.ts`

When a sell transaction is added, shares are allocated against buy transactions in **reverse chronological order** (newest buys first):

```
for each buyTransaction (newest → oldest):
  soldShares = min(buyTransaction.actualShares, remainingShares)
  buyTransaction.actualShares -= soldShares
  realizedProfitOrLoss += soldShares × (sellPrice - buyPrice)
  paidPrice += soldShares × buyPrice
  remainingShares -= soldShares
```

This sets on the sell transaction:

- `realizedProfit` = total realized gain/loss from this sale
- `paidPrice` = original cost basis of the sold shares (used in `fundsValue`)

When a sell transaction is **removed**, the allocation is reversed — `actualShares` is restored on the affected buy transactions.

---

## 2. Holding-Level Calculations

> `src/service/holdings.ts` — `syncHoldingWithTransactions`

All holding metrics are recalculated from scratch against the holding's transactions whenever a transaction is added or removed. Transactions are matched by `holdingId` (with fallback to `ticker` for legacy transactions without a `holdingId`).

---

### `avgPrice`

```
totalShares = Σ buyTransaction.actualShares
avgPrice    = Σ(buyTransaction.actualShares × buyTransaction.price + buyTransaction.fees) / totalShares
```

Fees are included in the numerator, spreading them proportionally across all remaining shares. This reflects the true all-in cost per share.

Returns `0` if `totalShares` is 0 (fully sold).

---

### `invested`

```
invested = Σ BUY fundsValue - Σ SELL fundsValue
```

Net capital currently deployed. Buying increases it, selling decreases it by the original cost basis of the sold shares. Fees are included via `fundsValue → totalValue` for buys.

**Design intent:** represents how much capital is actively at work in this position, not a historical gross spend.

---

### `fees`

```
fees = Σ all transaction fees (buys + sells)
```

Total fees ever paid for this holding. Informational — already baked into `avgPrice` and `invested`.

---

### `realizedProfits`

```
realizedProfits = Σ transaction.realizedProfit
```

Accumulated realized gains/losses from all sell transactions on this holding. Only sell transactions carry a `realizedProfit` value (set by FIFO allocation).

---

## 3. Holding Profit Display

> `shared/transformers/holdings.ts`

### `currentValue`

```
currentValue = shares × quote.regularMarketPrice
```

---

### `totalValue` (cost basis)

```
totalValue = shares × avgPrice
```

What your remaining shares cost you (at average price, including fees).

---

### `profit`

```
profit.value   = currentValue - totalValue
profit.percent = profit.value / invested
```

Unrealized gain/loss. Fees are already embedded in `totalValue` via `avgPrice` — there is no separate fee deduction here.

`profit.percent` is **signed** — negative when the position is at a loss. The UI uses this sign to determine color (green/red) and direction arrow via `ProfitIndicator`. At the dashboard KPI level, `ProfitIndicator` receives only `percentage` (not `value`) to avoid rendering the value twice — color is derived from the sign of the percentage itself.

---

### `dailyChange`

```
dailyChange.value   = quote.regularMarketChange × shares
dailyChange.percent = quote.regularMarketChangePercent / 100
```

---

## 4. Portfolio Summary

> `shared/transformers/holdings.ts` — `summary`

Aggregates metrics across **all holdings — both active and deleted**. This is intentional: deleted holdings still carry `realizedProfits` and `fees` that belong in the portfolio picture.

| Field          | Active Holdings                  | Deleted Holdings       |
| -------------- | -------------------------------- | ---------------------- |
| `shares`       | ✅                               | ✅                     |
| `currentValue` | ✅                               | ❌ (no market value)   |
| `profit`       | `profit.value`                   | `realizedProfits` only |
| `invested`     | ✅                               | ❌                     |
| `realized`     | ✅                               | ✅                     |
| `capitalGains` | `profit.value - realizedProfits` | ❌                     |
| `dailyChange`  | ✅                               | ❌                     |
| `fees`         | ✅                               | ✅                     |

**`capitalGains`** represents the unrealized portion of profit — what you'd gain if you sold now, excluding what has already been realized from prior sales on the same holding.

---

## 5. Portfolio KPIs

> `shared/transformers/portfolios.ts`

### `depositsValue`

```
depositsValue = Σ deposits where type != 'balance'
```

Total real cash deposited or withdrawn. Excludes manual balance adjustments.

---

### `depositManualBalance`

```
depositManualBalance = Σ deposits where type == 'balance'
```

Manual portfolio adjustments for actions not tracked elsewhere in the system (e.g. transfers, corrections). These affect cashflow.

---

### `cashFlow`

```
cashFlow = depositsValue + depositManualBalance + realized - invested
```

Available cash position. Starts with what you've put in, adds back what you've realized from sales, subtracts what's currently deployed.

**Manual balance deposits** are included because they represent real adjustments to available capital.

---

### `profit` KPI

```
profit.value      = portfolio.profit   (= Σ all holdings profit, active + deleted)
profit.percentage = profit.value / depositsValue
```

**Denominator is `depositsValue`** (total deposits, not invested). This is intentional — cash is treated as a position. If you've deposited $100k but only deployed $60k, the uninvested $40k is still your capital working (or not working). Return is measured against total committed capital.

---

### `target` KPI

```
target.value      = portfolio.target
target.percentage = (currentValue + cashFlow) / portfolio.target
```

Progress toward your portfolio target, accounting for both invested value and available cash.

---

### `dailyChange` KPI

```
dailyChange.value      = Σ active holdings dailyChange
dailyChange.percentage = dailyChange.value / depositsValue
```

---

## 6. Profit Tooltip Breakdown

> `src/components/composables/usePortfolioKpis.ts`

The profit KPI tooltip breaks down total profit into three components:

| Line       | Value                    | Meaning                                                      |
| ---------- | ------------------------ | ------------------------------------------------------------ |
| `capital`  | `portfolio.capitalGains` | Unrealized gains (active holdings only)                      |
| `realized` | `portfolio.realized`     | Gains locked in from sold positions                          |
| `fees`     | `portfolio.fees * -1`    | Total fees paid across all holdings (shown as negative cost) |

**Important:** `fees` is shown as a **negative number** in the tooltip as a visual signal that it is a cost. This is purely for display clarity — fees are **not** an additional deduction against profit. They are already embedded in `profit.value` via `avgPrice` (fees raise cost basis, reducing unrealized profit). The `* -1` is intentional UI convention, not a calculation.

The three lines do **not** necessarily sum to `profit.value` exactly, because:

- `capitalGains` already has fees embedded via cost basis
- `realized` is gross realized P&L before fees
- `fees` is shown for cost awareness only, not as an additional deduction

---

## 7. Known Design Decisions & Edge Cases

### Re-purchase of a sold ticker

When all shares of a holding are sold (`shares <= 0`), the holding is marked `deleted: true`. A subsequent re-purchase creates a **new** holding. The old deleted holding retains its `realizedProfits` and `fees`, which continue to contribute to portfolio-level totals.

### Legacy transactions without `holdingId`

The `holdingId` field on transactions was backfilled via migration. Transactions without a `holdingId` fall back to ticker-only matching in `syncHoldingWithTransactions`. This is safe for single-cycle holdings.

### `avgPrice` returns 0 when fully sold

When `actualShares` across all buys reaches 0, `totalShares = 0` and `avgPrice = 0`. This is expected for deleted holdings — their market value contribution is zero.

### `profit.percent` is signed

`profit.percent` carries its sign (positive = gain, negative = loss). The UI uses the sign directly to determine color and arrow direction in `ProfitIndicator`. Do not apply `Math.abs()` here.
