# V0
## Features
- initialized main features
- - tree mode
- - digimon selection
- - tree line visualization
- initialized global mode
- initialized intersection/union tree toggle
- initialized evol group selection
## Design
- initialized

# V1
## Features
- initialized search group
- initialized tribe icons
- initialized dna2 indicator
- switched default mode from tree to global
## Design
- made body background black
- reworded tree/global mode toggle
- reworded intersection/union tree toggle
- decreased shadow, padding, border, and border radius of evol groups
- increased padding on digimon cards
- added bottom padding to body
- - to prevent mobile toolbar from popping up during mega selection

# V2
## Features
- initialized github button
- initialized growlmon.net export button
- - opens growlmon.net pages for all selected digimon
- initialized awakening buttons
- initialized link to advent schedule
- initialized nametags
- replaced dna2 indicators with skillsets
- - shows skill element, skill effect, and growlmon.net-rated tier
- switched default mode back from global to tree
- switch default tree from union to intersection
## Design
- increased search box size
- changed intersection/union tree toggle from text to button
- changed global/tree mode toggle from text to button
- increased opacity of digimon cards
- changed selection group to look like evol groups
- normalized padding and border radius of evol group labels

# V3
## Features
- initialized search filters
- - basic: tribe, skill element, skill effect
- - special: tree, dna2, v2, advent
- initialized hover preview
- initialized sort basis toggle
- - alphabetical, by tribe, or untangled
- initialized card resizer
- initialized advent indicator
- initialized saving settings in local storage
- initialized footer
- - added website description, contact information, and q&a
- - moved github button to about section
- replaced growlmon.net export button with individual growlmon.net buttons under each digimon card
- initialized plugin calculator
## Design
- increased scrollable area of selection group and evol groups
- - eliminated group padding and margins
- - can now scroll with cursor over evol group label or at window edge
- moved evol group labels from middle to left
- - to prevent accidental evol group selection
- moved search box behind search button
- added blank card for when no digimon are selected
- removed transparency from digimon cards
- added soft hyphens to digimon nametags
- - allows full name to be seen
- - eliminates need for arial narrow font
- redesigned linelayer paths
- - lines are now rotationally symmetric
- - mega-to-mega lines now start and end in the correct direction
- added v2 images and v2 option in awakening toggle
- replaced tribe icons with transparent tribe icons
- - allows fancy css filters
- renamed all variables and classes
## Performance
- replaced all 64px digimon images with full-scale 130px images
- - images no longer look blurry
- - halved the file size anyway by using matlab
- - - converted all images to indexed 64-color images
- switched linelayer from svg to canvas
- - greatly reduced scroll lag
- fixed height of images
- - prevents browser reflow (usually)
- added none.png as digimon image background
- - smaller filesize than all digimon images
- - this should show first while digimon images are still loading
- rewrote tree data structure
- - added tree memoization
- fixed some problems with safari and firefox
- - #rgba, gradients, scrolling, and for-of loops were the main issues
