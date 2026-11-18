---
title: "can a pdf vouch for a company's name?"
date: '2026-11-18'
hook: 'an independent review of the fix passes 77 of 77 checks, against 24 of 77 on the old code, all on synthetic test data. one file, about fifty lines. here is what was wrong.'
topics: ['Agents', 'Reliability']
---

## The hole

Ledgewood checks companies. One of its identity checks asks the company's own website to state the same legal name as the official register. The product's evidence contract for that check is specific: the website route reads web pages. Company-hosted documents are not independent evidence, and the worker has no PDF path.

A review on November 6 found the code didn't match that contract. Every response on the company's domain was read as page text, whatever the server declared it to be. A PDF, a text file, anything. A name printed inside a PDF on the company's own site could be lifted out as a "self-declared" legal name and pass the check against the register.

The demo makes the failure concrete. A synthetic company serves a same-host PDF legal notice, declared `application/pdf`, printing the name "Pdfonly Holdings Ltd". On the old code, that PDF is used as a page, the name is recorded as self-declared, and the website check confirms the register lookup for it. A portable document just vouched for a company's identity, against the product's own rules.

## The fix

One file, the website source reader, 48 lines added and 3 removed, plus a new test file. Three rules:

- A page is read only when the server declares HTML. If the server declares nothing, the page is read unless the body looks like a binary file.
- A refused page contributes nothing, and it counts as missing evidence, never as contrary evidence. "Could not be read" is not "the website disagrees."
- A refused home page marks every field as an error, never as "not found."

Two stricter readings were kept on the reviewer's notes: an empty Content-Type header is refused, and a duplicated one is too. Both could be parsed more loosely; the current code refuses.

On the fixed code, the demo's PDF is refused (`declared content type 'application/pdf'`), the name is `not_found`, and the check reports that the site "could not be read to confirm the legal name." Missing evidence, stated as missing evidence. The ordinary HTML control page is unchanged.

## The trade-off that stays

The fix is not strict HTML-only. A server that declares no content type and sends something text-like (plain text, JSON, SVG) is still read as a page, and the demo keeps one honest case: an untyped plain-text page printing a name still passes the check, before and after. Closing that would risk rejecting sites that serve pages without headers; how many real sites do that is unmeasured. So the current implementation keeps the compatibility, and the hole is written down instead of hidden.

## Where this could be wrong

Everything above was measured on synthetic test bodies. The test PDFs are deliberately readable, which is the worst case, and the signature list for undeclared bodies is narrow. Nothing was measured on real sites: not how often non-HTML pages appear on company domains, and nothing about entity accuracy or coverage.

The 77 of 77 is the independent reviewer's own check suite. The change's direct evidence is its 19 targeted tests, nine of which reproduce the hole and fail on the old code, plus the project's 1,562-test suite. The reviewer also recorded 23 of 23 ordinary HTML scenarios as byte-identical before and after; that is a recorded result on those scenarios, not proof that no reading of any normal page can move.

The next real step is a before-and-after run on a short, pre-agreed list of real company domains, comparing what gets admitted, what gets refused, and what the identity checks say. That needs live fetches, and it still wouldn't say whether an operator finds any of this useful.

The rules already said no. The code hadn't caught up.

## Reproducing this

The 19 targeted tests and the offline demo run without network, model or real sites, on Python 3.13 and 3.9. The full suite is green on 3.9. On this machine's Homebrew 3.13, three process-signal tests fail identically on old and new code: the test server's reverse-name lookup takes about 35 seconds on this machine's resolver, longer than the tests' 10-second wait. That is the environment, not the change.

The change merged on November 17 into the project's review branch. It is not on the main branch and it is not deployed. The repository is private, so there is no public code link.
