# 🤖 Project: AI-Powered Pull Request Review Bot

## 1. Project Overview
ระบบ Automated Pull Request (PR) Review Bot ที่พัฒนาขึ้นเพื่อทำหน้าที่เป็น "ผู้ช่วยตรวจสอบโค้ดด่านแรก" (First-line Code Reviewer) โดยระบบจะทำงานร่วมกับ GitHub Webhook เพื่อวิเคราะห์ Code Diff ทันทีที่มีการเปิด PR ใหม่ และใช้ AI (LLM) ในการให้ Feedback เพื่อลดภาระของ Senior Developer และเพิ่มความรวดเร็วในกระบวนการ Software Development Life Cycle (SDLC)

## 2. Problem Statement (Pain Points)
ในกระบวนการทำงานแบบทีม การทำ Code Review มักพบปัญหาดังนี้:
* **Bottleneck:** Senior Developer มีเวลาจำกัด ทำให้ PR ถูกดองทิ้งไว้เป็นเวลานาน
* **Human Error & Nitpicking:** ผู้ตรวจอาจพลาดจุดบกพร่องเล็กๆ น้อยๆ หรือเสียเวลาไปกับการตรวจเรื่องพื้นฐาน (เช่น Syntax, การตั้งชื่อตัวแปร) 
* **Delayed Feedback Loop:** Developer ต้องรอนานกว่าจะรู้ว่าโค้ดตัวเองมีข้อผิดพลาด ทำให้ขาดความต่อเนื่องในการทำงาน

## 3. Proposed Solution
สร้าง Backend Service ที่เชื่อมต่อกับ GitHub Repository เมื่อ Developer ทำการเปิด PR ระบบจะดึงข้อมูลโค้ดที่มีการเปลี่ยนแปลง (Diff) ส่งไปให้ AI ประมวลผลหาบั๊กหรือข้อเสนอแนะ และทำการส่งผลลัพธ์กลับมาเป็น Comment ใน PR นั้นโดยอัตโนมัติภายในไม่กี่วินาที

## 4. System Workflow (Architecture Flow)
1. **Trigger:** User ทำการกด `Open Pull Request` บน GitHub
2. **Webhook Event:** GitHub ส่ง HTTP POST Request (Payload) มายัง Backend Service ของเรา
3. **Data Extraction:** Backend รับข้อมูล PR ID และ Repository จากนั้นเรียกใช้ GitHub REST API เพื่อดึงเนื้อหาไฟล์ที่ถูกแก้ไข (Code Diff)
4. **AI Processing:** Backend นำ Code Diff ประกอบเข้ากับ Prompt (System Instructions) และส่งไปยัง AI API (เช่น Gemini / OpenAI)
5. **Feedback Delivery:** AI ส่งผลการวิเคราะห์กลับมา Backend ทำการจัด Format และเรียกใช้ GitHub API เพื่อโพสต์ Comment ลงใน PR เดิม

## 5. Functional Requirements
* **FR1:** ระบบต้องสามารถตั้งรับ (Listen) Event `pull_request` จาก GitHub Webhook ได้
* **FR2:** ระบบต้องสามารถแยกแยะได้ว่า PR นั้นเป็นการ `opened` หรือ `synchronize` (มีการอัปเดตโค้ดเพิ่ม)
* **FR3:** ระบบต้องสามารถเรียกใช้ GitHub API เพื่อดึงไฟล์ `.diff` หรือ `.patch` ของ PR นั้นๆ ได้อย่างถูกต้อง
* **FR4:** ระบบต้องสามารถส่งต่อข้อมูลโค้ดไปยัง External AI API และรับ String Response กลับมาได้
* **FR5:** ระบบต้องสามารถนำ Response จาก AI ไปสร้าง Issue Comment หรือ Review Comment ใน GitHub PR ได้

## 6. Non-Functional Requirements
* **Performance:** ระบบควรส่ง Comment กลับไปยัง GitHub ภายใน 30-60 วินาที หลังจากได้รับ Webhook
* **Reliability:** ระบบต้องมีการจัดการ Error Handling เช่น กรณีที่ AI API ล่ม หรือ GitHub API ติด Rate Limit
* **Security:** ระบบต้องไม่มีการเก็บซอร์สโค้ดของ User ไว้ใน Database ถาวร (Stateless Data Processing) และต้องรักษาความปลอดภัยของ API Keys (GitHub Token, AI API Key) อย่างเข้มงวด

## 7. Tech Stack
* **Backend Framework:** NestJS (Node.js)
* **API Integration:** GitHub REST API, Google Gemini API (หรือ OpenAI API)
* **Deployment & Testing:** Docker, Ngrok (สำหรับการทดสอบ Webhook แบบ Local)