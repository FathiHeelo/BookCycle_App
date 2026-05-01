# 📚 BookCycle App – Campus Resource Exchange Platform

## 📌 Overview
BookCycle is a mobile application designed for university students to exchange academic resources such as textbooks, notes, and study materials.

The platform allows students to share resources they no longer need and connect with others, promoting a collaborative and sustainable campus environment.

---

## 🧠 Core Features

- 📦 Resource Sharing  
  Upload and share books, notes, and study materials.

- 🔐 User Authentication  
  Secure login and registration using Firebase Authentication.

- ⚡ Real-Time Database  
  Instant data sync using Firebase Realtime Database.

- 💬 Chat System  
  Direct messaging between users.

- 🖼️ Image Upload  
  Upload book images using Cloudinary.

- 📱 Modern UI  
  Clean and responsive interface built with React Native.

---

## 🏗️ System Design Highlights

- Structured Firebase Database:
  - `Books` (owned by donor)
  - `Users`
  - `Chats`
  - `UserChats` (for scalability)

- Security Rules:
  - Only authenticated users can read data
  - Only owners can modify their resources
  - Chat access limited to participants

- Media Handling:
  - Image compression using Expo Image Manipulator
  - Cloudinary for external storage

---

## 🚀 Key Improvements

- Scalable database structure
- Efficient chat system design
- Optimized image uploads
- Secure access control
- Clean and modular codebase

---

## 🛠️ Technologies Used

- React Native (Expo)
- Firebase (Authentication + Realtime Database)
- Cloudinary
- JavaScript / TypeScript
- Expo Image Manipulator

---

## ▶️ How to Run

```bash
git clone https://github.com/FathiHeelo/BookCycle_App.git
cd BookCycle_App
npm install
npx expo start
