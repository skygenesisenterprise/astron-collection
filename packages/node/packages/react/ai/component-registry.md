# Kumo Component Registry

> Auto-generated component metadata for AI/agent consumption.

---

### Autocomplete

Autocomplete — free-form text input with an optional filtered suggestion list.

**Type:** component

**Import:** `import { Autocomplete } from "@company/kumo";`

**Category:** Other

**Props:**

- `items`: unknown[] (required)
  Array of items to display in the dropdown
- `value`: string | number | string[]
  The controlled input value
- `open`: boolean
  Whether the popup is open (controlled)
- `children`: ReactNode
  Autocomplete content (input group, popup content)
- `className`: string
  Additional CSS classes
- `label`: ReactNode
  Label content (enables Field wrapper)
- `required`: boolean
  Whether the field is required
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label
- `description`: ReactNode
  Helper text displayed below the field
- `error`: string | object
  Error message or validation error object

**Colors (kumo tokens used):**

`bg-zenth-control`, `bg-zenth-line`, `bg-zenth-tint`, `border-zenth-line`, `ring-zenth-line`, `text-zenth-default`, `text-zenth-strong`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Autocomplete.InputGroup

InputGroup sub-component

Props:
- `className`: string
- `size`: KumoAutocompleteSize
- `placeholder`: string

#### Autocomplete.Content

Content sub-component

Props:
- `children`: ReactNode
- `className`: string
- `align`: AutocompleteBase.Positioner.Props["align"]
- `alignOffset`: AutocompleteBase.Positioner.Props["alignOffset"]
- `side`: AutocompleteBase.Positioner.Props["side"]
- `sideOffset`: AutocompleteBase.Positioner.Props["sideOffset"]

#### Autocomplete.Item

Item sub-component

#### Autocomplete.GroupLabel

GroupLabel sub-component

#### Autocomplete.Group

Group sub-component

#### Autocomplete.Separator

Separator sub-component

#### Autocomplete.List

List sub-component

#### Autocomplete.Empty

Empty sub-component (wraps AutocompleteBase)

#### Autocomplete.Collection

Collection sub-component (wraps AutocompleteBase)


---

### Badge

Small status label for categorizing or highlighting content.

**Type:** component

**Import:** `import { Badge } from "@company/kumo";`

**Category:** Display

**Props:**

- `variant`: enum [default: primary]
  - `"primary"`: Primary badge
  - `"secondary"`: Secondary badge
  - `"error"`: Error badge
  - `"warning"`: Warning badge
  - `"success"`: Success badge
  - `"destructive"`: Deprecated. Use red instead.
  - `"info"`: Info badge
  - `"beta"`: Indicates beta or experimental features
  - `"outline"`: Bordered badge with base background
  - `"red"`: Red badge
  - `"green"`: Green badge
  - `"neutral"`: Neutral badge
  - `"orange"`: Orange badge
  - `"purple"`: Purple badge
  - `"teal"`: Teal badge
  - `"teal-subtle"`: Subtle teal badge
  - `"blue"`: Blue badge
- `className`: string
  Additional CSS classes merged via `cn()`.
- `children`: ReactNode
  Content rendered inside the badge.
- `appearance`: enum [default: filled]
  - `"filled"`: Filled badge with background color (default)
  - `"dot"`: Outlined badge with a colored circle dot indicating status
- `icon`: ReactNode
  Icon from `@phosphor-icons/react` or a React element. Rendered before children.

**Colors (kumo tokens used):**

`bg-zenth-badge-blue`, `bg-zenth-badge-green`, `bg-zenth-badge-inverted`, `bg-zenth-badge-neutral`, `bg-zenth-badge-orange`, `bg-zenth-badge-purple`, `bg-zenth-badge-red`, `bg-zenth-badge-teal`, `bg-zenth-badge-teal-subtle`, `bg-zenth-base`, `bg-zenth-danger-tint`, `bg-zenth-fill`, `bg-zenth-info-tint`, `bg-zenth-success`, `bg-zenth-success-tint`, `bg-zenth-warning-tint`, `border-zenth-brand`, `border-zenth-fill`, `ring-zenth-hairline`, `text-zenth-badge-inverted`, `text-zenth-badge-neutral-subtle`, `text-zenth-badge-teal-subtle`, `text-zenth-danger`, `text-zenth-default`, `text-zenth-info`, `text-zenth-link`, `text-zenth-success`, `text-zenth-warning`

---

### Banner

Full-width message bar with an optional trailing CTA slot.

**Type:** component

**Import:** `import { Banner } from "@company/kumo";`

**Category:** Feedback

**Props:**

- `className`: string
  Additional CSS classes merged via `cn()`.
- `id`: string
- `lang`: string
- `icon`: ReactNode
  Icon element rendered before the banner content (e.g. from `@phosphor-icons/react`).
- `title`: string
  Primary heading text for the banner. Use for i18n string injection.
- `description`: ReactNode
  Secondary description text displayed below the title. Use for i18n string injection.
- `action`: ReactNode
  Action slot for a CTA button or link. Compact banners render a Kumo `Link` inline with the description; CTAs render at the trailing end. Use `Banner.Action` for accent-aware CTAs that self-style to the banner variant; other nodes are rendered as-is. Multiple actions can be passed in a Fragment. Only used in structured mode (with `title` or `description`).
- `text`: string
- `children`: ReactNode
- `variant`: enum [default: default]
  - `"default"`: Informational banner for general messages
  - `"alert"`: Warning banner for cautionary messages
  - `"error"`: Error banner for critical issues
  - `"secondary"`: Neutral banner for secondary messages
- `size`: enum [default: base]
  - `"base"`: Default banner size
  - `"sm"`: Compact banner for dialogs and tight spaces

**Colors (kumo tokens used):**

`bg-zenth-contrast`, `bg-zenth-danger-tint`, `bg-zenth-info-tint`, `bg-zenth-warning-tint`, `fill-zenth-danger`, `fill-zenth-info`, `fill-zenth-interact`, `fill-zenth-warning`, `text-zenth-danger`, `text-zenth-default`, `text-zenth-info`, `text-zenth-warning`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Banner.Action

Action sub-component


---

### Breadcrumbs

Breadcrumbs component

**Type:** component

**Import:** `import { Breadcrumbs } from "@company/kumo";`

**Category:** Display

**Props:**

- `size`: enum [default: base]
  - `"sm"`: Compact breadcrumbs for dense UIs
  - `"base"`: Default breadcrumbs size
- `children`: ReactNode
- `className`: string
  Additional CSS classes merged via `cn()`.

**Colors (kumo tokens used):**

`text-zenth-inactive`, `text-zenth-subtle`, `text-zenth-success`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Breadcrumbs.Link

Link sub-component

#### Breadcrumbs.Current

Current sub-component

#### Breadcrumbs.Separator

Separator sub-component

#### Breadcrumbs.Clipboard

Clipboard sub-component

Props:
- `text`: string (required)


---

### BubbleMap

BubbleMap component

**Type:** component

**Import:** `import { BubbleMap } from "@company/kumo";`

**Category:** Data Visualization

**Props:**

- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

---

### Button

Primary action trigger. Supports multiple variants, sizes, shapes, icons, and loading state.

**Type:** component

**Import:** `import { Button } from "@company/kumo";`

**Category:** Action

**Props:**

- `shape`: enum [default: base]
  - `"base"`: Default rectangular button shape
  - `"square"`: Square button for icon-only actions
  - `"circle"`: Circular button for icon-only actions
- `size`: enum [default: base]
  - `"xs"`: Extra small button for compact UIs
  - `"sm"`: Small button for secondary actions
  - `"base"`: Default button size
  - `"lg"`: Large button for primary CTAs
- `variant`: enum [default: secondary]
  - `"primary"`: High-emphasis button for primary actions
  - `"secondary"`: Default button style for most actions
  - `"ghost"`: Minimal button with no background
  - `"destructive"`: Danger button for destructive actions like delete
  - `"secondary-destructive"`: Secondary button with destructive text for less prominent dangerous actions
  - `"outline"`: Bordered button with transparent background

  **State Classes:**
  - `"primary"`:
    - `focus`: `focus:ring-(--zenth-button-emphasis-ring) focus-visible:ring-(--zenth-button-emphasis-ring)`
    - `active`: `active:ring-(--zenth-button-emphasis-ring)`
    - `disabled`: `disabled:opacity-50`
  - `"secondary"`:
    - `not-disabled`: `not-disabled:hover:bg-zenth-tint`
    - `disabled`: `disabled:bg-zenth-base/50 disabled:!text-zenth-default/70`
    - `data-state`: `data-[state=open]:bg-zenth-base`
  - `"ghost"`:
    - `hover`: `hover:bg-zenth-tint`
  - `"destructive"`:
    - `focus`: `focus:ring-(--zenth-button-emphasis-ring) focus-visible:ring-(--zenth-button-emphasis-ring)`
    - `active`: `active:ring-(--zenth-button-emphasis-ring)`
    - `disabled`: `disabled:opacity-50`
  - `"secondary-destructive"`:
    - `not-disabled`: `not-disabled:hover:!text-zenth-danger not-disabled:hover:ring-zenth-danger/30`
    - `disabled`: `disabled:bg-zenth-base/50 disabled:!text-zenth-danger/70`
    - `data-state`: `data-[state=open]:bg-zenth-base`
  - `"outline"`:
    - `not-disabled`: `not-disabled:hover:text-zenth-strong not-disabled:hover:ring-zenth-focus/25`
- `children`: ReactNode
- `className`: string
- `icon`: ReactNode
  Icon from `@phosphor-icons/react` or a React element. Rendered before children.
- `loading`: boolean
  Shows a loading spinner and disables interaction.
- `title`: string
- `id`: string
- `lang`: string
- `disabled`: boolean
- `name`: string
- `type`: enum
- `value`: string | string[] | number

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-tint`, `ring-zenth-brand`, `ring-zenth-danger`, `ring-zenth-focus`, `ring-zenth-line`, `text-zenth-danger`, `text-zenth-default`, `text-zenth-strong`, `text-zenth-subtle`

---

### ButtonGroup

Joins a small set of tightly-coupled buttons into a single control — most commonly a **split button**: a primary action next to a dropdown trigger for related, secondary actions.

**Type:** component

**Import:** `import { ButtonGroup } from "@company/kumo";`

**Category:** Action

**Props:**

- `className`: string
  Additional CSS classes merged via `cn()`. Use kumo semantic tokens only.
- `id`: string
- `lang`: string
- `title`: string
- `children`: ReactNode
  The tightly-coupled controls to join. Typically two `Button`s: a primary action and a dropdown trigger (a "split button").

---

### Chart

Chart — a low-level wrapper around [Apache ECharts](https://echarts.apache.org).

**Type:** component

**Import:** `import { Chart } from "@company/kumo";`

**Category:** Data Visualization

**Props:**

- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

---

### Checkbox

Checkbox component

**Type:** component

**Import:** `import { Checkbox } from "@company/kumo";`

**Category:** Input

**Props:**

- `variant`: enum [default: default]
  - `"default"`: Default checkbox appearance
  - `"error"`: Error state for validation failures

  **State Classes:**
  - `"default"`:
    - `focus`: `[&:focus-within>span]:ring-zenth-focus`
    - `hover`: `[&:hover>span]:ring-zenth-hairline`
- `label`: ReactNode
  Label content for the checkbox (enables built-in Field wrapper) - can be a string or any React node
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `controlFirst`: boolean
  When true (default), checkbox appears before label. When false, label appears before checkbox.
- `checked`: boolean
  Whether the checkbox is checked (controlled)
- `indeterminate`: boolean
  Whether the checkbox is in indeterminate state
- `disabled`: boolean
  Whether the checkbox is disabled
- `name`: string
  Name for form submission
- `required`: boolean
  Whether the field is required
- `className`: string
  Additional class name

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-contrast`, `bg-zenth-elevated`, `bg-zenth-tint`, `border-zenth-danger`, `border-zenth-hairline`, `border-zenth-interact`, `border-zenth-line`, `ring-zenth-brand`, `ring-zenth-contrast`, `ring-zenth-danger`, `ring-zenth-focus`, `ring-zenth-hairline`, `ring-zenth-line`, `text-zenth-danger`, `text-zenth-default`, `text-zenth-inverse`, `text-zenth-subtle`

**Styling:**

- **Dimensions:** `h-4 w-4`
- **Border Radius:** `rounded-sm`
- **Base Tokens:** `bg-kumo-base`, `ring-kumo-line`
- **States:**
  - `checked`: `bg-kumo-contrast`, `text-kumo-inverse`
  - `indeterminate`: `bg-kumo-contrast`, `text-kumo-inverse`
  - `error`: `ring-kumo-danger`
  - `hover`: `ring-kumo-hairline`
  - `focus`: `ring-kumo-hairline`
  - `disabled`: `opacity-50`, `cursor-not-allowed`
- **Icons:**
  - `ph-check` (checked) size 12
  - `ph-minus` (indeterminate) size 12

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Checkbox.Item

Item sub-component

#### Checkbox.Group

Group sub-component

#### Checkbox.Legend

Legend sub-component


---

### ChoroplethMap

ChoroplethMap component

**Type:** component

**Import:** `import { ChoroplethMap } from "@company/kumo";`

**Category:** Data Visualization

**Props:**

- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

---

### ClipboardText

Read-only text field with a one-click copy-to-clipboard button.

**Type:** component

**Import:** `import { ClipboardText } from "@company/kumo";`

**Category:** Action

**Props:**

- `size`: enum [default: lg]
  - `"sm"`: Small clipboard text for compact UIs
  - `"base"`: Default clipboard text size
  - `"lg"`: Large clipboard text for prominent display
- `text`: string (required)
  The text to display and copy to clipboard.
- `textToCopy`: string
  If provided, this text will be copied to clipboard instead of the `text` prop.
- `masked`: boolean
  Masks the text initially and adds a control to reveal or hide it.
- `className`: string
  Additional CSS classes merged via `cn()`.
- `tooltip`: object
  Tooltip config. Shows tooltip on hover, anchored toast on click.
- `labels`: object
  Accessible labels for i18n.

**Colors (kumo tokens used):**

`bg-zenth-base`, `border-zenth-line`, `outline-zenth-line`, `ring-zenth-brand`, `ring-zenth-focus`, `text-zenth-default`

**Styling:**

- **Base Tokens:** `bg-kumo-base`, `text-kumo-default`, `ring-kumo-line`, `border-kumo-fill`
- **States:**
  - `input`: `bg-kumo-control`, `text-kumo-default`, `ring-kumo-line`
  - `text`: `bg-kumo-base`, `font-mono`
  - `button`: `border-kumo-fill`
- **Icons:**
  - `ph-clipboard` (default) size 16
  - `ph-check` (copied) size 16
- **Input Styles:**
  - Base: `bg-kumo-control text-kumo-default ring ring-kumo-line`
  - Sizes:
    - `xs`: `h-5 gap-1 rounded-sm px-1.5 text-xs`
    - `sm`: `h-6.5 gap-1 rounded-md px-2 text-xs`
    - `base`: `h-9 gap-1.5 rounded-lg px-3 text-base`
    - `lg`: `h-10 gap-2 rounded-lg px-4 text-base`
- **Size Variants:**
  - `sm`:
    - Height: 26px
    - Classes: `text-xs`
    - Button Size: `sm`
    - Dimensions:
      - paddingX: 8
      - gap: 1
      - borderRadius: 6
      - fontSize: 12
  - `base`:
    - Height: 36px
    - Classes: `text-sm`
    - Button Size: `base`
    - Dimensions:
      - paddingX: 12
      - gap: 6
      - borderRadius: 8
      - fontSize: 14
  - `lg`:
    - Height: 40px
    - Classes: `text-sm`
    - Button Size: `lg`
    - Dimensions:
      - paddingX: 16
      - gap: 8
      - borderRadius: 8
      - fontSize: 14

---

### Code

Code component

**Type:** component

**Import:** `import { Code } from "@company/kumo";`

**Category:** Display

**Props:**

- `lang`: enum [default: ts]
  - `"ts"`: TypeScript code
  - `"tsx"`: TypeScript JSX code
  - `"jsonc"`: JSON with comments
  - `"bash"`: Shell/Bash commands
  - `"css"`: CSS styles
- `code`: string (required)
  The code string to display.
- `values`: Record<string, { value: string; highlight?: boolean }>
  Template values for `{{key}}` interpolation. Values with `highlight: true` are visually emphasized.
- `className`: string
  Additional CSS classes merged via `cn()`.

**Colors (kumo tokens used):**

`bg-zenth-base`, `border-zenth-fill`, `text-zenth-subtle`

**Styling:**

- **Dimensions:** `[object Object]`
- **Base Tokens:** `text-zenth-subtle`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Code.Block

Block sub-component


---

### Collapsible

Collapsible — a composable disclosure component for showing/hiding content.

**Type:** component

**Import:** `import { Collapsible } from "@company/kumo";`

**Category:** Display

**Props:**

- `className`: string
  Additional CSS classes
- `onOpenChange`: (open: boolean) => void
  Callback when collapsed state changes

**Colors (kumo tokens used):**

`border-zenth-fill`, `text-zenth-default`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Collapsible.Root

Root sub-component

#### Collapsible.Trigger

Trigger sub-component

#### Collapsible.Panel

Panel sub-component

#### Collapsible.DefaultTrigger

DefaultTrigger sub-component

#### Collapsible.DefaultPanel

DefaultPanel sub-component


---

### Combobox

Combobox — autocomplete input with filterable dropdown list.

**Type:** component

**Import:** `import { Combobox } from "@company/kumo";`

**Category:** Input

**Props:**

- `size`: enum [default: base]
  Size of the combobox trigger. Matches Input component sizes.
- `"xs"` — Extra small for compact UIs (h-5 / 20px)
- `"sm"` — Small for secondary fields (h-6.5 / 26px)
- `"base"` — Default size (h-9 / 36px)
- `"lg"` — Large for prominent fields (h-10 / 40px)
- `inputSide`: enum [default: right]
  - `"right"`: Input positioned inline to the right of chips
  - `"top"`: Input positioned above chips
- `items`: T[] (required)
  Array of items to display in the dropdown
- `value`: T | T[]
  Currently selected value(s)
- `children`: ReactNode
  Combobox content (trigger, content, items)
- `className`: string
  Additional CSS classes
- `label`: ReactNode
  Label content for the combobox (enables Field wrapper) - can be a string or any React node
- `required`: boolean
  Whether the combobox is required
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `description`: ReactNode
  Helper text displayed below the combobox
- `error`: string | object
  Error message or validation error object
- `onValueChange`: (value: T | T[]) => void
  Callback when selection changes
- `multiple`: boolean
  Allow multiple selections
- `isItemEqualToValue`: (item: T, value: T) => boolean
  Custom equality function for comparing items

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-fill-hover`, `bg-zenth-overlay`, `bg-zenth-tint`, `border-zenth-hairline`, `ring-zenth-hairline`, `ring-zenth-line`, `text-zenth-default`, `text-zenth-placeholder`, `text-zenth-subtle`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Combobox.Content

Content sub-component

Props:
- `className`: string
- `align`: ComboboxBase.Positioner.Props["align"]
- `alignOffset`: ComboboxBase.Positioner.Props["alignOffset"]
- `side`: ComboboxBase.Positioner.Props["side"]
- `sideOffset`: ComboboxBase.Positioner.Props["sideOffset"]
- `anchor`: ComboboxBase.Positioner.Props["anchor"]
- `positionMethod`: ComboboxBase.Positioner.Props["positionMethod"]
- `collisionAvoidance`: ComboboxBase.Positioner.Props["collisionAvoidance"]
- `collisionBoundary`: ComboboxBase.Positioner.Props["collisionBoundary"]
- `collisionPadding`: ComboboxBase.Positioner.Props["collisionPadding"]
- `sticky`: ComboboxBase.Positioner.Props["sticky"]
- `disableAnchorTracking`: ComboboxBase.Positioner.Props["disableAnchorTracking"]
- `container`: PortalContainer

#### Combobox.TriggerValue

TriggerValue sub-component

#### Combobox.TriggerInput

TriggerInput sub-component

#### Combobox.TriggerMultipleWithInput

TriggerMultipleWithInput sub-component

#### Combobox.Chip

Chip sub-component

#### Combobox.Item

Item sub-component

#### Combobox.Input

Input sub-component

#### Combobox.Empty

Empty sub-component

#### Combobox.GroupLabel

GroupLabel sub-component

#### Combobox.Group

Group sub-component

#### Combobox.List

List sub-component

#### Combobox.Collection

Renders filtered list items. Use when you need more control over item rendering.

Props:
- `children`: (item: T, index: number) => ReactNode (required) - Function that receives each filtered item and returns a node

Usage:
```tsx
<Combobox.Collection>
  {(item, index) => (
    <Combobox.Item key={index} value={item}>
      {item.label}
    </Combobox.Item>
  )}
</Combobox.Collection>
```

#### Combobox.Trigger

Trigger sub-component (wraps ComboboxBase)

#### Combobox.Value

Value sub-component (wraps ComboboxBase)

#### Combobox.Icon

Icon sub-component (wraps ComboboxBase)


---

### CommandPalette

CommandPalette — accessible command palette / spotlight search overlay.

**Type:** component

**Import:** `import { CommandPalette } from "@company/kumo";`

**Category:** Navigation

**Props:**

- `open`: boolean (required)
  Whether the dialog is open
- `children`: ReactNode
  Child content - typically one or more Panel components
- `container`: PortalContainer
  Container element for the portal. Use this to render the command palette inside a Shadow DOM or custom container. Overrides `KumoPortalProvider` context.

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-elevated`, `bg-zenth-overlay`, `bg-zenth-warning`, `ring-zenth-brand`, `ring-zenth-hairline`, `text-zenth-default`, `text-zenth-subtle`

---

### DatePicker

DatePicker — a date selection calendar.

**Type:** component

**Import:** `import { DatePicker } from "@company/kumo";`

**Category:** Other

**Props:**

- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-contrast`, `bg-zenth-fill`, `bg-zenth-interact`, `bg-zenth-tint`, `ring-zenth-brand`, `ring-zenth-line`, `text-zenth-default`, `text-zenth-inactive`, `text-zenth-inverse`, `text-zenth-link`, `text-zenth-subtle`

---

### DateRangePicker

DateRangePicker — dual-calendar date range selector.

**Type:** component

**Import:** `import { DateRangePicker } from "@company/kumo";`

**Category:** Input

**Props:**

- `size`: enum [default: base]
  - `"sm"`: Compact calendar for tight spaces
  - `"base"`: Default calendar size
  - `"lg"`: Large calendar for prominent date selection
- `variant`: enum [default: default]
  - `"default"`: Default calendar appearance
  - `"subtle"`: Subtle calendar with minimal background
- `timezone`: string
  Display timezone string shown in the footer.
- `className`: string
  Additional CSS classes merged via `cn()`.
- `onStartDateChange`: (date: Date | null) => void
  Callback when start date changes
- `onEndDateChange`: (date: Date | null) => void
  Callback when end date changes

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-contrast`, `bg-zenth-fill`, `bg-zenth-interact`, `bg-zenth-overlay`, `ring-zenth-focus`, `text-zenth-default`, `text-zenth-inverse`, `text-zenth-subtle`

**Styling:**

- **Size Variants:**
  - `sm`:
    - Classes: `p-3 gap-2`
    - Dimensions:
      - calendarWidth: 168
      - cellHeight: 22
      - cellWidth: 24
      - textSize: 12
      - iconSize: 14
      - padding: 12
      - gap: 8
  - `base`:
    - Classes: `p-4 gap-2.5`
    - Dimensions:
      - calendarWidth: 196
      - cellHeight: 26
      - cellWidth: 28
      - textSize: 14
      - iconSize: 16
      - padding: 16
      - gap: 10
  - `lg`:
    - Classes: `p-5 gap-3`
    - Dimensions:
      - calendarWidth: 252
      - cellHeight: 32
      - cellWidth: 36
      - textSize: 16
      - iconSize: 18
      - padding: 20
      - gap: 12

---

### Dialog

Dialog component

**Type:** component

**Import:** `import { Dialog } from "@company/kumo";`

**Category:** Overlay

**Props:**

- `className`: string
  Additional CSS classes merged via `cn()`.
- `children`: ReactNode
  Dialog content (typically Title, Description, Close, and action buttons).
- `container`: PortalContainer
  Container element for the portal. Use this to render the dialog inside a Shadow DOM or custom container. Overrides `KumoPortalProvider` context.
- `size`: enum [default: base]
  - `"base"`: Default dialog width (384px)
  - `"sm"`: Small dialog for simple confirmations (288px)
  - `"lg"`: Large dialog for complex content (512px)
  - `"xl"`: Extra large dialog for detailed views (768px)

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-recessed`, `ring-zenth-line`, `text-zenth-default`

**Styling:**

- **Dimensions:** `[object Object]`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Dialog.Root

Root sub-component

#### Dialog.Trigger

Trigger sub-component

#### Dialog.Title

Title sub-component

#### Dialog.Description

Description sub-component

#### Dialog.Close

Close sub-component


---

### DropdownMenu

DropdownMenu — accessible dropdown menu anchored to a trigger.

**Type:** component

**Import:** `import { DropdownMenu } from "@company/kumo";`

**Category:** Overlay

**Props:**

- `variant`: enum [default: default]
  - `"default"`: Default dropdown item appearance
  - `"danger"`: Destructive action item

**Colors (kumo tokens used):**

`bg-zenth-control`, `bg-zenth-danger`, `bg-zenth-hairline`, `bg-zenth-tint`, `ring-zenth-brand`, `ring-zenth-line`, `text-zenth-danger`, `text-zenth-default`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### DropdownMenu.Trigger

Trigger sub-component

#### DropdownMenu.Portal

Portal sub-component

#### DropdownMenu.Positioner

Positioner sub-component

#### DropdownMenu.Popup

Popup sub-component

#### DropdownMenu.Sub

Sub sub-component (wraps DropdownMenuPrimitive)

#### DropdownMenu.SubTrigger

SubTrigger sub-component

Props:
- `icon`: Icon - Icon displayed before the label.
- `inset`: boolean - Adds left padding to align with items that have icons.

#### DropdownMenu.SubContent

SubContent sub-component

#### DropdownMenu.Content

Content sub-component

Props:
- `sideOffset`: number [default: 8] - Distance in pixels from the trigger.
- `container`: PortalContainer - Container element for the portal. Use this to render inside a Shadow DOM or custom container.

#### DropdownMenu.Item

Item sub-component

Props:
- `icon`: Icon | ReactNode - Icon displayed before the label.
- `variant`: "default" | "danger" [default: "default"] - Visual style of the item.
- `selected`: boolean - Shows a check mark indicator when true.
- `inset`: boolean - Adds left padding to align with items that have icons.
- `onClick`: (event: React.MouseEvent) => void - Callback when the item is clicked.
- `closeOnClick`: boolean [default: true] - Whether the menu closes after clicking this item.
- `disabled`: boolean - When true, the item cannot be interacted with.

#### DropdownMenu.LinkItem

LinkItem sub-component

Props:
- `href`: string - URL to navigate to when clicked.
- `icon`: Icon | ReactNode - Icon displayed before the label.
- `variant`: "default" | "danger" [default: "default"] - Visual style of the item.
- `inset`: boolean - Adds left padding to align with items that have icons.
- `target`: string - Link target attribute (e.g. "_blank" for new tab).
- `render`: ReactElement | ((props, state) => ReactElement) - Custom element to render as the link. Use to integrate with framework routers (e.g. Next.js Link).

#### DropdownMenu.CheckboxItem

CheckboxItem sub-component

Props:
- `checked`: boolean - Whether the item is checked.
- `defaultChecked`: boolean [default: false] - Whether the item is initially checked (uncontrolled).
- `onCheckedChange`: (checked: boolean, event: ChangeEventDetails) => void - Callback when the checked state changes.
- `closeOnClick`: boolean [default: false] - Whether the menu closes after clicking this item.
- `disabled`: boolean - When true, the item cannot be interacted with.

#### DropdownMenu.RadioGroup

RadioGroup sub-component (wraps DropdownMenuPrimitive)

Props:
- `value`: any - The controlled value of the currently selected radio item.
- `defaultValue`: any - The initially selected value (uncontrolled).
- `onValueChange`: (value: any, event: ChangeEventDetails) => void - Callback when the selected value changes.
- `disabled`: boolean - When true, all radio items in the group are disabled.

#### DropdownMenu.RadioItem

RadioItem sub-component

Props:
- `value`: any (required) - The value of this radio item.
- `icon`: Icon | ReactNode - Icon displayed before the label.
- `inset`: boolean - Adds left padding to align with items that have icons.
- `closeOnClick`: boolean [default: false] - Whether the menu closes after clicking this item.
- `disabled`: boolean - When true, the item cannot be interacted with.

#### DropdownMenu.RadioItemIndicator

RadioItemIndicator sub-component

#### DropdownMenu.Label

Label sub-component

Props:
- `inset`: boolean - Adds left padding to align with items that have icons.

#### DropdownMenu.Separator

Separator sub-component

#### DropdownMenu.Shortcut

Shortcut sub-component

#### DropdownMenu.Group

Group sub-component (wraps DropdownMenuPrimitive)


---

### Empty

Placeholder shown when a list, table, or page has no content to display.

**Type:** component

**Import:** `import { Empty } from "@company/kumo";`

**Category:** Display

**Props:**

- `size`: enum [default: base]
  - `"sm"`: Compact empty state for smaller containers
  - `"base"`: Default empty state size
  - `"lg"`: Large empty state for prominent placement
- `icon`: ReactNode
  Decorative icon displayed above the title (e.g. from `@phosphor-icons/react`).
- `title`: string (required)
  Primary heading text for the empty state.
- `description`: string
  Secondary description text displayed below the title.
- `commandLine`: string
  Shell command displayed in a copyable code block.
- `contents`: ReactNode
  Additional content (buttons, links) rendered below the description.
- `className`: string
  Additional CSS classes merged via `cn()`.

**Colors (kumo tokens used):**

`bg-zenth-control`, `bg-zenth-overlay`, `border-zenth-fill`, `ring-zenth-line`, `text-zenth-default`, `text-zenth-subtle`, `text-zenth-success`

---

### Field

Form field wrapper that provides a label, optional description, and error display around any form control. Built on Base UI Field primitives.

**Type:** component

**Import:** `import { Field } from "@company/kumo";`

**Category:** Input

**Props:**

- `controlFirst`: boolean
  When `true`, places the control before the label (for checkbox/switch layouts).
- `children`: ReactNode
  The form control element(s) to wrap (Input, Select, Checkbox, etc.).
- `label`: ReactNode
  The label content — can be a string or any React node.
- `required`: boolean
  When explicitly `false`, shows gray "(optional)" text after the label. When `true` or `undefined`, no indicator is shown.
- `labelTooltip`: ReactNode
  Tooltip content displayed next to the label via an info icon.
- `error`: object
  Validation error with a message and a browser `ValidityState` match key.
- `description`: ReactNode
  Helper text displayed below the control (hidden when `error` is present).
- `hideLabel`: boolean
  When `true`, Field renders layout, description, and error but skips the `<label>` element. Use when the child component provides its own accessible label (e.g. Select uses Base UI's `Select.Label` to avoid hover/focus coupling from native `<label>`).

**Colors (kumo tokens used):**

`text-zenth-danger`, `text-zenth-default`, `text-zenth-subtle`

---

### GlobeMap

GlobeMap — an SVG orthographic globe with hatched land and geographic markers. Rendering is SVG-only and does not use WebGL.

**Type:** component

**Import:** `import { GlobeMap } from "@company/kumo";`

**Category:** Data Visualization

**Props:**

- `landColor`: string
  Stroke color for the hatched land. Defaults to the neutral Kumo map area color.
- `landHatchSpacing`: number
  Spacing between land hatch lines in view-box pixels. Default: `10`.
- `oceanColor`: string
  Fill behind the land and graticule. Default: the Kumo base surface.
- `markers`: GlobeMapMarker[]
  Geographic points drawn above the land. Points fade at the horizon and back-facing points are hidden.
- `markerColor`: string
  Default marker fill. Defaults to the Kumo chart blue.
- `markerRadius`: number
  Default marker radius in view-box pixels. Default: `7`.
- `defaultRotation`: number[]
  Initial globe rotation as `[longitude, latitude, roll]`.
- `autoRotate`: boolean
  Continuously rotate the globe horizontally. Default: `false`.
- `autoRotateSpeed`: number
  Horizontal auto-rotation speed in degrees per second. Default: `4`.
- `showGraticule`: boolean
  Draw latitude and longitude guides. Default: `false`.
- `showTooltip`: boolean
  Show the Kumo-styled marker tooltip. Default: `true`.
- `height`: number
  Fixed component height. Otherwise the globe uses a square aspect ratio.
- `className`: string
- `isDarkMode`: boolean

**Colors (kumo tokens used):**

`bg-zenth-base`, `border-zenth-line`, `text-zenth-default`, `text-zenth-subtle`

---

### Grid

Responsive CSS grid layout container with preset column configurations.

**Type:** component

**Import:** `import { Grid } from "@company/kumo";`

**Category:** Layout

**Props:**

- `children`: ReactNode
  Grid items to render.
- `className`: string
  Additional CSS classes merged via `cn()`.
- `id`: string
- `lang`: string
- `title`: string
- `mobileDivider`: boolean
  Show dividers between grid items on mobile (only works with `"4up"` variant).
- `gap`: enum [default: base]
  - `"none"`: No gap between grid items
  - `"sm"`: Small gap between grid items
  - `"base"`: Default responsive gap between grid items
  - `"lg"`: Large gap between grid items
- `variant`: enum
  - `"2up"`: Grid items stack on small screens, display side-by-side on medium screens and up
  - `"side-by-side"`: Grid items always displayed side-by-side
  - `"2-1"`: Two-thirds / one-third split (66%/33%) on medium screens and up
  - `"1-2"`: One-third / two-thirds split (33%/66%) on medium screens and up
  - `"1-3up"`: Grid items stack on small screens, expand to 3 across on large screens
  - `"3up"`: Grid items stack on small screens, 2 across on medium, 3 across on large
  - `"4up"`: Grid items stack on small screens, progressively increase columns at larger breakpoints
  - `"6up"`: Grid items start at 2 across, expand to 6 across on XL
  - `"1-2-4up"`: Grid items stack on small screens, 2 across on medium, 4 across on large

**Colors (kumo tokens used):**

`border-zenth-hairline`

---

### InlineCopyText

Compact, borderless copy control for IDs and other short values displayed inline or inside dense table cells.

**Type:** component

**Import:** `import { InlineCopyText } from "@company/kumo";`

**Category:** Action

**Props:**

- `labels`: InlineCopyTextLabels
  Accessible labels for localization.
- `children`: ReactNode
  Content to display. String children are copied unless `value` is provided.
- `value`: string
  The value to copy. Required when `children` is not a string.
- `size`: "xs" | "sm" | "base" | "lg"
  Text size. Supported values depend on the text variant.
- `bold`: boolean
  Whether to use medium font weight. Only applies to body text variants.
- `as`: enum
  The HTML element to render. Accepts headings (`"h1"`–`"h6"`), block text (`"p"`, `"pre"`), inline text (`"span"`, `"code"`, `"em"`, `"strong"`, `"small"`, `"abbr"`, `"time"`), form-related (`"label"`, `"legend"`), list/definition (`"dt"`, `"dd"`, `"li"`), and `"figcaption"`.

- **Optional** for `"heading"` (defaults to `"span"`). Pass the heading   element that reflects this text's place in the document outline.
- **Required** for deprecated heading variants (`"heading1"`,   `"heading2"`, `"heading3"`).
- **Optional** for body variants (defaults to `"p"`) and monospace   variants (defaults to `"span"`).
- `truncate`: boolean
  Whether to truncate overflowing text with an ellipsis. Adds `truncate min-w-0` classes.
- `disabled`: boolean
- `name`: string
- `type`: enum
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `variant`: "body" | "secondary" | "success" | "error" | "mono" | "mono-secondary" [default: "mono-secondary"]
  Text style variant. Supports every Text variant except heading variants.

**Colors (kumo tokens used):**

`ring-zenth-brand`, `text-zenth-default`

**Styling:**


---

### Input

Input component

**Type:** component

**Import:** `import { Input } from "@company/kumo";`

**Category:** Input

**Props:**

- `label`: ReactNode
  Label content for the input (enables Field wrapper) - can be a string or any React node
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `description`: ReactNode
  Helper text displayed below the input
- `error`: string | object
  Error message or validation error object
- `passwordManagerIgnore`: boolean
  Suppress browser extension password manager overlays on non-credential inputs.
- `size`: enum [default: base]
  - `"xs"`: Extra small input for compact UIs
  - `"sm"`: Small input for secondary fields
  - `"base"`: Default input size
  - `"lg"`: Large input for prominent fields
- `variant`: enum [default: default]
  - `"default"`: Default input appearance
  - `"error"`: Error state for validation failures

  **State Classes:**
  - `"default"`:
    - `focus`: `focus:ring-zenth-focus/50 focus:ring-[1.5px]`
  - `"error"`:
    - `focus`: `focus:ring-zenth-danger/50 focus:ring-[1.5px]`

**Colors (kumo tokens used):**

`bg-zenth-control`, `ring-zenth-danger`, `ring-zenth-focus`, `ring-zenth-line`, `text-zenth-default`, `text-zenth-inactive`

**Styling:**

- **Dimensions:** `[object Object]`

---

### InputGroup

InputGroup component

**Type:** component

**Import:** `import { InputGroup } from "@company/kumo";`

**Category:** Input

**Props:**

- `label`: ReactNode
  The label content — can be a string or any React node.
- `description`: ReactNode
  Helper text displayed below the control (hidden when `error` is present).
- `error`: object
  Validation error with a message and a browser `ValidityState` match key.
- `required`: boolean
  When explicitly `false`, shows gray "(optional)" text after the label. When `true` or `undefined`, no indicator is shown.
- `labelTooltip`: ReactNode
  Tooltip content displayed next to the label via an info icon.
- `children`: ReactNode
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `size`: enum [default: base]
  - `"xs"`: Extra small size.
  - `"sm"`: Small size.
  - `"base"`: Default size.
  - `"lg"`: Large size.
- `disabled`: boolean

**Colors (kumo tokens used):**

`border-zenth-focus`, `border-zenth-line`, `ring-zenth-danger`, `ring-zenth-focus`, `ring-zenth-line`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### InputGroup.Input

Input sub-component

#### InputGroup.Button

Button sub-component

Props:
- `tooltip`: ReactNode - When provided, wraps the button in a Tooltip. Automatically sets aria-label from a string value.
- `tooltipSide`: "top" | "right" | "bottom" | "left" [default: "bottom"] - Preferred side for the tooltip popup.
- `variant`: "primary" | "secondary" | "ghost" | "destructive" | "secondary-destructive" | "outline" [default: "ghost"] - Button visual style. Defaults to ghost.
- `size`: "xs" | "sm" | "base" | "lg" [default: "sm"] - Button size.

#### InputGroup.Addon

Addon sub-component

Props:
- `align`: "start" | "end" [default: "start"] - Position relative to the input.
- `className`: string - Additional CSS classes.

#### InputGroup.Suffix

Suffix sub-component

Props:
- `className`: string - Additional CSS classes.

#### InputGroup.Label

Label sub-component

#### InputGroup.Description

Description sub-component


---

### Label

Label component for form fields.

**Type:** component

**Import:** `import { Label } from "@company/kumo";`

**Category:** Other

**Props:**

- `children`: ReactNode
  The label content — can be a string or any React node.
- `showOptional`: boolean
  When `true`, shows gray "(optional)" text after the label.
- `optionalLabel`: ReactNode
  Content shown when `showOptional` is `true`.
- `tooltip`: ReactNode
  Tooltip content displayed next to the label via an info icon.
- `tooltipAriaLabel`: string
  Accessible label for the tooltip button.
- `className`: string
  Additional CSS classes merged via `cn()`.
- `htmlFor`: string
  The id of the form element this label is associated with
- `asContent`: boolean
  When true, only renders the inline content (indicators, tooltip) without the outer label element with font styling. Useful when composed inside another label element that already provides the text styling.

**Colors (kumo tokens used):**

`text-zenth-default`, `text-zenth-subtle`

---

### LayerCard

LayerCard component

**Type:** component

**Import:** `import { LayerCard } from "@company/kumo";`

**Category:** Display

**Props:**

- `render`: ReactNode
  Allows you to replace the component's HTML element with a different tag, or compose it with another component.

Accepts a `ReactElement` or a function that returns the element to render.
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `children`: ReactNode

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-elevated`, `ring-zenth-fill`, `ring-zenth-hairline`, `ring-zenth-line`, `text-zenth-subtle`

**Styling:**


**Sub-Components:**

This is a compound component. Use these sub-components:

#### LayerCard.Primary

Primary sub-component

#### LayerCard.Secondary

Secondary sub-component


---

### LayerDialog

LayerDialog component

**Type:** component

**Import:** `import { LayerDialog } from "@company/kumo";`

**Category:** Overlay

**Props:**

- `dismissDisabled`: boolean
  Prevent every user-initiated dismissal while dialog work is pending.

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-contrast`, `bg-zenth-elevated`, `bg-zenth-fill`, `bg-zenth-hairline`, `bg-zenth-recessed`, `border-zenth-hairline`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### LayerDialog.Root

Root sub-component

#### LayerDialog.Alert

Alert sub-component

#### LayerDialog.Trigger

Trigger sub-component

#### LayerDialog.Content

Content sub-component

#### LayerDialog.Title

Title sub-component

#### LayerDialog.Description

Description sub-component

#### LayerDialog.Body

Body sub-component

#### LayerDialog.Separator

Separator sub-component

#### LayerDialog.Action

Action sub-component

#### LayerDialog.Actions

Actions sub-component


---

### Link

Link component

**Type:** component

**Import:** `import { Link } from "@company/kumo";`

**Category:** Other

**Props:**

- `variant`: enum [default: inline]
  - `"inline"`: Inline text link that flows with content
  - `"current"`: Link that inherits color from parent text
  - `"plain"`: Link without underline decoration
- `to`: string
- `children`: ReactNode
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `download`: unknown
- `href`: string
- `hrefLang`: string
- `media`: string
- `ping`: string
- `target`: React.HTMLAttributeAnchorTarget
- `type`: string
- `referrerPolicy`: enum
- `render`: ReactNode
  Allows you to replace the component's HTML element with a different tag, or compose it with another component.

Accepts a `ReactElement` or a function that returns the element to render.

**Colors (kumo tokens used):**

`text-zenth-link`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Link.ExternalIcon

ExternalIcon sub-component


---

### Loader

Animated circular spinner for indicating loading states.

**Type:** component

**Import:** `import { Loader } from "@company/kumo";`

**Category:** Feedback

**Props:**

- `className`: string
  Additional CSS classes merged via `cn()`.
- `size`: enum [default: base]
  - `"sm"`: Small loader for inline use
  - `"base"`: Default loader size
  - `"lg"`: Large loader for prominent loading states

---

### MenuBar

MenuBar — horizontal icon-button toolbar with keyboard arrow-key navigation.

**Type:** component

**Import:** `import { MenuBar } from "@company/kumo";`

**Category:** Navigation

**Props:**

- `className`: string
  Additional CSS classes merged via `cn()`.
- `isActive`: number | boolean | string
  The currently active option value — matched against option index or `id`.
- `options`: MenuOptionProps[] (required)
  Array of menu option configurations.
- `optionIds`: boolean
  When true, each option's `id` field is used for matching instead of its array index.

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-recessed`, `border-zenth-recessed`, `ring-zenth-brand`, `ring-zenth-focus`, `ring-zenth-line`

**Styling:**


---

### Meter

Progress bar showing a measured value within a known range (e.g. quota usage).

**Type:** component

**Import:** `import { Meter } from "@company/kumo";`

**Category:** Display

**Props:**

- `customValue`: string
  Custom formatted value text (e.g. "750 / 1,000") displayed instead of percentage.
- `label`: string (required)
  Label text displayed above the meter track.
- `showValue`: boolean
  Whether to display the percentage value next to the label.
- `trackClassName`: string
  Additional CSS classes for the track (background bar).
- `indicatorClassName`: string
  Additional CSS classes for the indicator (filled bar).
- `value`: number
  Current value of the meter
- `max`: number
  Maximum value of the meter (default: 100)
- `min`: number
  Minimum value of the meter (default: 0)

**Colors (kumo tokens used):**

`bg-zenth-fill`, `text-zenth-default`, `text-zenth-subtle`

---

### Pagination

Pagination component

**Type:** component

**Import:** `import { Pagination } from "@company/kumo";`

**Category:** Navigation

**Props:**

- `setPage`: (page: number) => void (required)
  Callback when page changes
- `page`: number
  Current page number (1-indexed).
- `perPage`: number
  Number of items displayed per page.
- `totalCount`: number
  Total number of items across all pages.
- `hasNextPage`: boolean
  Whether another page exists when the total count is unknown. Ignored when `totalCount` is provided. Unknown totals use sequential controls only.
- `className`: string
  Additional CSS classes for the container
- `labels`: PaginationLabels
  Labels for internationalization of aria-labels. All labels have English defaults.

For visible text like "Showing X of Y", use render props on sub-components:
- `Pagination.Info` children for the info text
- `Pagination.PageSize` label prop for the "Per page:" text
- `children`: ReactNode
  Compound component children for custom layouts. Use Pagination.Info, Pagination.PageSize, Pagination.Controls, and Pagination.Separator.
- `controls`: enum [default: full]
  - `"full"`: Full pagination controls with first, previous, page input, next, and last buttons
  - `"simple"`: Simple pagination controls with only previous and next buttons
- `text`: object

**Colors (kumo tokens used):**

`border-zenth-hairline`, `ring-zenth-hairline`, `text-zenth-subtle`

**Styling:**


**Sub-Components:**

This is a compound component. Use these sub-components:

#### Pagination.Info

Info sub-component

#### Pagination.PageSize

PageSize sub-component

#### Pagination.Controls

Controls sub-component

#### Pagination.Separator

Separator sub-component


---

### Popover

Popover component for displaying accessible popup content anchored to a trigger.

**Type:** component

**Import:** `import { Popover } from "@company/kumo";`

**Category:** Overlay

**Props:**

- `side`: enum [default: bottom]
  - `"top"`: Popover appears above the trigger
  - `"bottom"`: Popover appears below the trigger
  - `"left"`: Popover appears to the left of the trigger
  - `"right"`: Popover appears to the right of the trigger

**Colors (kumo tokens used):**

`bg-zenth-base`, `fill-zenth-arrow-edge`, `fill-zenth-arrow-stroke`, `fill-zenth-base`, `outline-zenth-line`, `text-zenth-default`, `text-zenth-subtle`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Popover.Root

Root sub-component

#### Popover.Trigger

Trigger sub-component

#### Popover.Portal

Portal sub-component

#### Popover.Backdrop

Backdrop sub-component

#### Popover.Positioner

Positioner sub-component

#### Popover.Popup

Popup sub-component

#### Popover.Arrow

Arrow sub-component

#### Popover.Viewport

Viewport sub-component

#### Popover.Content

Content sub-component

#### Popover.Title

Title sub-component

#### Popover.Description

Description sub-component

#### Popover.Close

Close sub-component


---

### Radio

Radio — radio button group for single-select choices.

**Type:** component

**Import:** `import { Radio } from "@company/kumo";`

**Category:** Input

**Props:**

- `variant`: enum [default: default]
  - `"default"`: Default radio appearance
  - `"error"`: Error state for validation failures
- `appearance`: enum [default: default]
  - `"default"`: Standard inline radio item
  - `"card"`: Choice card appearance with border, padding, and highlighted selection state
  - `"segmented"`: Compact grouped-button appearance for short, mutually exclusive options

  **State Classes:**
  - `"card"`:
    - `hover`: `hover:not-has-data-checked:bg-zenth-elevated`
  - `"segmented"`:
    - `hover`: `hover:not-has-data-disabled:not-has-data-checked:before:bg-zenth-contrast/7`
- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements
- `value`: T
  The controlled value of the selected radio item.
- `defaultValue`: T
  The uncontrolled initial value of the selected radio item.
- `onValueChange`: (value: T, eventDetails: RadioGroupChangeEventDetails) => void
  Callback fired when the selected value changes. The second argument carries native event details about the interaction.

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-contrast`, `bg-zenth-control`, `bg-zenth-elevated`, `bg-zenth-tint`, `border-zenth-danger`, `border-zenth-hairline`, `border-zenth-interact`, `border-zenth-line`, `outline-zenth-brand`, `ring-zenth-brand`, `ring-zenth-danger`, `ring-zenth-focus`, `ring-zenth-hairline`, `ring-zenth-line`, `text-zenth-danger`, `text-zenth-default`, `text-zenth-inverse`, `text-zenth-subtle`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Radio.Item

Item sub-component

#### Radio.Group

Group sub-component

Props:
- `value`: T - The controlled value of the selected radio item.
- `defaultValue`: T - The uncontrolled initial value of the selected radio item.
- `onValueChange`: (value: T, eventDetails: RadioGroupChangeEventDetails) => void - Callback fired when the selected value changes. The second argument carries native event details about the interaction.

#### Radio.Legend

Legend sub-component


---

### SankeyChart

SankeyChart component

**Type:** component

**Import:** `import { SankeyChart } from "@company/kumo";`

**Category:** Data Visualization

**Props:**

- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

---

### Select

Select component

**Type:** component

**Import:** `import { Select } from "@company/kumo";`

**Category:** Input

**Props:**

- `align`: enum
  How to align the popup relative to the specified side.
- `alignItemWithTrigger`: boolean
  Whether the positioner overlaps the trigger so the selected item's text is aligned with the trigger's value text. This only applies to mouse input and is automatically disabled if there is not enough space.
- `alignOffset`: number | OffsetFunction
  Additional offset along the alignment axis in pixels. Also accepts a function that returns the offset to read the dimensions of the anchor and positioner elements, along with its side and alignment.

The function takes a `data` object parameter with the following properties:
- `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
- `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
- `data.side`: which side of the anchor element the positioner is aligned against.
- `data.align`: how the positioner is aligned relative to the specified side.
- `anchor`: ReactNode
  An element to position the popup against. By default, the popup will be positioned against the trigger.
- `arrowPadding`: number
  Minimum distance to maintain between the arrow and the edges of the popup.

Use it to prevent the arrow element from hanging out of the rounded corners of a popup.
- `collisionAvoidance`: CollisionAvoidance
  Determines how to handle collisions when positioning the popup.

`side` controls overflow on the preferred placement axis (`top`/`bottom` or `left`/`right`):
- `'flip'`: keep the requested side when it fits; otherwise try the opposite side   (`top` and `bottom`, or `left` and `right`).
- `'shift'`: never change side; keep the requested side and move the popup within   the clipping boundary so it stays visible.
- `'none'`: do not correct side-axis overflow.

`align` controls overflow on the alignment axis (`start`/`center`/`end`):
- `'flip'`: keep side, but swap `start` and `end` when the requested alignment overflows.
- `'shift'`: keep side and requested alignment, then nudge the popup along the   alignment axis to fit.
- `'none'`: do not correct alignment-axis overflow.

`fallbackAxisSide` controls fallback behavior on the perpendicular axis when the preferred axis cannot fit:
- `'start'`: allow perpendicular fallback and try the logical start side first   (`top` before `bottom`, or `left` before `right` in LTR).
- `'end'`: allow perpendicular fallback and try the logical end side first   (`bottom` before `top`, or `right` before `left` in LTR).
- `'none'`: do not fallback to the perpendicular axis.

When `side` is `'shift'`, explicitly setting `align` only supports `'shift'` or `'none'`. If `align` is omitted, it defaults to `'flip'`.
- `collisionBoundary`: Boundary
  An element or a rectangle that delimits the area that the popup is confined to.
- `collisionPadding`: Padding
  Additional space to maintain from the edge of the collision boundary.
- `disableAnchorTracking`: boolean
  Whether to disable the popup from tracking any layout shift of its positioning anchor.
- `positionMethod`: enum
  Determines which CSS `position` property to use.
- `side`: enum
  Which side of the anchor element to align the popup against. May automatically change to avoid collisions.
- `sideOffset`: number | OffsetFunction
  Distance between the anchor and the popup in pixels. Also accepts a function that returns the distance to read the dimensions of the anchor and positioner elements, along with its side and alignment.

The function takes a `data` object parameter with the following properties:
- `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
- `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
- `data.side`: which side of the anchor element the positioner is aligned against.
- `data.align`: how the positioner is aligned relative to the specified side.
- `sticky`: boolean
  Whether to maintain the popup in the viewport after the anchor element was scrolled out of view.
- `className`: string
  Additional CSS classes merged via `cn()`.
- `render`: ReactNode
  Replaces the trigger element while preserving Select behavior.
- `size`: enum [default: base]
  Size of the select trigger. Matches Input component sizes.
- `label`: ReactNode
  Label content for the select. When provided, enables the Field wrapper with a visible label above the select. For accessibility without a visible label, use `aria-label` instead.
- `hideLabel`: boolean
- `placeholder`: string
  Placeholder text shown when no value is selected.
- `loading`: boolean
  When `true`, shows a skeleton loader in place of the selected value.
- `disabled`: boolean
  Whether the select is disabled.
- `required`: boolean
  Whether the select is required. When `false`, shows "(optional)" text.
- `labelTooltip`: ReactNode
  Tooltip content displayed next to the label via an info icon.
- `value`: T
  Currently selected value (controlled mode).
- `children`: ReactNode
  `Select.Option` elements to render in the dropdown.
- `description`: ReactNode
  Helper text displayed below the select.
- `error`: string | object
  Error message string or validation error object with `match` key.
- `onValueChange`: (value: T) => void
  Callback when selection changes
- `defaultValue`: T
  Initial value for uncontrolled mode
- `renderValue`: (value: T) => ReactNode
  A function that returns a ReactNode to format the selected value in the trigger. Required when using object values. Use `placeholder` for the empty state.
- `items`: Record<string, string> | Array<{ label: ReactNode; value: T }>
  Data structure of items rendered in the popup. Accepts a plain object map (`{ key: "Label" }`) or an array of `{ label, value }` for object/complex values.
- `isItemEqualToValue`: (item: T, value: T) => boolean
  Custom equality function for comparing items. Required when value is an object, since object identity (`===`) won't match across renders.

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-control`, `bg-zenth-hairline`, `bg-zenth-tint`, `border-zenth-line`, `ring-zenth-brand`, `ring-zenth-danger`, `ring-zenth-focus`, `ring-zenth-line`, `text-zenth-danger`, `text-zenth-default`, `text-zenth-placeholder`, `text-zenth-subtle`

**Styling:**


**Sub-Components:**

This is a compound component. Use these sub-components:

#### Select.Option

Option sub-component

#### Select.Group

Group sub-component

#### Select.GroupLabel

GroupLabel sub-component

#### Select.Separator

Separator sub-component


---

### SensitiveInput

Password/secret input that masks its value by default and reveals on click. Includes a built-in copy-to-clipboard button on hover.

**Type:** component

**Import:** `import { SensitiveInput } from "@company/kumo";`

**Category:** Other

**Props:**

- `alt`: string
- `autoComplete`: React.HTMLInputAutoCompleteAttribute
- `checked`: boolean
- `disabled`: boolean
- `height`: number | string
- `list`: string
- `name`: string
- `placeholder`: string
- `readOnly`: boolean
- `required`: boolean
- `width`: number | string
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `children`: ReactNode
- `value`: string
  Controlled value
- `size`: enum [default: base]
  Size of the input.
- `"xs"` — Extra small for compact UIs
- `"sm"` — Small for secondary fields
- `"base"` — Default input size
- `"lg"` — Large for prominent fields
- `variant`: enum [default: default]
  Style variant of the input.
- `"default"` — Default input appearance
- `"error"` — Error state for validation failures
- `label`: ReactNode
  Label content for the input (enables Field wrapper and sets masked state label) - can be a string or any React node
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `description`: ReactNode
  Helper text displayed below the input
- `error`: string | object
  Error message or validation error object

**Colors (kumo tokens used):**

`bg-zenth-brand`, `bg-zenth-control`, `outline-zenth-focus`, `ring-zenth-brand`, `ring-zenth-focus`, `text-zenth-default`, `text-zenth-subtle`

---

### Sidebar

Sidebar — responsive navigation panel with expand/collapse support.

**Type:** component

**Import:** `import { Sidebar } from "@company/kumo";`

**Category:** Other

**Props:**

- `defaultOpen`: boolean
  Initial open state when uncontrolled.
- `open`: boolean
  Controlled open state.
- `variant`: enum [default: sidebar]
  - `"sidebar"`: Standard sidebar with border separator
  - `"floating"`: Floating sidebar with shadow and rounded corners
  - `"inset"`: Inset sidebar within the content area
- `side`: enum [default: left]
  - `"left"`: Left-aligned sidebar
  - `"right"`: Right-aligned sidebar
- `collapsible`: enum [default: icon]
  - `"icon"`: Collapses to show icons only
  - `"offcanvas"`: Slides off screen when collapsed
  - `"none"`: Cannot be collapsed
- `resizable`: boolean
  Enable drag-to-resize on the sidebar edge.
- `defaultWidth`: number
  Initial width in pixels when resizable.
- `minWidth`: number
  Minimum width in pixels when resizing.
- `maxWidth`: number
  Maximum width in pixels when resizing.
- `contained`: boolean
  When true, the collapsed sidebar uses absolute positioning instead of fixed, keeping it scoped inside a bounded parent. Useful for demos and embedded sidebars.
- `peekable`: boolean
  When true, hovering or focusing the collapsed sidebar temporarily expands it. The `state` will be `"peeking"` during the peek. Moving away collapses it back.
- `animationDuration`: number
  Duration of sidebar expand/collapse animation in milliseconds.
- `mobileBreakpoint`: number
  Viewport width (in px) below which the sidebar renders as a mobile dialog sheet instead of the desktop aside rail.
- `children`: ReactNode
  Content — typically `<Sidebar>` + main content.
- `className`: string
  Additional CSS classes for the wrapper div.

**Colors (kumo tokens used):**

`bg-zenth-brand`, `bg-zenth-hairline`, `bg-zenth-line`, `bg-zenth-recessed`, `border-zenth-line`, `ring-zenth-brand`, `text-zenth-default`, `text-zenth-strong`, `text-zenth-subtle`

**Styling:**


**Sub-Components:**

This is a compound component. Use these sub-components:

#### Sidebar.Provider

Provider sub-component

#### Sidebar.Header

Header sub-component

#### Sidebar.Content

Content sub-component

#### Sidebar.Footer

Footer sub-component

#### Sidebar.Loading

Loading sub-component

#### Sidebar.Group

Group sub-component

#### Sidebar.GroupLabel

GroupLabel sub-component

#### Sidebar.Menu

Menu sub-component

#### Sidebar.MenuItem

MenuItem sub-component

#### Sidebar.MenuButton

MenuButton sub-component

#### Sidebar.MenuBadge

MenuBadge sub-component

#### Sidebar.MenuSub

MenuSub sub-component

#### Sidebar.MenuSubItem

MenuSubItem sub-component

#### Sidebar.MenuSubButton

MenuSubButton sub-component

#### Sidebar.Separator

Separator sub-component

#### Sidebar.Trigger

Trigger sub-component

#### Sidebar.Close

Close sub-component

#### Sidebar.Rail

Rail sub-component

#### Sidebar.ResizeHandle

ResizeHandle sub-component

#### Sidebar.MenuChevron

MenuChevron sub-component

Props:
- `className`: string

#### Sidebar.Collapsible

Collapsible sub-component

#### Sidebar.CollapsibleTrigger

CollapsibleTrigger sub-component

#### Sidebar.CollapsibleContent

CollapsibleContent sub-component

#### Sidebar.SlidingViews

SlidingViews sub-component

#### Sidebar.SlidingView

SlidingView sub-component


---

### Slider

Slider component

**Type:** component

**Import:** `import { Slider } from "@company/kumo";`

**Category:** Input

**Props:**

- `size`: enum [default: base]
  - `"sm"`: Compact slider for dense layouts
  - `"base"`: Default slider size
- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements
- `value`: number | readonly number[]
  Controlled value. Pass an array to render one thumb per value (a range).
- `defaultValue`: number | readonly number[]
  Uncontrolled initial value. Pass an array to render one thumb per value (a range).
- `onValueChange`: (value: number | readonly number[], eventDetails: SliderRoot.ChangeEventDetails) => void
  Called when the value changes while dragging or from the keyboard
- `min`: number
  Minimum value of the slider (default: 0)
- `max`: number
  Maximum value of the slider (default: 100)
- `step`: number
  Amount the value changes per step (default: 1)
- `format`: Intl.NumberFormatOptions
  Formats the value badges, range labels, and the value announced to assistive technology
- `disabled`: boolean
  Whether the slider is disabled

**Colors (kumo tokens used):**

`bg-zenth-contrast`, `bg-zenth-fill`, `bg-zenth-overlay`, `bg-zenth-recessed`, `ring-zenth-focus`, `ring-zenth-line`, `text-zenth-default`, `text-zenth-inverse`, `text-zenth-subtle`

---

### Surface

Surface component

**Type:** component

**Import:** `import { Surface } from "@company/kumo";`

**Category:** Layout

**Props:**

- `as`: React.ElementType
- `render`: ReactNode
  Allows you to replace the component's HTML element with a different tag, or compose it with another component.

Accepts a `ReactElement` or a function that returns the element to render.
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `children`: ReactNode

---

### Switch

Switch component

**Type:** component

**Import:** `import { Switch } from "@company/kumo";`

**Category:** Input

**Props:**

- `variant`: enum [default: default]
  - `"default"`: Default switch with squircle shape and brand blue color
  - `"neutral"`: Monochrome switch with squircle shape for subtle toggles
- `label`: ReactNode
  Label content for the switch (Field wrapper is built-in) - can be a string or any React node. Optional when used standalone for visual-only purposes.
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `required`: boolean
  Whether the switch is required. When explicitly false, shows "(optional)" text after the label.
- `controlFirst`: boolean
  When true (default), switch appears before label. When false, label appears before switch.
- `size`: enum [default: base]
  - `"sm"`: Small switch for compact UIs
  - `"base"`: Default switch size
  - `"lg"`: Large switch for prominent toggles
- `checked`: boolean
- `disabled`: boolean
- `transitioning`: boolean
- `name`: string
- `type`: enum
- `value`: string | string[] | number
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `onClick`: (event: React.MouseEvent) => void (required)
  Callback when switch is clicked

**Colors (kumo tokens used):**

`bg-zenth-base`, `ring-zenth-brand`, `ring-zenth-focus`, `ring-zenth-hairline`, `text-zenth-danger`, `text-zenth-default`, `text-zenth-subtle`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Switch.Item

Item sub-component

#### Switch.Group

Group sub-component

#### Switch.Legend

Legend sub-component


---

### Table

Table — semantic HTML table with styled rows, cells, and selection support.

**Type:** component

**Import:** `import { Table } from "@company/kumo";`

**Category:** Other

**Props:**

- `layout`: enum [default: auto]
  - `"auto"`: Auto table layout - columns resize based on content
  - `"fixed"`: Fixed table layout - columns have equal width, controlled via colgroup
- `variant`: enum [default: default]
  - `"default"`: Default row variant
  - `"selected"`: Selected row variant
- `sticky`: enum
  - `"left"`: Pin column to the left edge of the scroll container
  - `"right"`: Pin column to the right edge of the scroll container
- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-elevated`, `bg-zenth-hairline`, `bg-zenth-tint`, `border-zenth-fill`, `ring-zenth-brand`, `text-zenth-default`, `text-zenth-strong`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Table.Header

Header sub-component

#### Table.Head

Head sub-component

#### Table.Row

Row sub-component

#### Table.Body

Body sub-component

#### Table.Cell

Cell sub-component

#### Table.CheckCell

CheckCell sub-component

#### Table.CheckHead

CheckHead sub-component

#### Table.Footer

Footer sub-component

#### Table.ResizeHandle

ResizeHandle sub-component


---

### TableOfContents

TableOfContents — presentational compound component for section navigation.

**Type:** component

**Import:** `import { TableOfContents } from "@company/kumo";`

**Category:** Other

**Props:**

- `children`: ReactNode
- `className`: string
- `id`: string
- `lang`: string
- `title`: string

**Colors (kumo tokens used):**

`border-zenth-brand`, `border-zenth-hairline`, `border-zenth-line`, `text-zenth-default`, `text-zenth-subtle`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### TableOfContents.Title

Title sub-component

#### TableOfContents.List

List sub-component

#### TableOfContents.Item

Item sub-component

#### TableOfContents.Group

Group sub-component


---

### Tabs

Tab navigation component with segmented or underline style. Built on Base UI Tabs with animated active indicator.

**Type:** component

**Import:** `import { Tabs } from "@company/kumo";`

**Category:** Navigation

**Props:**

- `tabs`: TabsItem[]
  Array of tab items to render.
- `value`: string
  Controlled value. When set, component becomes controlled.
- `selectedValue`: string
  Default selected value for uncontrolled mode. Ignored when `value` is set.
- `activateOnFocus`: boolean
  When `true`, tabs are activated immediately upon receiving focus via arrow keys. When `false` (default), tabs receive focus but require Enter/Space to activate.
- `className`: string
  Additional CSS classes for the root element.
- `listClassName`: string
  Additional CSS classes for the tab list element.
- `indicatorClassName`: string
  Additional CSS classes for the indicator element.
- `labels`: TabsLabels
  Labels for internationalization of aria-labels. All labels have English defaults.
- `variant`: enum [default: segmented]
  Tab style.
- `"segmented"` — Pill-shaped indicator on a filled track
- `"underline"` — Underline indicator below tab text
- `size`: enum [default: base]
  Tab size.
- `"base"` — Default size (h-9, text-base)
- `"sm"` — Compact size (h-6.5, text-xs) — matches Input size="sm"
- `onValueChange`: (value: string) => void
  Callback when active tab changes

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-brand`, `bg-zenth-recessed`, `bg-zenth-tint`, `border-zenth-hairline`, `ring-zenth-brand`, `ring-zenth-focus`, `ring-zenth-hairline`, `ring-zenth-line`, `text-zenth-default`, `text-zenth-subtle`

**Styling:**


---

### TagInput

TagInput component

**Type:** component

**Import:** `import { TagInput } from "@company/kumo";`

**Category:** Other

**Props:**

- `alt`: string
- `autoComplete`: React.HTMLInputAutoCompleteAttribute
- `checked`: boolean
- `height`: number | string
- `list`: string
- `name`: string
  Submits each accepted tag as a separate form value under this name.
- `placeholder`: string
- `readOnly`: boolean
  Prevents adding or removing tags while keeping the input focusable.
- `required`: boolean
  Requires at least one accepted tag for native form validation. Like a native input, a `readOnly` TagInput is skipped by validation.
- `type`: React.HTMLInputTypeAttribute
- `width`: number | string
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `children`: ReactNode
- `value`: string[]
- `validateValue`: object
- `maxValues`: number
- `labels`: TagInputLabels
  Translated labels for generated input, action, and validation text.
- `label`: ReactNode
- `labelTooltip`: ReactNode
- `description`: ReactNode
- `error`: string | object
- `variant`: enum [default: default]
  - `"default"`: Default tag input appearance.
  - `"error"`: Error state for validation failures.
- `disabled`: boolean

**Colors (kumo tokens used):**

`bg-zenth-overlay`, `ring-zenth-hairline`, `text-zenth-default`

**Styling:**


---

### Text

Text component

**Type:** component

**Import:** `import { Text } from "@company/kumo";`

**Category:** Display

**Props:**

- `variant`: enum [default: body]
  - `"heading"`: Heading text (16px by default, 20px at large size)
  - `"heading1"`: Deprecated large heading for page titles; use heading instead
  - `"heading2"`: Deprecated medium heading for section titles; use heading instead
  - `"heading3"`: Deprecated small heading for subsections; use heading instead
  - `"body"`: Default body text
  - `"secondary"`: Muted text for secondary information
  - `"success"`: Success state text
  - `"error"`: Error state text
  - `"mono"`: Monospace text for code
  - `"mono-secondary"`: Muted monospace text
- `size`: enum [default: base]
  - `"xs"`: Extra small text
  - `"sm"`: Small text
  - `"base"`: Default text size
  - `"lg"`: Large text
- `bold`: boolean
  Whether to use bold font weight (only applies to body variants).
- `truncate`: boolean
  Whether to truncate overflowing text with an ellipsis. Adds `truncate min-w-0` classes.
- `as`: enum
  The HTML element to render. Accepts headings (`"h1"`–`"h6"`), block text (`"p"`, `"pre"`), inline text (`"span"`, `"code"`, `"em"`, `"strong"`, `"small"`, `"abbr"`, `"time"`), form-related (`"label"`, `"legend"`), list/definition (`"dt"`, `"dd"`, `"li"`), and `"figcaption"`.

- **Optional** for `"heading"` (defaults to `"span"`). Pass the heading   element that reflects this text's place in the document outline.
- **Required** for deprecated heading variants (`"heading1"`,   `"heading2"`, `"heading3"`).
- **Optional** for body variants (defaults to `"p"`) and monospace   variants (defaults to `"span"`).
- `children`: ReactNode
  Text content.

**Colors (kumo tokens used):**

`text-zenth-danger`, `text-zenth-default`, `text-zenth-link`, `text-zenth-subtle`

**Styling:**


---

### TimeseriesChart

TimeseriesChart — a time-series line or bar chart.

**Type:** component

**Import:** `import { TimeseriesChart } from "@company/kumo";`

**Category:** Data Visualization

**Props:**

- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

**Colors (kumo tokens used):**

`bg-zenth-base`, `outline-zenth-line`

---

### Toasty

Toasty — toast notification provider and viewport.

**Type:** component

**Import:** `import { Toasty } from "@company/kumo";`

**Category:** Feedback

**Props:**

- `variant`: enum [default: default]
  - `"default"`: Default toast style
  - `"success"`: Success toast for confirmations and positive outcomes
  - `"error"`: Error toast for critical issues
  - `"warning"`: Warning toast for cautionary messages
  - `"info"`: Info toast for neutral informational messages
- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

**Colors (kumo tokens used):**

`bg-zenth-base`, `bg-zenth-control`, `bg-zenth-danger-tint`, `bg-zenth-info-tint`, `bg-zenth-success-tint`, `bg-zenth-warning-tint`, `border-zenth-fill`, `ring-zenth-danger`, `ring-zenth-hairline`, `ring-zenth-info`, `ring-zenth-line`, `ring-zenth-success`, `ring-zenth-warning`, `text-zenth-danger`, `text-zenth-default`, `text-zenth-info`, `text-zenth-subtle`, `text-zenth-success`, `text-zenth-warning`

**Styling:**


---

### Toolbar

Toolbar component

**Type:** component

**Import:** `import { Toolbar } from "@company/kumo";`

**Category:** Other

**Props:**

- `disabled`: boolean
- `orientation`: ToolbarRoot.Orientation
  The orientation of the toolbar.
- `loopFocus`: boolean
  If `true`, using keyboard navigation will wrap focus to the other end of the toolbar once the end is reached.
- `id`: string
- `lang`: string
- `title`: string
- `className`: string | object
  CSS class applied to the element, or a function that returns a class based on the component's state.
- `render`: ReactNode
  Allows you to replace the component's HTML element with a different tag, or compose it with another component.

Accepts a `ReactElement` or a function that returns the element to render.
- `children`: ReactNode
  Toolbar controls rendered as one grouped card.
- `size`: enum [default: base]
  - `"xs"`: Extra small toolbar for compact UIs
  - `"sm"`: Small toolbar for secondary controls
  - `"base"`: Default toolbar size
  - `"lg"`: Large toolbar for prominent controls

**Colors (kumo tokens used):**

`bg-zenth-control`, `border-zenth-line`, `ring-zenth-line`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Toolbar.Button

Button sub-component

#### Toolbar.Link

Link sub-component

#### Toolbar.Input

Input sub-component

#### Toolbar.InputGroup

InputGroup sub-component


---

### Tooltip

Accessible popup that shows additional information on hover/focus. Wrap your app or section with `<TooltipProvider>` to enable delay grouping.

**Type:** component

**Import:** `import { Tooltip } from "@company/kumo";`

**Category:** Overlay

**Props:**

- `side`: enum [default: top]
  - `"top"`: Tooltip appears above the trigger
  - `"bottom"`: Tooltip appears below the trigger
  - `"left"`: Tooltip appears to the left of the trigger
  - `"right"`: Tooltip appears to the right of the trigger
- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements
- `content`: ReactNode (required)
  Content to display in the tooltip

**Colors (kumo tokens used):**

`bg-zenth-base`, `fill-zenth-arrow-edge`, `fill-zenth-arrow-stroke`, `fill-zenth-base`, `outline-zenth-line`, `text-zenth-default`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Tooltip.Provider

Groups multiple tooltips so that after the first tooltip is shown, switching to another skips the open delay. Place once at your app root or layout.

Props:
- `delay`: number [default: 600] - How long to wait (ms) before opening a tooltip once the pointer enters the trigger.
- `closeDelay`: number [default: 0] - How long to wait (ms) before closing a tooltip.
- `timeout`: number [default: 400] - Grace period (ms) during which a just-closed tooltip's delay is skipped when another tooltip opens.

Usage:
```tsx
<TooltipProvider>
  <App />
</TooltipProvider>
```


---

### CompanyLogo

Company logo component.

**Type:** component

**Import:** `import { CompanyLogo } from "@company/kumo";`

**Category:** Other

**Props:**

- `children`: ReactNode
- `className`: string
- `height`: number | string
- `id`: string
- `lang`: string
- `media`: string
- `method`: string
- `name`: string
- `target`: string
- `type`: string
- `width`: number | string
- `accentHeight`: number | string
- `accumulate`: enum
- `additive`: enum
- `alignmentBaseline`: enum
- `allowReorder`: enum
- `alphabetic`: number | string
- `amplitude`: number | string
- `arabicForm`: enum
- `ascent`: number | string
- `attributeName`: string
- `attributeType`: string
- `autoReverse`: Booleanish
- `azimuth`: number | string
- `baseFrequency`: number | string
- `baselineShift`: number | string
- `baseProfile`: number | string
- `bbox`: number | string
- `begin`: number | string
- `bias`: number | string
- `by`: number | string
- `calcMode`: number | string
- `capHeight`: number | string
- `clip`: number | string
- `clipPath`: string
- `clipPathUnits`: number | string
- `clipRule`: number | string
- `colorInterpolation`: number | string
- `colorInterpolationFilters`: enum
- `colorProfile`: number | string
- `colorRendering`: number | string
- `contentScriptType`: number | string
- `contentStyleType`: number | string
- `cursor`: number | string
- `cx`: number | string
- `cy`: number | string
- `d`: string
- `decelerate`: number | string
- `descent`: number | string
- `diffuseConstant`: number | string
- `direction`: number | string
- `display`: number | string
- `divisor`: number | string
- `dominantBaseline`: number | string
- `dur`: number | string
- `dx`: number | string
- `dy`: number | string
- `edgeMode`: number | string
- `elevation`: number | string
- `enableBackground`: number | string
- `end`: number | string
- `exponent`: number | string
- `externalResourcesRequired`: Booleanish
- `fill`: string
- `fillOpacity`: number | string
- `fillRule`: enum
- `filter`: string
- `filterRes`: number | string
- `filterUnits`: number | string
- `floodColor`: number | string
- `floodOpacity`: number | string
- `focusable`: Booleanish | string
- `fontFamily`: string
- `fontSize`: number | string
- `fontSizeAdjust`: number | string
- `fontStretch`: number | string
- `fontStyle`: number | string
- `fontVariant`: number | string
- `fontWeight`: number | string
- `format`: number | string
- `fr`: number | string
- `from`: number | string
- `fx`: number | string
- `fy`: number | string
- `g1`: number | string
- `g2`: number | string
- `glyphName`: number | string
- `glyphOrientationHorizontal`: number | string
- `glyphOrientationVertical`: number | string
- `glyphRef`: number | string
- `gradientTransform`: string
- `gradientUnits`: string
- `hanging`: number | string
- `horizAdvX`: number | string
- `horizOriginX`: number | string
- `href`: string
- `ideographic`: number | string
- `imageRendering`: number | string
- `in2`: number | string
- `in`: string
- `intercept`: number | string
- `k1`: number | string
- `k2`: number | string
- `k3`: number | string
- `k4`: number | string
- `k`: number | string
- `kernelMatrix`: number | string
- `kernelUnitLength`: number | string
- `kerning`: number | string
- `keyPoints`: number | string
- `keySplines`: number | string
- `keyTimes`: number | string
- `lengthAdjust`: number | string
- `letterSpacing`: number | string
- `lightingColor`: number | string
- `limitingConeAngle`: number | string
- `local`: number | string
- `markerEnd`: string
- `markerHeight`: number | string
- `markerMid`: string
- `markerStart`: string
- `markerUnits`: number | string
- `markerWidth`: number | string
- `mask`: string
- `maskContentUnits`: number | string
- `maskUnits`: number | string
- `mathematical`: number | string
- `mode`: number | string
- `numOctaves`: number | string
- `offset`: number | string
- `opacity`: number | string
- `operator`: number | string
- `order`: number | string
- `orient`: number | string
- `orientation`: number | string
- `origin`: number | string
- `overflow`: number | string
- `overlinePosition`: number | string
- `overlineThickness`: number | string
- `paintOrder`: number | string
- `panose1`: number | string
- `path`: string
- `pathLength`: number | string
- `patternContentUnits`: string
- `patternTransform`: number | string
- `patternUnits`: string
- `pointerEvents`: number | string
- `points`: string
- `pointsAtX`: number | string
- `pointsAtY`: number | string
- `pointsAtZ`: number | string
- `preserveAlpha`: Booleanish
- `preserveAspectRatio`: string
- `primitiveUnits`: number | string
- `r`: number | string
- `radius`: number | string
- `refX`: number | string
- `refY`: number | string
- `renderingIntent`: number | string
- `repeatCount`: number | string
- `repeatDur`: number | string
- `requiredExtensions`: number | string
- `requiredFeatures`: number | string
- `restart`: number | string
- `result`: string
- `rotate`: number | string
- `rx`: number | string
- `ry`: number | string
- `scale`: number | string
- `seed`: number | string
- `shapeRendering`: number | string
- `slope`: number | string
- `spacing`: number | string
- `specularConstant`: number | string
- `specularExponent`: number | string
- `speed`: number | string
- `spreadMethod`: string
- `startOffset`: number | string
- `stdDeviation`: number | string
- `stemh`: number | string
- `stemv`: number | string
- `stitchTiles`: number | string
- `stopColor`: string
- `stopOpacity`: number | string
- `strikethroughPosition`: number | string
- `strikethroughThickness`: number | string
- `string`: number | string
- `stroke`: string
- `strokeDasharray`: string | number
- `strokeDashoffset`: string | number
- `strokeLinecap`: enum
- `strokeLinejoin`: enum
- `strokeMiterlimit`: number | string
- `strokeOpacity`: number | string
- `strokeWidth`: number | string
- `surfaceScale`: number | string
- `systemLanguage`: number | string
- `tableValues`: number | string
- `targetX`: number | string
- `targetY`: number | string
- `textAnchor`: string
- `textDecoration`: number | string
- `textLength`: number | string
- `textRendering`: number | string
- `to`: number | string
- `transform`: string
- `u1`: number | string
- `u2`: number | string
- `underlinePosition`: number | string
- `underlineThickness`: number | string
- `unicode`: number | string
- `unicodeBidi`: number | string
- `unicodeRange`: number | string
- `unitsPerEm`: number | string
- `vAlphabetic`: number | string
- `values`: string
- `vectorEffect`: number | string
- `version`: string
- `vertAdvY`: number | string
- `vertOriginX`: number | string
- `vertOriginY`: number | string
- `vHanging`: number | string
- `vIdeographic`: number | string
- `viewBox`: string
- `viewTarget`: number | string
- `visibility`: number | string
- `vMathematical`: number | string
- `widths`: number | string
- `wordSpacing`: number | string
- `writingMode`: number | string
- `x1`: number | string
- `x2`: number | string
- `x`: number | string
- `xChannelSelector`: string
- `xHeight`: number | string
- `xlinkActuate`: string
- `xlinkArcrole`: string
- `xlinkHref`: string
- `xlinkRole`: string
- `xlinkShow`: string
- `xlinkTitle`: string
- `xlinkType`: string
- `xmlBase`: string
- `xmlLang`: string
- `xmlns`: string
- `xmlnsXlink`: string
- `xmlSpace`: string
- `y1`: number | string
- `y2`: number | string
- `y`: number | string
- `yChannelSelector`: string
- `z`: number | string
- `zoomAndPan`: string
- `variant`: enum [default: full]
  - `"glyph"`: Cloud glyph only (logomark)
  - `"full"`: Full logo with cloud glyph and wordmark stacked

**Colors (kumo tokens used):**

`bg-zenth-base`, `ring-zenth-hairline`, `text-zenth-default`

---

### InputArea

Multi-line textarea input with Input variants and InputArea-specific dimensions

**Type:** component

**Import:** `import { InputArea } from "@company/kumo (synthetic - uses Input component)";`

**Category:** Input

**Props:**

- `size`: enum [default: base]
  - `"xs"`: Extra small for compact UIs
  - `"sm"`: Small for secondary fields
  - `"base"`: Default size
  - `"lg"`: Large for prominent fields
- `variant`: enum [default: default]
  Visual variant of the textarea.
- `label`: ReactNode
  Label content for the textarea (enables Field wrapper) — can be a string or any React node.
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon.
- `description`: ReactNode
  Helper text displayed below the textarea.
- `error`: string | { message: ReactNode; match: FieldErrorMatch }
  Error message or validation error object.
- `autoResize`: boolean [default: false]
  Automatically resize the textarea based on its content.
- `minRows`: number [default: 1]
  Minimum number of rows to display when `autoResize` is enabled.
- `maxRows`: number
  Maximum number of rows to grow to when `autoResize` is enabled; content beyond this scrolls.
- `onValueChange`: (value: string) => void
  Callback fired with the new string value on every change.

**Styling:**

- **Size Variants:**
  - `xs`:
  - `sm`:
  - `base`:
  - `lg`:

## Quick Reference

**Components by Category:**
- **Other:** Autocomplete, DatePicker, Label, Link, SensitiveInput, Sidebar, Table, TableOfContents, TagInput, Toolbar, CompanyLogo, DeleteResource
- **Display:** Badge, Breadcrumbs, Code, Collapsible, Empty, LayerCard, Meter, Text
- **Feedback:** Banner, Loader, Toasty
- **Data Visualization:** BubbleMap, Chart, ChoroplethMap, GlobeMap, SankeyChart, TimeseriesChart
- **Action:** Button, ButtonGroup, ClipboardText, InlineCopyText
- **Input:** Checkbox, Combobox, DateRangePicker, Field, Input, InputGroup, Radio, Select, Slider, Switch
- **Navigation:** CommandPalette, MenuBar, Pagination, Tabs
- **Overlay:** Dialog, DropdownMenu, LayerDialog, Popover, Tooltip
- **Layout:** Grid, Surface, PageHeader, ResourceListPage
