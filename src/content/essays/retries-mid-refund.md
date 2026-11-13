---
title: 'what happens when an agent retries mid-refund?'
date: '2026-11-13'
hook: 'on 40 seeded fault runs the naive flow broke 36 times and the hardened one held all 40. here is what changed.'
topics: ['Agents', 'Reliability']
---

A refund looks like three lines. Check the balance, call the provider, write down the result. The interesting question is what happens when the call goes wrong in the ways real calls go wrong. That can be answered in an afternoon, so I did the obvious thing: wrote a fake provider that fails on command and ran two versions against it.

## The setup

TypeScript on Postgres, run through PGlite. The fake provider can time out, return a 500, lose its response after the money has moved, or kill the caller mid-flow. The naive build retries up to three times. Both builds get the same faults.

## What broke

Four named scenarios, each with a naive result that is plainly wrong:

- The same request sent twice moved 8000 on a 4000 refund.
- A timeout after the provider had already refunded, then a retry: 8000 moved, 4000 recorded.
- Two 7000 refunds racing on a 10000 payment moved 14000.
- A crash after the provider call, then a client retry: 8000 moved, 4000 recorded.

A fifth case, two 500s and then success, passes on both. It is the control.

Then 40 seeded random runs, with a 40% fault rate on every provider call. The naive build over-refunded or drifted from the provider's books on 36. The hardened build held on all 40.

## What the hardened version does

It writes down the intent before any money can move. A unique request key and an atomic balance reservation go in together, in one transaction. The provider call carries an idempotency key, so a retry is a replay and not a second refund. Finalising is guarded, so a refund goes from pending to succeeded once. A reconcile step finishes anything a crash left pending.

All 21 tests pass. As a check on the tests, I took the idempotency key out of the hardened code, then the balance guard. Each removal made the matching tests fail. That is the part I trust most, because it shows the tests can fail.

## Where this could be wrong

The provider is fake, and a real one will differ. The 36 of 40 depends on my choices: the 40% fault rate and the three-try retry loop on the naive build. A different rate would give a different number. PGlite is a single connection, so the race tests interleave async calls instead of using parallel sessions. It covers one payment and one currency.

The fix is small. None of the four ideas is clever. The naive version fails because it never asks what happens after the call.

Code and the test command: [github.com/karank2512/refund-fault-injection](https://github.com/karank2512/refund-fault-injection). `npm test` reproduces every number above.
