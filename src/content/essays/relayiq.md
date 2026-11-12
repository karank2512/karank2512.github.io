---
title: "Measuring RelayIQ's confidence score against its floor"
date: '2026-11-13'
hook: 'A score of 0.92 from RelayIQ was right 81% of the time. A single constant guess beat the whole score. All numbers here come from a synthetic benchmark, and I say so each time.'
topics: ['Evaluation', 'Synthetic data, no live provider calls']
---

RelayIQ is a tool I built that sits between data providers and a CRM. For each enriched field it decides whether to write the value, and the decision leans on a confidence score. The README calls that score a heuristic, not a probability. This write-up is what happens when you read the calibration table properly.

The short version: on 783 scored fields from a synthetic world with known ground truth, the score's Brier score is 0.1642. Predicting the same number for every field, the overall accuracy of 0.8084, scores 0.1549. Lower is better, so the score loses to a rule that reads nothing about the field.

## What the score is

The score is a weighted mean of seven signals: provider prior, freshness decay, cross-provider agreement, format validity, consistency, the provider's own confidence, and review history. A conflict penalty is subtracted. It is a fixed formula (rules-v1). Nothing is fitted to outcomes.

It exists so the CRM gate has something to compare against. A fresh CRM value should never be overwritten by a less trusted enrichment, and "less trusted" needs a number.

## How I measured it

The benchmark world is synthetic. Two simulated provider personalities answer questions about invented companies and contacts, and I know the true value of every field. No live Clay, HubSpot or commercial provider was called. That makes the truth labels perfect and the world unrealistically tidy, and everything below inherits both facts.

The calibration run scores every enriched field, groups scores into ten buckets of width 0.1, and compares each bucket's mean confidence with how often the field was actually right. It is seeded (42) and the report is written by a script, `make calibration`, not typed by hand.

## The result, with the floor next to it

| Measure | Value |
| --- | --- |
| Fields scored | 783 |
| Overall accuracy | 0.8084 |
| Mean confidence | 0.8737 |
| Brier score, RelayIQ | 0.1642 |
| Brier score, constant guess at overall accuracy (in-sample) | 0.1549 |
| Expected calibration error | 0.0905 |

The score is overconfident by about 6.5 points on average. The constant guess is the dumb baseline here: it knows the overall hit rate and nothing else. It is also in-sample, because that hit rate comes from the same 783 fields it is scored on, so it is a floor to beat and not a predictor anyone could deploy. Even so, beating it is the minimum for a score to be doing any work, and this one does not: it is 0.0093 worse.

## Where it is wrong

| Confidence bucket | Fields | Mean confidence | Accuracy |
| --- | --- | --- | --- |
| 0.3 to 0.4 | 5 | 0.381 | 0.600 |
| 0.4 to 0.5 | 9 | 0.454 | 0.556 |
| 0.5 to 0.6 | 13 | 0.508 | 0.846 |
| 0.6 to 0.7 | 14 | 0.685 | 0.929 |
| 0.7 to 0.8 | 46 | 0.737 | 0.739 |
| 0.8 to 0.9 | 268 | 0.869 | 0.817 |
| 0.9 to 1.0 | 428 | 0.923 | 0.813 |

Two things stand out. First, 696 of the 783 fields, 89%, land at 0.8 or above. In that region the average confidence is 0.90 and the accuracy is 0.815. The score says 0.92 and the field is right about four times in five.

Second, the top bucket is not better than the one below it. Fields scored 0.9 to 1.0 were right 81.3% of the time. Fields scored 0.8 to 0.9 were right 81.7% of the time. The gate cannot tell them apart.

The low end is the other way around. The 87 fields below 0.8 had mean confidence 0.64 and accuracy 0.76, so the score undersells them.

## What I had wrong

The README used to say the score "ranks well but is not a probability." The table does not support the first half, and I have since changed that line. Accuracy is not monotone in confidence: the 0.5 to 0.6 and 0.6 to 0.7 buckets are more accurate than the 0.7 to 0.8 bucket, and the top two buckets are tied. At bucket level, it barely ranks.

I can quantify how little. A Brier score splits into reliability (how far scores sit from the observed hit rate), resolution (how much the scores separate good fields from bad ones) and the unavoidable uncertainty of the base rate. From the table I get reliability 0.0109, resolution 0.0016 and uncertainty 0.1549, which rebuilds the grouped Brier score: with the unrounded values, 0.010905 - 0.001614 + 0.154871 = 0.164162. The raw score, 0.164159, differs from that only at the rounding level, because confidence varies a little inside each bucket. Resolution is tiny. The score separates fields about a seventh as much as it misses the hit rate, which is why the constant wins.

I did not compute a per-field ranking metric such as AUC, because the report only exposes bucket aggregates. Ten buckets can hide ordering inside a bucket. So the claim is "no evidence of useful ranking at bucket level", not "proven useless at ranking".

I also cannot say what the score does to the end result. The full pipeline in the benchmark, which includes confidence gating, has field precision 0.784 against 0.773 for static routing alone, at a higher cost. I never ran the pipeline with the gate off, so I can't credit or blame the score for that difference.

## What this means if you build one

Do not threshold on a hand-weighted score and call it a gate. If most of your scores land above your threshold, the gate passes nearly everything, and here any threshold at or below 0.8 would keep 89% of fields whatever their real hit rate.

Check any such score against a constant baseline before you trust it. It takes one line. If you want a probability, fit one: map bucket scores to observed accuracy on held-out data. I have not built that, and the README says it is designed and not built.

Two limits worth repeating. The world is synthetic, so the 0.81 hit rate is a property of my simulated providers, not of real vendors.

## Reproduce it

Code and the report are at [github.com/karank2512/RelayIQ](https://github.com/karank2512/RelayIQ). Run `make calibration` to regenerate `docs/benchmarks/calibration.md` and `.json` (783 scored fields, seed 42). Every number on this page comes out of that script: the Brier score, expected calibration error, accuracy, the bucket table, the constant-guess baseline (0.1549, scored on the same fields it was fit to, so it is a floor to beat and not a held-out predictor) and the reliability and resolution split.
