# Design Plan: Dashboard Background Image Upload

## Overview
Implement a feature to allow users to upload local images as dashboard backgrounds, supporting various display modes.

## Architecture

### Backend
1. **Directory**: Create `backend/uploads/` for storage.
2. **Endpoint**: `POST /api/assets/upload` (accepts `UploadFile`).
3. **Static Files**: Use `fastapi.staticfiles` to serve the `uploads/` directory.
4. **URL Format**: `http://localhost:8000/uploads/{filename}`.

### Frontend
1. **Component**: Use `el-upload` in `DashboardEditor.vue`.
2. **Data Model**:
   - `dashboard.layout_config.backgroundImage`: Stores the URL.
   - `dashboard.layout_config.backgroundSize`: Stores the CSS `background-size` value (`cover`, `contain`, `100% 100%`).
3. **Preview**: Canvas background reflects both the URL and the sizing mode.

## Implementation Steps
1. Create upload folder and update backend `main.py` for static serving.
2. Create `backend/routers/assets.py` for upload logic.
3. Update `backend/schemas.py` and `backend/models.py` if necessary (though `layout_config` is already JSON).
4. Update `DashboardEditor.vue` UI for upload and fit mode.
5. Update `DashboardView.vue` to respect the new fit mode.
