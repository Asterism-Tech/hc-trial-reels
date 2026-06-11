# Brand Instructions

## Color Palette

### Primary Colors
- **Aubergine** `#45132c` – Deep, rich purple. Use for primary CTAs, headers, and key visual hierarchy elements. Conveys sophistication and trust.
- **Hot Pink** `#ed4a7e` – Energetic accent. Use for interactive highlights, hover states, secondary CTAs, and emotional focal points. Creates vibrancy without overwhelming.
- **Natural** `#f5eee4` – Warm, soft neutral. Use for backgrounds, cards, and gentle surfaces that support content without competing.

### Secondary Palette
- **Aubergine Tint** `#6b2e4d` – Slightly lighter aubergine for subtle depth, disabled states, and secondary surfaces.
- **Hot Pink Tint** `#f5a3c7` – Softer pink for hover states on secondary elements and gentle callouts.
- **Off-white** `#faf9f7` – Slightly warm white for contrast against Natural backgrounds.

### Usage Guidelines
- **Dark mode compatibility**: Aubergine works well as a primary on light backgrounds; invert to hot pink as primary accent in dark mode.
- **Contrast**: Always test text legibility. Hot pink on Natural needs careful sizing (minimum 16px for body text).
- **Emotional tone**: Aubergine feels handcrafted and intentional; hot pink adds approachability and energy.

---

## Typography

### Font Stack
**Poppins** (primary) + system fallback
```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale
- **Display** – 48px / 56px (Poppins 700) – Page titles, hero headlines
- **Heading 1** – 32px / 40px (Poppins 700) – Section headers
- **Heading 2** – 24px / 32px (Poppins 600) – Subsection headers
- **Heading 3** – 18px / 26px (Poppins 600) – Component titles
- **Body Large** – 16px / 24px (Poppins 400) – Primary body text, longer content
- **Body** – 14px / 20px (Poppins 400) – Default UI text, form labels
- **Body Small** – 12px / 16px (Poppins 400) – Secondary text, captions, timestamps
- **Button** – 14px / 16px (Poppins 600) – Interactive text

### Font Weight Usage
- **700 (Bold)** – Headlines, emphasis, CTAs
- **600 (Semibold)** – Section headers, stronger labels
- **400 (Regular)** – Body text, supporting copy

### Personality
Poppins is friendly and geometric. Pair with generous spacing and clear hierarchy to feel intentional, not default.

---

## Visual Aesthetic: Handmade, Sewed

### Core Principles
This isn't rustic or distressed—it's **intentional craft**. Think carefully sewn seams, thoughtful hand-stitched details, and organic-but-precise geometry.

### Implementation Guidelines

#### Borders & Frames
- Use `border-radius: 8px` to 12px for a soft, handmade feel (not perfectly sharp corners)
- Borders should be 2px or 1.5px—substantial enough to feel intentional
- Consider using `box-shadow: 0 2px 8px rgba(69, 19, 44, 0.1)` for subtle depth that mimics thread shadows

#### Spacing & Grid
- Follow an 8px grid system for consistency while maintaining organic feel
- Leave breathing room around elements—don't overcrowd
- Odd spacing (e.g., 13px, 21px) is acceptable in accents to add handmade variability, but keep major layouts on-grid

#### Textures (Subtle)
- Consider adding a 1–2% noise overlay to card backgrounds for textile warmth (optional, use sparingly)
- Avoid glossy finishes; favor matte surfaces
- SVG illustrations can use slightly irregular stroke widths (±0.5px variance) to feel hand-drawn

#### Stitch Details
- For premium sections or emphasis, add a thin dashed border (2px dashes, 3px gaps) in Hot Pink as a "sewing line"
- Example: `border: 2px dashed #ed4a7e;`
- Use this sparingly—on feature cards, section dividers, or CTA containers

#### Color Blocking
- Aubergine and Hot Pink work best in solid blocks rather than gradients
- Allow Natural backgrounds to breathe between colored sections
- Create visual rhythm by alternating solid colors rather than blending them

---

## Animation Principles

### Core Animation Philosophy
Animations should feel **intentional and supportive**—like watching a garment being carefully constructed. Avoid gloss; favor clarity and purposefulness.

### Timing & Easing
- **Micro-interactions** (hovers, toggles): 200ms, `cubic-bezier(0.4, 0, 0.2, 1)` (material easing)
- **Page transitions & modal opens**: 300ms, `cubic-bezier(0.4, 0, 0.2, 1)`
- **Loading & progress**: 400ms–600ms, `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (smooth, natural)
- **Exit animations**: 150ms (faster, more snappy)

### Contextual Animation Patterns

#### 1. **Button & Interactive Elements**
```css
/* Hover: Gentle scale + color shift */
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
&:hover {
  transform: scale(1.05);
  background-color: #ed4a7e; /* hot pink highlight */
  box-shadow: 0 4px 12px rgba(237, 74, 126, 0.2);
}
```
**Feeling**: Soft, responsive, inviting.

#### 2. **Cards & Content Containers**
```css
/* Staggered entrance + lift on hover */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
animation: slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(69, 19, 44, 0.15);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```
**Feeling**: Cards feel like they're being picked up and examined closely.

#### 3. **Form Inputs & Focus States**
```css
/* Border color fade + glow on focus */
transition: border-color 200ms, box-shadow 200ms;
&:focus {
  border-color: #ed4a7e;
  box-shadow: 0 0 0 3px rgba(237, 74, 126, 0.1);
  outline: none;
}
```
**Feeling**: Clear feedback without harsh contrast—like threading a needle through focus.

#### 4. **Loading States**
```css
@keyframes stitch {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.loader-dot {
  animation: stitch 1.4s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
/* Stagger each dot */
&:nth-child(1) { animation-delay: 0ms; }
&:nth-child(2) { animation-delay: 200ms; }
&:nth-child(3) { animation-delay: 400ms; }
```
**Feeling**: Rhythmic, like a needle creating a pattern—purposeful, not anxious.

#### 5. **Transitions Between States**
```css
/* Smooth color transitions for state changes */
@keyframes colorShift {
  from { background-color: #f5ee4; }
  to { background-color: #ed4a7e; }
}
animation: colorShift 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
```
**Feeling**: Intentional state changes feel like adding a stitch of a new color.

#### 6. **Backdrop & Modal Entrance**
```css
@keyframes fadeIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(4px); }
}
animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
```
**Feeling**: Soft focus drawing attention to the modal—like adjusting your needle's angle.

#### 7. **Sewed Accent Line Animation (Premium)**
```css
@keyframes drawStitch {
  from { stroke-dashoffset: 100%; }
  to { stroke-dashoffset: 0; }
}
.stitch-line {
  stroke: #ed4a7e;
  stroke-width: 2;
  stroke-dasharray: 8, 4;
  animation: drawStitch 2s ease-in-out infinite;
}
```
**Feeling**: Visual metaphor—the "sewing line" itself animates, reinforcing the handmade aesthetic.

### Accessibility Considerations
- Always provide `prefers-reduced-motion` support:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
- Use `will-change: transform;` on frequently animated elements for performance
- Ensure animations never prevent user interaction

### Performance Notes
- Animate `transform` and `opacity` for 60fps performance (avoid repaints)
- Use GPU acceleration: `transform: translateZ(0);` if needed
- Keep animations under 500ms for UI feedback; loading states can be longer

---

## Component Examples

### Primary Button
```css
.btn-primary {
  background-color: #45132c; /* aubergine */
  color: #faf9f7;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary:hover {
  background-color: #ed4a7e; /* hot pink on hover */
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(237, 74, 126, 0.2);
}
```

### Card with Sewed Accent
```css
.card {
  background-color: #f5ee4;
  border: 2px solid #45132c;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(69, 19, 44, 0.1);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    #ed4a7e 0px,
    #ed4a7e 8px,
    transparent 8px,
    transparent 12px
  );
  border-radius: 10px 10px 0 0;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(69, 19, 44, 0.15);
}
```

---

## Design System Token Summary

```javascript
const tokens = {
  colors: {
    primary: '#45132c',      // aubergine
    accent: '#ed4a7e',       // hot pink
    neutral: '#f5eee4',      // natural
    background: '#faf9f7',   // off-white
  },
  typography: {
    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeights: { regular: 400, semibold: 600, bold: 700 },
  },
  animation: {
    microInteraction: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transition: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    loading: '600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  spacing: {
    grid: '8px',
    radiusSoft: '8px',
    radiusRounded: '12px',
  },
};
```

---

## Final Notes

- **Consistency over perfection**: The handmade aesthetic thrives on intentional choices, not pixel-perfect uniformity.
- **Color restraint**: Hot Pink is an accent. Let Aubergine and Natural lead; let Hot Pink punctuate.
- **Animation restraint**: Every animation should have a purpose. If you're unsure why it's there, remove it.
- **Test together**: Colors, type, spacing, and animations work as a system. Always review changes holistically.
