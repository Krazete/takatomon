# Takatomon
A digivolution chart viewer for Digimon Links.

| ![dorumon](https://raw.githubusercontent.com/Krazete/takatomon/master/img/mon/dorumon.png) | test |
| --- | --- |

## TODO
- add filters
  - for tribes
  - for dna forks
  - for dna pre-forks
- fix "export to growlmon" button
  - add a warning before opening >10 pages
  - doesn't work at all on mobile for >1 pages
- untangle lines
- color-code selected digimon
  - allows showing ANY and ALL options simultaneously
  - would need to figure out color randomization that avoids similarity
    - would maybe need to study hue discrimination
- use image parser to allow fragment-based search

## DONT
- minify code (readability is preferred)
- combine code (portability/modularity is preferred)
  - keep the tree file simple
    - don't "compile" it; just load branches etc. dynamically
    - should be able to make and input some other tree file
- store trees in cookies
  - it's fast enough as is
    - even the memoization wasn't necessary
  - i don't like random things saved on my computer
- display too much information about digimon
  - cluttered is never a good look
  - iframes suck

## Data Credits
- /u/ChasingRaccoons - Growlmon

## Idea Credits
- bro - Initial Concept, DNA Fork Labels
- /u/dinwitt - Search Box
- /u/tyger249 - Tribe Labels, Name Labels

not yet implemented:
- /u/JudgemasterCid - Mutant Digivolution Addition
- /u/mviper13 - Fragment-Based Search
- /u/tyger249 - Save Feature
- /u/gashunum - DNA Fork Checkability Labels
