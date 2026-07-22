# Category labeling feature

**Status:** Implemented (2026-07-22)

The long draft previously in this file is obsolete. Canonical behavior is documented in [`../Cursor.md`](../Cursor.md) (data model, API, UI components, living updates).

## What shipped

- Separate `Category` collection (`name`, `order`) with CRUD + reorder endpoints
- Nullable `categoryId` on `ShoppingItem`; required on new inserts
- List UI groups items by category; ↑/↓ reorders categories
- `CategorySelect` (search + create) in add/edit modal
- Banner + `CategorizePopup` for existing uncategorized items (skippable)

## Follow-ups (optional)

- UI for rename/delete category (API exists)
- Drag-and-drop reorder
- Per-list category order / auth
