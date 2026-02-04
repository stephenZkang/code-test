# Agent Guidelines: Big Screen Data Visualization

This document provides essential information for AI agents operating in this repository.

## 🚀 Development Commands

### Backend (FastAPI)
- **Start Service:** `cd backend && python main.py`
- **Install Dependencies:** `cd backend && pip install -r requirements.txt`
- **Run All Tests:** `pytest backend/verify_backend.py`
- **Run Single Test:** `pytest backend/verify_backend.py::test_system_stats_and_alarms`

### Frontend (Vue 3)
- **Development Server:** `cd frontend && npm run serve`
- **Build Production:** `cd frontend && npm run build`
- **Lint Code:** `cd frontend && npm run lint`
- **Install Dependencies:** `cd frontend && npm install`

---

## 🐍 Backend Guidelines (Python/FastAPI)

### 1. Structure & Architecture
- **Routers:** Logic is modularized into `backend/routers/`. New endpoints must be added there and registered in `backend/main.py`.
- **Database:** Use SQLAlchemy ORM (`models.py`) and Pydantic schemas (`schemas.py`) for data validation.
- **Dependency Injection:** Use `Depends(get_db)` for database sessions in route handlers.

### 2. Coding Style
- **Naming:** 
  - Functions & Variables: `snake_case`
  - Classes (Models/Schemas): `PascalCase`
- **Imports:** 
  - Standard library first, then third-party, then local modules.
  - Prefer `from . import models` or `import models` depending on context.
- **Error Handling:** Always use `HTTPException` from `fastapi`:
  ```python
  from fastapi import HTTPException, status
  raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND, 
      detail="Resource not found"
  )
  ```
- **Typing:** Use Python type hints (`List`, `Optional`, `Dict` from `typing`) for all function signatures and Pydantic models. Use `Annotated` for dependency injection if preferred, though `Depends` is standard here.

### 3. Database & Models
- **Models:** Defined in `models.py` using SQLAlchemy Base. Use `Column`, `Integer`, `String`, `JSON`, etc.
- **Schemas:** Defined in `schemas.py` using Pydantic. Use `from_attributes = True` in `model_config` (Pydantic v2).
  - `Base`: Common fields.
  - `Create`: Fields required for creation.
  - `Update`: Optional fields for updates.
  - `DataSource`: Complete model including ID.
- **Migrations:** Project uses Alembic. Run `alembic revision --autogenerate` and `alembic upgrade head` for changes.

### 4. Project Structure (Deep Dive)
- `backend/routers/`: API route definitions (dashboards, datasets, datasources, system, alarms, users).
- `backend/utils/`: Shared utilities (auth, db engines, stats gathering).
- `backend/verify_backend.py`: Integration test script for backend flows.
- `frontend/src/components/`: Reusable UI and chart widgets (Map, Chart, Metric, Table).
- `frontend/src/views/`: Page-level components (DashboardView, SettingsView).
- `frontend/src/store/`: Vuex modules for global state.
- `data/`: GeoJSON (china.json) and other static assets for maps.

### 5. API Endpoints (Core)
- `GET /api/datasources`: List all data sources.
- `GET /api/datasets/{id}/data`: Fetch processed data for a specific dataset (supports filtering).
- `GET /api/dashboards/{id}/widgets`: Fetch all widgets for a specific dashboard.
- `GET /api/system/stats`: Get real-time CPU and memory usage for the system status widget.
- `POST /api/alarms/`: Trigger a new alarm in the system.

---

## 🎨 Frontend Guidelines (Vue 3)

### 1. Framework & UI
- **Vue Version:** Vue 3. 
- **Component Style:** Composition API is preferred for new components (using `<script setup>`), though many existing components use the Options API.
- **UI Components:** Element Plus (imported globally in `main.js`).
- **Visualization:** 
  - **ECharts:** Primary library for charts. Use `vue-echarts` wrapper. Define options in `computed` properties.
  - **Leaflet:** Used for 2D maps. Components often use `vue3-leaflet`.
  - **Three.js:** Used for 3D visualization. Scenes should be initialized in `onMounted` and cleaned up in `onBeforeUnmount`.
- **State Management:** Vuex (`frontend/src/store/`). Access state via `mapState` or `computed`.

### 2. Coding Style
- **Naming:**
  - Components: `PascalCase` (e.g., `MetricWidget.vue`).
  - Methods & Variables: `camelCase`.
- **Props:** Always define types, default values, and validation.
- **API Calls:** Use `fetch` or `axios`. Base URL for backend is usually `http://localhost:8000/api`.
- **Styling:** Use scoped `<style>` blocks. The project uses a dark aesthetic:
  - Background: `#0b0f1a`
  - Primary Accent: `#00d2ff`
  - Container Background: `rgba(255, 255, 255, 0.03)`
  - Border: `1px solid rgba(0, 191, 255, 0.2)`

---

## 🛠️ Common Patterns

### Data Flow
1. **Frontend** requests data from an API endpoint (e.g., `/api/datasets/{id}/data`).
2. **Backend Router** handles the request, interacts with **SQLAlchemy Models** via a session.
3. **Data** is validated/serialized via **Pydantic Schemas** and returned as JSON.
4. **Frontend Component** receives data, usually via a parent view (`DashboardView.vue`), and updates visualization state.

### Adding New Features
- **New Widget:** 
  1. Create component in `frontend/src/components/`.
  2. Register in `frontend/src/views/DashboardView.vue`'s `components` and `getWidgetComponent` mapping.
  3. Ensure backend `schemas.py` and `models.py` support any new configuration fields.
- **New Data Source:**
  1. Update `backend/schemas.py` for config validation.
  2. Implement connection logic in `backend/utils/db_engine.py`.
  3. Add UI in frontend for configuration (e.g., in a settings page).

### Error Handling (Frontend)
- Use `try/catch` for API calls.
- Use `this.$message.error()` (Options API) or `ElMessage.error()` (Composition API) to show user-friendly errors.
- Log detailed errors to `console.error` for debugging.

### Testing
- **Backend:** Always verify changes with `backend/verify_backend.py`.
- **Integration:** Use `TestClient` from `fastapi.testclient`.
- **Unit Tests:** Preferred to be placed in a `tests/` directory if expanded. Use `pytest`.

### Deployment & Environment
- **Docker:** `Dockerfile` present in both `backend` and `frontend`.
- **Environment Variables:** Use `.env` files. `python-dotenv` used in backend.
- **CORS:** Configured in `backend/main.py` to allow all origins during development.
