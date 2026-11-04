# REDDY AI STUDIO – Updated deployment notes

## Architecture
- Frontend: Render Static Site (`frontend` folder)
- Backend: Render Docker Web Service (`backend` folder; FFmpeg included)
- Authentication: MongoDB Atlas + JWT
- Object storage: Cloudflare R2 (S3-compatible)
- Existing editor/render/chat/project routes are retained from the supplied ZIP.

## GitHub
Upload the contents of this folder to the repository root. Keep `frontend/` and `backend/` as sibling folders. Do not upload `.env`, `node_modules`, or real API credentials.

## Render backend
Create a Docker Web Service using:
- Root Directory: `backend`
- Dockerfile Path: `Dockerfile`
- Docker Context: `backend` (if using the dashboard's root-relative context setting, select the backend folder)
- Health Check: `/api/health`

Set environment variables:
- `NODE_ENV=production`
- `PORT=10000`
- `JWT_SECRET` = a unique random secret of 64+ characters
- `MONGODB_URI` = MongoDB Atlas connection string
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` = initial Super Admin credentials
- `FRONTEND_URL` = exact frontend Render URL, e.g. `https://reddy-ai-studio-frontend.onrender.com`
- `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` as required by the existing AI integrations
- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET`, `CLOUDFLARE_R2_PUBLIC_URL`

The initial Super Admin is created on first successful MongoDB connection if ADMIN_EMAIL and ADMIN_PASSWORD are present. Public registration always creates role `user`. Never expose the R2 secret or AI keys in frontend variables.

## Render frontend
Create a Static Site:
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment: `VITE_API_URL=https://YOUR-BACKEND.onrender.com`

After frontend deployment, update backend `FRONTEND_URL` with the exact static-site URL and redeploy backend.

## MongoDB Atlas
Create a database and database user. Copy the Node.js connection string into `MONGODB_URI`. Replace username/password placeholders and URL-encode special characters. For initial connectivity testing, configure Atlas Network Access appropriately; prefer restricting access rather than leaving broad access permanently.

## Cloudflare R2
Create bucket `reddy-ai-studio`, create an R2 API token with object read/write permission for that bucket, and add the credentials to backend environment variables. Configure a public custom domain only if public delivery is intended. Otherwise use authenticated signed URLs.

## Local development
Backend: `cd backend && npm install && npm start`
Frontend: `cd frontend && npm install && npm run dev`
Set local backend `.env` values including `PORT=10000`, `JWT_SECRET`, and `MONGODB_URI`. Set frontend `.env.local` to `VITE_API_URL=http://localhost:10000`.

## Important scope / production verification
This update adds MongoDB-backed accounts, role-aware account endpoints, JWT middleware, an R2 upload/signed-read API, separate Render deployment files, and a frontend API URL resolver. Existing project/media/render history modules from the supplied project still use their original JSON-store implementation; they have NOT yet been migrated to MongoDB, and legacy editor routes are retained for compatibility rather than all being protected by login middleware. Before opening this service to public users, migrate those stores and apply `requireAuth` plus per-owner authorization to every project/media/render route. Test full video upload → FFmpeg render → R2 export flow, as this starter R2 endpoint does not automatically redirect the existing FFmpeg pipeline to R2 yet. Do not treat a successful deploy as proof every workflow is production-ready.


# REDDY AI STUDIO - Cloudinary integration

This build uses Cloudinary for persistent media assets:
- `/api/storage/upload`: authenticated image/video upload endpoint (multipart field: `file`).
- `/api/media/upload`: video upload, FFprobe metadata extraction, thumbnail generation, then Cloudinary persistence.
- `/api/media/generate-sample`: generated sample video and thumbnail are persisted to Cloudinary.
- `/api/render/start`: downloads a selected Cloudinary source temporarily for FFmpeg, uploads the final MP4 to Cloudinary, and returns its Cloudinary URL.
- `/api/generate/render`: AI-generated MP4 output is uploaded to Cloudinary.

Required backend environment variables:

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAX_UPLOAD_MB=100
```

Never add `CLOUDINARY_API_SECRET` to the frontend. Temporary FFmpeg files are still created on the backend while processing, but persistent media and completed exports are uploaded to Cloudinary. Large uploads/renders consume Cloudinary plan credits and may exceed the plan's file-size or transformation limits.

Important existing-project limitation: the supplied project stores project/media/render metadata in its JSON-store files. Those records are not made persistent merely by storing the actual media in Cloudinary. For reliable production use across Render restarts, migrate the JSON stores to MongoDB. Also note that Cloudinary free credits are limited; this is not unlimited free video hosting.

