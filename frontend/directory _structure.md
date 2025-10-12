```txt
apps/frontend/
├─ package.json
├─ index.html
├─ vite.config.js
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ routes/
   │  ├─ index.jsx
   │  ├─ ProtectedRoute.jsx
   │  ├─ Dashboard.jsx
   │  ├─ Links.jsx
   │  ├─ Domains.jsx
   │  ├─ Workspaces.jsx
   │  ├─ Settings.jsx
   │  └─ Auth/
   │     ├─ Login.jsx
   │     └─ Register.jsx
   ├─ components/
   │  ├─ layout/
   │  │  ├─ AppLayout.jsx
   │  │  ├─ TopNav.jsx
   │  │  └─ SideNav.jsx
   │  ├─ links/
   │  │  ├─ LinkTable.jsx
   │  │  └─ LinkForm.jsx
   │  ├─ analytics/
   │  │  └─ SummaryCards.jsx
   │  └─ common/
   │     ├─ WorkspacePicker.jsx
   │     ├─ Confirm.jsx
   │     └─ Copy.jsx
   ├─ api/
   │  ├─ http.js
   │  ├─ auth.api.js
   │  ├─ workspaces.api.js
   │  ├─ links.api.js
   │  ├─ domains.api.js
   │  └─ analytics.api.js
   ├─ store/
   │  ├─ auth.store.js
   │  ├─ ws.store.js
   │  └─ ui.store.js
   ├─ utils/
   │  ├─ validators.js
   │  └─ formatters.js
   ├─ styles/
   │  └─ globals.css
   └─ assets/
```