# List layout QA — 2026-11-19

Reference: user screenshot Screenshot 2026-11-19 at 5.22.22 PM.png, 1722×860.
Captures: /tmp/archive-list-desktop.png (1722×860), /tmp/archive-list-mobile.png (390×844).

Compared reference and rendered desktop together. Gray canvas, serif title and values, sans-serif labels, horizontal rules, five metadata columns, topic controls and disclosure chevrons match the supplied composition. Existing brand, bilingual switch and submit action retained. Reference font was not supplied; system Arial is used for the small sans-serif labels. This is a minor P3 typography difference.

Four local-only fixtures populated the reference content for comparison. Production retains real published records, with missing catalog values shown as an em dash; fixtures are not deployed.

Verified desktop expansion/collapse, topic filtering and empty results, restoring All, Chinese labels, mobile expansion and loaded image. Mobile reflows the row into title, three metadata columns, then description. Document width and scroll width both 390px, including expanded state; no horizontal overflow.

No P0/P1/P2 findings remain. Final result: passed.
