---
name: Telecom & Mobile POS Hub
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777e'
  outline-variant: '#c5c6cd'
  surface-tint: '#515f78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#0d1c32'
  on-primary-container: '#76849f'
  inverse-primary: '#b9c7e4'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Cairo
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Cairo
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Cairo
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Cairo
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Cairo
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Cairo
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Cairo
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Cairo
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Cairo
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Tajawal
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Tajawal
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Tajawal
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
  price-display:
    fontFamily: Cairo
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  code-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for high-throughput telecom hubs, mobile retail stores, and electronics repair operations (*محلات الهواتف الذكية ومراكز الاتصالات والخدمات*). The system targets store operators, inventory managers, and cashiers who demand rapid barcode scanning, instantaneous stock queries, multi-tier SIM card/recharge tracking, and precise split-tender checkouts.

The design movement embodies **Clean Modern Enterprise SaaS with High-Efficiency POS Ergonomics**:
- **Operational Precision:** Interfaces prioritize lightning-fast glanceability, reducing cashier cognitive load during high-traffic hours.
- **RTL-First Symmetry:** Full right-to-left layout geometry native to Arabic business workflows, aligning reading order, action triggers, and transaction streams naturally.
- **Executive Trust:** A palette anchored by deep midnight slate chrome alongside electric blue interactions creates a sense of rock-solid financial accuracy and cutting-edge hardware management.
- **Micro-tactile Feedback:** Distinct semantic states (instant visual response on successful barcode scans, cash drawer triggers, and live IMEI validation) reinforce confidence during fast-paced transactions.

## Colors

The palette balances deep architectural frame elements with crisp operative surfaces and strict financial semantic signals:

### Primary & Chrome Architecture
- **Primary Navy Slate (`#0A192F`):** Anchors the global navigation, master POS top bar, device connectivity status bar, and critical executive totals.
- **Elevated Navy Surface (`#112240`):** Used for contextual drawer headers, dark secondary panels, and active barcode scanner monitors.

### Interactive & Brand Blue
- **Electric Action Blue (`#2563EB`):** Primary checkout triggers, active tabs, confirmed inventory lookups, and focused inputs.
- **Hover/Active Electric Shades (`#1D4ED8` / `#3B82F6`):** Micro-interactions, ripple states, and selected cart item highlights.

### Operational State & Semantic Indicators
- **Emerald Green (`#10B981` / Darker: `#059669` / Surface: `#ECFDF5`):** Sales completion, positive cash drawer balance, paid status, IMEI validation clearance, and incoming stock.
- **Rose Red (`#EF4444` / Darker: `#DC2626` / Surface: `#FEF2F2`):** Refunds, voids, deficit alerts, damaged items, and critical deletion prompts.
- **Amber Warning (`#F59E0B` / Darker: `#D97706` / Surface: `#FFFBEB`):** Low inventory thresholds (e.g., under 3 units of a flagship device), pending repair service tickets, and SIM plan expiration warnings.

### Canvas & Neutral Hierarchy
- **Canvas Base:** `#F8FAFC` provides an eye-comfort neutral plane for sustained operational shifts.
- **Card Surfaces:** Pure `#FFFFFF` for product grids, cart registers, and active data tables.
- **Borders & Rules:** Subtle structural division via `#E2E8F0` with secondary neutral lines at `#F1F5F9`.

## Typography

The typographic system utilizes **Cairo** as the primary voice for structure, commanding numerals, and headers due to its solid baseline, architectural balance, and superior readability in Arabic. **Tajawal** is deployed for secondary operational labels, form metadata, and dense tabular annotations. **JetBrains Mono** is reserved exclusively for Latin hardware tags: IMEI digits, serial numbers, thermal receipt IDs, and barcode streams.

### Principles:
- **Tabular Figures & Currency:** Arab-Indic and Western numerals render in uniform vertical alignment to ensure instant comparison across price tiers and inventory quantities.
- **RTL Baseline Alignment:** Font metric adjustments eliminate baseline shift between Latin model designations (e.g., "iPhone 15 Pro Max 256GB") and localized Arabic descriptions.
- **Letter Spacing:** Fixed at `0` for Arabic letterforms to protect standard cursive ligature connections, with slight open tracking (`+0.02em`) applied exclusively to numeric tags and serials.

## Layout & Spacing

The layout is architected around an asymmetrical, fixed-panel POS model transitioning to an adaptive fluid grid for deep administrative and inventory tables:

### Layout Structures
- **Split POS Viewport (Desktop / 12-Column):**
  - **Right Panel (7 Columns - RTL Primary Focus):** Rapid product discovery, categorized category pills (هواتف, كروت شحن, إكسسوارات, صيانة), searchable inventory grid, and live barcode scanning strip.
  - **Left Panel (5 Columns):** Permanent dynamic checkout docket / shopping cart with line-item discounts, customer mobile number auto-search, total VAT calculations, and split-payment drawer buttons.
- **Inventory & Dashboard Views:** Standard 12-column administrative grid featuring full-width dynamic filter bars, real-time KPI card clusters, and Paginated Data Grids.

### Breakpoints & Responsive Behavior
- **Mobile (< 768px):** Collapses into a single-column, bottom-sheet driven flow. The cart transforms into an anchored bottom bar (*شريط إتمام الدفع العائم*) with the total item count and currency badge.
- **Tablet (768px - 1024px):** 60/40 compact split view with collapsible inventory filters and swipeable category headers.
- **Desktop (1024px+):** Full expansive POS console optimized for horizontal touch displays and mouse/keyboard thermal barcode workflows.

## Elevation & Depth

Visual hierarchy employs a hybrid strategy of **tonal layering** and **diffused ambient shadows** tinted with Navy Slate (`#0A192F`):

- **Level 0 (Flat Ground):** `#F8FAFC` canvas. No shadow; structural definition provided by crisp 1px borders in `#E2E8F0`.
- **Level 1 (Cards, Data Panels, & POS Tiles):** `#FFFFFF` surfaces with `box-shadow: 0 1px 3px 0 rgba(10, 25, 47, 0.04), 0 1px 2px -1px rgba(10, 25, 47, 0.04)` and a 1px border (`#E2E8F0`).
- **Level 2 (Active Cart Items, Hovered Stock Cards, Filter Menus):** `box-shadow: 0 4px 6px -1px rgba(10, 25, 47, 0.07), 0 2px 4px -2px rgba(10, 25, 47, 0.05)`.
- **Level 3 (Modal Dialogs, Quick CRUD Drawers, Payment Settlement Sheets):** Deep, soft diffusion with `box-shadow: 0 20px 25px -5px rgba(10, 25, 47, 0.12), 0 8px 10px -6px rgba(10, 25, 47, 0.06)`, framed by subtle translucent outer halos.
- **Hardware Integration Accents:** Active peripheral indicators (USB/Bluetooth barcode reader, thermal receipt printer) carry an internal soft glow using their respective status token (e.g., emerald green radial glow `#10B981` at 20% opacity).

## Shapes

The geometric identity balances clean enterprise seriousness with touch-friendly ergonomics using a **Rounded (Level 2)** schema:

- **Standard Buttons & Form Inputs:** 0.5rem (`rounded-md` / `rounded-lg`) for a clean, stable profile.
- **Interactive Product Cards & Metric Tiles:** 1rem (`rounded-xl`) to encourage touch accuracy and separate dense hardware data cleanly.
- **Dialogs, Drawers & Checkout Summary Modules:** 1.5rem (`rounded-2xl`) for focused, modern modal overlays.
- **Operational Status Pills & Quantity Controllers:** Full pill radius (`9999px`) to distinguish actionable metadata and dynamic counters from structural cards.

## Components

### 1. Primary & POS Action Buttons
- **Checkout Trigger (زر إتمام الدفع):** Full-width, high-intensity Electric Blue (`#2563EB`) with bold white Cairo typography, featuring dynamic total value display on the left and action title on the right (RTL). Hover transitions to `#1D4ED8` with an active press scale of `0.98`.
- **Quick-Tender Fast Keys (أزرار النقد السريع):** Segmented buttons for exact currency denominations (e.g., 50, 100, 200 ج.م / ر.س) styled in slate-tinted surfaces (`#F1F5F9`) with primary slate text.

### 2. Barcode & Peripheral Monitor Strip
- Anchored at the top edge of the catalog area. Displays real-time device connection: an icon indicator for hardware scanners with a pulsating dot (`#10B981` for ready, `#EF4444` for disconnected).
- Includes an always-active, high-contrast barcode input field equipped with autofocus retention and instant serial lookup feedback.

### 3. Inventory Cards & Tabular Views
- **Grid Tiles:** High-density cards displaying brand badges, stock count pill (color-coded: Emerald for >5, Amber for 1-4, Rose for 0), device model, color/storage variants, and large price text.
- **Data Tables:** Dense, alternate row striping on hover (`#F8FAFC`). Includes dedicated monospaced columns for IMEI and serial numbers with single-click copy buttons, inventory thresholds, and instant in-row CRUD actions.

### 4. Chips & Category Filters
- Horizontally scrollable RTL pill list. Selected state: solid Navy Slate (`#0A192F`) with pure white text. Idle state: transparent background with `#E2E8F0` border and `#64748B` neutral text.

### 5. Input Fields & Form Controls
- **RTL Numeric Inputs:** Right-aligned Arabic labels with left-aligned currency tags (`ج.م` or `ر.س`). In-focus borders shift to Electric Blue (`#2563EB`) with a 3px diffused outer halo (`rgba(37, 99, 235, 0.15)`).
- **IMEI Dual-Input:** Dedicated 15-digit mask verifying device validity in real time with an automated green check or amber dual-SIM prompt.

### 6. Empty States & First-Time Entry
- **Zero-Product Display:** Generous whitespace, clean mono-line hardware illustration (phone outline + barcode wireframe), clear explanatory headline ("لا توجد منتجات مسجلة حالياً"), and a prominent primary button ("إضافة أول منتج للمخزن").

### 7. CRUD & Quick-Edit Dialogs
- Modal overlays anchored in `#112240` tinted backdrops. Header includes breadcrumb navigation for multi-variant items (e.g., adding phone models with varying colors and RAM configurations) and dedicated tabs for basic info, serial/IMEI lists, and supplier invoice assignment.