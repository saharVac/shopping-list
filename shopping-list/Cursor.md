# Shopping List Frontend — Workspace Pointer

This folder is the **Create React App frontend** for the shopping list app. The git monorepo root is one level up.

**Full project context:** See [`../Cursor.md`](../Cursor.md) for the canonical living document (architecture, API, backend, deploy, roadmap, tech debt).

---

## Quick start

```bash
npm install
npm start          # http://localhost:3000
npm run dev        # nodemon + dev server
npm run build      # production build → build/
```

## API

All data persists to `https://svac-shopping-list.herokuapp.com` via Axios in `src/DataHandling.js`.

## Key files

| Path | Role |
|------|------|
| `src/App.js` | Root state (`useReducer`), modals, list refresh, categories |
| `src/DataHandling.js` | API client (items + categories) |
| `src/Pages/ShoppingList/` | Main list — search, categorize banner, grouped sections |
| `src/Components/CategoryGroup/` | Category section header + ↑/↓ + items |
| `src/Components/CategorySelect/` | Searchable select-or-create category |
| `src/Components/CategorizePopup/` | Uncategorized walkthrough |
| `src/Components/ManageCategories/` | Add/rename/delete/reorder/consolidate categories |
| `src/Components/Item/` | List row — quantity, edit, delete, move |
| `src/Components/EditPopup/` | Add/edit modal (includes category) |
| `src/Components/DeletePopup/` | Delete confirmation |
| `src/Components/NavBar/` | Bottom tab: Shopping List ↔ In Stock |

## Backend

Express + MongoDB backend lives at `../server/` (separate git repo, gitignored in monorepo). For API or schema changes, work there and update `../Cursor.md`.

## Agent note

Do not duplicate the full breakdown here. Update [`../Cursor.md`](../Cursor.md) when learning new project context.
