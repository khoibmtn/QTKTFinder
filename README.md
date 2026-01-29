# QTKT Finder

Ứng dụng tìm kiếm Quy trình Kỹ thuật (QTKT) với fuzzy search, real-time sync, và CSV upload.

## 🚀 Features

- **Fuzzy Search**: Tìm kiếm theo thứ tự ký tự
- **Real-time Sync**: Dữ liệu cập nhật tự động từ Firebase
- **Filter**: Lọc theo Chuẩn QTKT và Chuyên khoa
- **Admin Upload**: Upload CSV với bảo vệ mã truy cập
- **Responsive**: Hoạt động tốt trên mọi thiết bị

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Database**: Firebase Firestore
- **Search**: Fuse.js
- **Deployment**: Vercel

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Create `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🏃 Development

```bash
npm run dev
```

## 🌐 Deployment

Deploy to Vercel:

```bash
git push origin main
```

Vercel will auto-deploy from GitHub.

## 📝 CSV Format

```csv
chuanqtkt,qdbanhanh,chuyenkhoa,tenqtkt
QTKT theo chuẩn cũ,QĐ số: 26/QĐ-BYT ngày 03/01/2013,Vi sinh,Adenovirus Real-time PCR
```

## 🔐 Admin Access

Default code: `admin123`

Change code in Admin panel after first login.

## 📄 License

MIT
