# Backend ↔ Frontend API Reference

Base URL: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:5000`). All authenticated requests use header: `Authorization: Bearer <token>`.

---

## Auth (`/auth`)

| Backend Route | Method | Frontend Call | Where to Test |
|---------------|--------|---------------|----------------|
| `/auth/register` | POST | `authService.registerUser()` | Auth page → Sign up form → Submit |
| `/auth/login` | POST | `authService.loginUser()` (via Server Action `loginAction`) | Auth page → Sign in form → Submit |
| `/auth/profile` | GET | `authService.getUserProfile(token)` | Home page load (server); used to get `root_folder_id` |

---

## Folders (`/folders`)

| Backend Route | Method | Frontend Call | Where to Test |
|---------------|--------|---------------|----------------|
| `/folders/` | POST | `filesFetchService.createFolder(name, parentId, token)` | Drive view → Toolbar “New folder” → Create folder modal → Submit |
| `/folders/<folder_id>/contents` | GET | `filesFetchService.getFolderContents(folderId, token)` | Drive view: opening a folder, breadcrumb navigation, initial load |

---

## Files (`/files`)

| Backend Route | Method | Frontend Call | Where to Test |
|---------------|--------|---------------|----------------|
| `/files/upload` | POST | `uploadService.uploadFiles(files, folderId, token)` | Drive view → Toolbar “Upload” → Upload modal → Select files → Upload |
| `/files/<file_id>/download` | GET | `downloadSingleFile.downloadSingleFile(fileId, fileName, token)` | Drive: right-click file → Download; or select file → Preview pane → Download |
| `/files/<file_id>/trash` | POST | `trashService.moveFileToTrash(fileId, token)` | Drive: right-click file → Delete; or select file → Preview pane → Trash |
| `/files/trash` | GET | `trashService.getTrashedFiles(token)` | Sidebar → Trash → list of trashed files |
| `/files/<file_id>/restore` | POST | `trashService.restoreFile(fileId, token)` | Trash view → Restore button on a file |
| `/files/<file_id>` | DELETE | `trashService.deleteFilePermanently(fileId, token)` | Trash view → Delete permanently button (with confirm) |

---

## Users (`/users`)

| Backend Route | Method | Frontend Call | Where to Test |
|---------------|--------|---------------|----------------|
| `/users/storage` | GET | `getStorageStats.getStorageStats(token)` | Sidebar bottom: “Storage” meter (used/remaining) |

---

## Quick Test Checklist

1. **Auth** – Register, Login, then open home (profile is used on load).
2. **Folders** – Create folder, open folder, use breadcrumb.
3. **Files** – Upload file(s), download file, move file to trash (context menu or preview).
4. **Trash** – Open Trash, restore a file, delete permanently (with confirm).
5. **Storage** – Check sidebar storage bar after upload/delete/restore.

All of the above use the backend at `NEXT_PUBLIC_API_URL`; ensure `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000` (or your backend URL).



