# Takatomon
A digivolution chart viewer for Digimon Links.

## TODO
- add "last modified"
- add a cache reset button (window.location.reload(true))
- add popup search button
  - with a search bar
  - and tribe filtering
  - and dna fork filtering
- add "export to growlmon" button
  - will open the growlmon page for each selected digimon
- untangle lines
- color-code selected digimon
  - allows showing ANY and ALL options simultaneously
  - would need to figure out color randomization that avoids similarity (true-color similarity and color-blind similarity)
- add search bar
- display digimon names
- display link to growlmon.net
  - maybe take data from growlmon.net or use an iframe
    - allows easier comparison
- webscrape digimon tribe and rank from growlmon.net
  - and then display tribe and rank
- add buttons to each selected digimon icon
  - separate icon from deselect button
  - add opacity toggle

## DONT
- minify code
  - i prefer readability
- combine code
  - i want portability
  - keep the tree file simple
    - don't "compile" it, load branches etc. dynamically
    - should be able to easily make and input some other tree file
- store trees in cookies
  - it's fast enough as is
    - even the memoization wasn't necessary
  - i don't like random things saved on my computer
    - so avoid doing it to others
