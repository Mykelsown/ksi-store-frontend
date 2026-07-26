# Hero Carousel/Marquee Implementation

## Overview
A fully functional hero carousel/marquee on the Home page that displays three rotating product slides with automatic transitions, manual navigation, and responsive design.

## Features

### ✨ Carousel Functionality
- **Auto-Rotate**: Automatically advances to the next slide every 5 seconds
- **Manual Navigation**: 
  - Previous/Next buttons with left/right chevron icons
  - Clickable dot indicators to jump to specific slides
- **Smooth Transitions**: CSS fade-in animations between slides
- **Three Product Slides**:
  1. Samsung Galaxy S25 Ultra (Smartphones)
  2. MacBook Pro 17 (Laptops)
  3. iPhone 17 Pro Max (Phones)

### 🎨 Design Features
- Responsive carousel buttons with hover effects
- Interactive dot indicators showing current slide
- Smooth opacity transitions between slides
- Accessibility features (aria-labels)
- Mobile-optimized button sizes

### 📱 Responsive Behavior
- Desktop: Full carousel with navigation buttons and indicators
- Tablet: Adjusted button sizes, full functionality
- Mobile: Compact buttons, optimized spacing

## Files Modified

### `/src/pages/Home.jsx`
**Changes:**
- Added imports for `ChevronLeft` and `ChevronRight` icons
- Added `currentSlide` state management
- Created `heroSlides` array with 3 product configurations
- Added `useEffect` hook for auto-rotation (5-second interval)
- Implemented navigation functions: `goToSlide`, `goToPrevSlide`, `goToNextSlide`
- Updated JSX to render carousel slides dynamically
- Added carousel controls (prev/next buttons and dot indicators)

**Code Structure:**
```jsx
// Carousel slides array
const heroSlides = [
  {
    id: 1,
    title: "Galaxy S25 Ultra",
    subtitle: "Redefine Possible",
    description: "200MP camera · 5000mAh battery · S Pen included",
    price: "₦850,000",
    image: samsungS25Image,
    category: "phones",
    features: [...],
  },
  // ... more slides
];

// Auto-rotation logic
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, 5000);
  return () => clearInterval(interval);
}, []);

// Navigation functions
const goToSlide = (index) => setCurrentSlide(index);
const goToPrevSlide = () => { /* wrap-around logic */ };
const goToNextSlide = () => { /* wrap-around logic */ };
```

### `/src/pages/Home.css`
**New CSS Classes:**

1. **Carousel Wrapper**
   - `.hero-carousel-wrapper` - Container for all slides
   - `.hero-slide` - Individual slide with opacity transitions
   - `.hero-slide.active` - Active slide styling

2. **Navigation Buttons**
   - `.carousel-btn` - Base button styling
   - `.carousel-btn-prev` - Left arrow button
   - `.carousel-btn-next` - Right arrow button
   - Hover and active states with scale effects

3. **Indicators**
   - `.hero-dots` - Container for dot indicators
   - `.dot` - Individual dot styling
   - `.dot.active` - Active dot styling (wider, solid white)

4. **Animations**
   - `@keyframes slideIn` - Fade-in animation for slides
   - Smooth transitions between slides

**Responsive Adjustments:**
- Tablet (768px): Smaller buttons (40px), adjusted positioning
- Mobile (480px): Compact buttons (36px), smaller dots

## Slide Configuration

Each slide object contains:

```javascript
{
  id: number,              // Unique slide identifier
  title: string,           // Main headline (e.g., "Galaxy S25 Ultra")
  subtitle: string,        // Secondary headline (e.g., "Redefine Possible")
  description: string,     // Product features/specs
  price: string,           // Starting price
  image: import,           // Image source (imported asset)
  category: string,        // Category for shop navigation
  features: string[],      // Array of product features
}
```

## Navigation Methods

### Auto-Rotation
- Automatically cycles through slides every 5 seconds
- Stops and resets when component unmounts

### Manual Controls

**Previous Slide**
```jsx
<button onClick={goToPrevSlide}>
  <ChevronLeft />
</button>
```
- Moves to previous slide with wrap-around

**Next Slide**
```jsx
<button onClick={goToNextSlide}>
  <ChevronRight />
</button>
```
- Moves to next slide with wrap-around

**Jump to Slide**
```jsx
{heroSlides.map((_, index) => (
  <button 
    onClick={() => goToSlide(index)}
    className={`dot ${index === currentSlide ? 'active' : ''}`}
  />
))}
```
- Jump directly to any slide via dot indicators

## Styling Hierarchy

### Visual States

**Inactive Slide**
- Opacity: 0
- Pointer-events: none
- Not interactive

**Active Slide**
- Opacity: 1
- Pointer-events: auto
- `slideIn` animation plays
- Full interactivity

**Carousel Buttons**
- Hover: +15% opacity increase, scale 1.1
- Active: scale 0.95
- Smooth transitions (0.3s)

**Dot Indicators**
- Inactive: 10px circle, semi-transparent
- Active: 28px wide bar, solid white
- Hover: Scale 1.15, increased opacity

## Current Slide Images

Each slide uses its own dedicated image, imported in `Home.jsx` from `/src/assets/`:
- Slide 1 (Galaxy S25 Ultra): `samsung-s25-plus.png`
- Slide 2 (MacBook Pro 17): `mackbook-17-pro.png`
- Slide 3 (iPhone 17 Pro Max): `Iphone17-PM.png`

## Behavior Specifications

### Auto-Rotation
- Interval: 5000ms (5 seconds)
- Timing: Automatic, independent of user input
- Reset: No reset on manual navigation

### Transitions
- Duration: 0.8s ease-in-out
- Type: Opacity fade
- Timing: Smooth slide-in animation

### Navigation Loop
- Prev at slide 0 → Jump to last slide
- Next at last slide → Jump to slide 0
- Dot clicks → Direct jump (no animation)

### Accessibility
- All buttons have `aria-label` attributes
- Semantic button elements
- Keyboard accessible (tab navigation)
- Clear visual focus indicators

## Performance Considerations

✅ **Optimized:**
- CSS animations (GPU accelerated)
- Interval cleanup on unmount
- Minimal re-renders
- No unnecessary state updates

⏱️ **Auto-rotation frequency:**
- 5 seconds: Good balance between auto-play and user interaction
- Adjustable by changing interval value in useEffect

## Browser Compatibility

✅ Works in all modern browsers:
- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- 🎥 Touch/swipe gestures for mobile
- ⌨️ Keyboard arrow key navigation
- 🔊 Carousel autoplay pause on hover
- 📊 Analytics tracking for slide views
- 🎬 Custom transition animations
- 🖼️ Image lazy loading for performance

## Troubleshooting

### Carousel not auto-rotating?
- Check browser console for errors
- Verify `currentSlide` state is updating
- Ensure interval cleanup isn't being called prematurely

### Buttons not clickable?
- Check z-index values (carousel buttons have z-index: 10)
- Verify event handlers are attached
- Check for CSS `pointer-events: none` blocking clicks

### Images not showing?
- Verify image imports are correct
- Check image file exists in `/src/assets/`
- Use browser DevTools to debug image loading

### Slides not transitioning?
- Verify CSS animation is applied to active slide
- Check opacity values in CSS
- Ensure transition duration (0.8s) is being applied
