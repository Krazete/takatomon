# TODO
- use hina images somehow
- improve untangling algorithm
- complete plugin calculator
- write meat, cluster, and fragment calculators
- create image parser to allow fragment-based search

# DONT
- minify code (readability is preferred)
- combine code (portability/modularity is preferred)
  - keep digi.js simple
    - don't compile it; just load edges etc. dynamically
    - should be able to make and input some other node data file
- store gemels in cookies
  - it's fast enough as is
    - even the memoization wasn't necessary
- display too much information about digimon
  - cluttered is never a good look
  - iframes suck
