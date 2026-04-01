# Revenue Projection Dashboard — Design Brainstorm

## Approach 1: Dark Terminal / Quantitative Finance
<response>
<text>
**Design Movement:** Bloomberg Terminal meets Cyberpunk Data Lab
**Core Principles:** Information density, monospace precision, glowing data, dark-first
**Color Philosophy:** Near-black background (#0a0e1a), electric teal (#00e5cc) for primary data lines, amber (#f59e0b) for warnings/single-channel, crimson for risk zones. Colors carry meaning, not decoration.
**Layout Paradigm:** Asymmetric 3-column grid — left sidebar for controls, center for primary chart, right for live stats panel. No centered hero.
**Signature Elements:** Scanline texture overlay, glowing chart lines with bloom effect, monospace stat counters
**Interaction Philosophy:** Hover reveals raw data points; clicking a vertical isolates it; all transitions are instant (data tools don't animate slowly)
**Animation:** Chart lines draw themselves on load (stroke-dashoffset animation); stat counters count up; minimal — data is the star
**Typography System:** JetBrains Mono for all numbers and labels; Syne for headings; stark weight contrast
</text>
<probability>0.08</probability>
</response>

## Approach 2: Editorial Finance Magazine
<response>
<text>
**Design Movement:** Financial Times / The Economist editorial aesthetic
**Core Principles:** Typographic hierarchy, salmon/cream palette, editorial whitespace, credibility through restraint
**Color Philosophy:** FT salmon (#FFF1E5) background, deep navy (#1a1a2e) for text, teal (#0d9488) for multi-vertical, slate for single-channel. Warm and trustworthy.
**Layout Paradigm:** Newspaper-style — large headline at top, chart as the centrepiece, stats in a ruled sidebar. Feels like a research report, not an app.
**Signature Elements:** Ruled horizontal lines as dividers, serif headline font, footnote-style annotations on chart
**Interaction Philosophy:** Hover shows editorial-style tooltips with context; toggles feel like flipping a newspaper section
**Animation:** Subtle fade-in sections; chart bars grow upward on load
**Typography System:** Playfair Display for headlines; Source Serif Pro for body; DM Mono for numbers
</text>
<probability>0.07</probability>
</response>

## Approach 3: Obsidian Intelligence Dashboard (CHOSEN)
<response>
<text>
**Design Movement:** Deep Space Data Observatory — premium dark SaaS meets scientific visualisation
**Core Principles:** Deep obsidian backgrounds, luminous data, generous whitespace, glass-morphism cards
**Color Philosophy:** Background: #080c14 (near-black with blue undertone). Each vertical has its own luminous accent color (teal, amber, green, red, blue, etc.). Multi-vertical line glows white. Single-channel is muted grey-blue. Colors are the data.
**Layout Paradigm:** Full-width dashboard. Top: KPI stat bar. Center: dominant stacked area chart. Bottom: vertical breakdown cards in a horizontal scroll. No centered layout — data fills the space.
**Signature Elements:** Glassmorphism stat cards with subtle border glow, gradient mesh background, chart area fills with translucent color layers
**Interaction Philosophy:** Hover on chart shows a vertical crosshair with a rich floating tooltip; clicking a legend item toggles that vertical on/off with smooth animation
**Animation:** Chart areas animate in from bottom with staggered delay per vertical; KPI counters count up on load; cards fade up
**Typography System:** Space Grotesk for headings (geometric, modern); IBM Plex Mono for all numbers and data labels; stark contrast between display and data
</text>
<probability>0.09</probability>
</response>

## CHOSEN: Approach 3 — Obsidian Intelligence Dashboard
Deep Space Data Observatory aesthetic. Obsidian background, luminous per-vertical accent colors, glassmorphism cards, Space Grotesk + IBM Plex Mono typography.
