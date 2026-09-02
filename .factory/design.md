# Couch Creatures design direction

## Visual thesis: brutalist concrete and moss

Couch Creatures takes place in a little overlooked concrete estate that has
become a safe home for shy, odd creatures. Hard slabs, drainage channels, and
route markings make the shared-screen playfield easy to read. Moss, clay, and
chalk soften that structure so failure never feels harsh. The layout is
asymmetrical: a tall route board beside the living game rather than a generic
marketing hero.

## Tokens

| token | value | use |
| --- | --- | --- |
| concrete | `#202723` | page and canvas ground |
| slab | `#35403a` | surfaces and panels |
| chalk | `#f4efd9` | main text and route lines |
| lichen | `#b9d76c` | primary action and safe route |
| moss | `#6f963e` | secondary accents |
| clay | `#db7250` | danger and player two |
| puddle | `#82b7b9` | player three and weather |
| soot | `#111612` | high-contrast ink |

Text uses the self-hosted system-ui stack: compact, practical `Arial` for
headlines and readable `Arial`/system sans for body. This avoids a loaded font
cost while retaining the stamped-signage feeling. Type is deliberately large
in the game, with 16px minimum body text and a 4px/8px spacing scale.

## Interaction and motion

Panels have squared corners, thick inset borders, and small moss growth
notches. The game has a 60 Hz fixed simulation, short squash on a collected
creature, and a restrained route ripple. Motion is removed under
`prefers-reduced-motion`; feedback remains visible through color, text, and
shape. Screen shake is not used. Touch buttons are 56px and placed below the
canvas.

## Art plan and provenance

`assets/src/moss-rescue.png` is the illustrated world image used beside the
landing route board and in the social preview. It is original generated artwork:
Azure AI Foundry `factory-image`, 2026-09-02. Prompt: wide playful scene of
three small shy imaginary creatures being gently guided across a cracked
concrete courtyard toward a mossy shelter; original editorial cut-paper and
gouache illustration; charcoal concrete, lichen green, clay orange, chalk
cream, muted blue; no text, watermark, logos, brands, scary elements. It is
reviewed for text artifacts and optimized to WebP before shipping. Canvas
creatures and markings are procedural original drawings.

## Difficulty and content

Every run contains three habitats: Drainway, Moss Court, and Window Garden.
Each habitat has four creatures, seeded traits, weather, and three moving clay
storms. The fixed demo seed is `moss-postcard-17`; non-demo routes use a fresh
browser-generated seed. Each habitat lasts 180 seconds, giving a complete run
three shelter windows (nine minutes). Failing to shelter two creatures before
a window closes creates a recoverable loss. Three storm strikes create the
other loss state. The final postcard reports the sheltered total out of 12
rather than implying every creature was saved. Assist mode widens lantern
light and slows storm strikes. Four local lanterns are available by keyboard
and labelled touch pads.
