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
- ~~add buttons to each selected digimon icon~~
  - ~~separate icon from deselect button~~
  - ~~add opacity toggle~~
  - on second thought, color-coding will render this redundant
- add a credits section (for data and ideas)
- use image parser to allow fragment-based search

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
- display too much information about digimon
  - iframes suck
  - i don't want to take too much traffic away from growlmon
  - a comparison popup would be too big on mobile
    - maybe

## Data Credits
- /u/ChasingRaccoons - Growlmon

## Idea Credits
- bro - Initial Idea; Skill Variety
- /u/dinwitt - Search Box
- /u/JudgemasterCid - Mutant Digivolution
- /u/tyger249 - Tribe
- /u/mviper13 - Fragment-Based Search
