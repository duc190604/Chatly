# Chatly – Realtime Chat App 💬⚡

Chatly là một ứng dụng chat realtime fullstack được xây dựng với các công nghệ hiện đại, hỗ trợ các tính năng tương tác như nhắn tin, kết bạn, và đồng bộ thời gian thực.

---

## 🧱 Tech Stack

### 📦 Backend – NestJS
- **NestJS** – REST API + WebSocket (Socket.IO)
- **MongoDB Atlas (Cloud)** – lưu trữ user, message, friend
- **Redis Cloud** – cache session, message, socket
- **Socket.IO** – giao tiếp realtime

### 🖼️ Frontend – Next.js
- **Next.js (App Router)** – frontend chính
- **NextAuth.js** – xác thực (email/password, JWT)
- **TanStack Query** – quản lý dữ liệu bất đồng bộ
- **Redux Toolkit** – quản lý UI state (gửi/chỉnh sửa/xoá)
- **Socket.IO client** – kết nối realtime với BE

---

## 🔥 Tính năng nổi bật

- ✅ Đăng ký / đăng nhập (NextAuth)
- ✅ Nhắn tin realtime
  - Gửi / thu hồi / chỉnh sửa / xoá
- ✅ Kết bạn & duyệt kết bạn
- ✅ Xem danh sách bạn bè
- ✅ Tối ưu hiệu suất với Redis + TanStack Query + Socket.IO

---

## 🗂️ Cấu trúc thư mục

```txt
Chatly/
├── frontend/             # Frontend ứng dụng (Next.js)
├── backend/              # Backend API (NestJS)
├── .env                  # Biến môi trường dùng chung cho docker-compose
├── docker-compose.yml    # Khởi chạy toàn bộ hệ thống FE + BE + DB
└── README.md             # Tài liệu hướng dẫn cài đặt và sử dụng
```
## 🛠️ Cài đặt & chạy bằng Docker

### 1. Tạo file `.env` tại gốc (copy từ `.env.example` nếu có)
### 2. Chạy toàn bộ hệ thống với lệnh: "docker compose up --build"
- ✅ FE chạy tại: http://localhost:3000
- ✅ BE chạy tại: http://localhost:8017