# Takatomon
A digivolution chart viewer for Digimon Links.

## TODO
- use memoization for trees
  - not sure if this will be much faster
  - maybe do this in the webscraping step instead of dynamically
    - would need to figure out how to JSON.stringify set objects
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
