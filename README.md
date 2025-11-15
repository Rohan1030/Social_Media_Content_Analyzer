# 📄 Social Media Content Analyzer

**AI-powered PDF → Text → Social Media Tips Analyzer**

The **Social Media Content Analyzer** is a modern React application that extracts text from PDF or text files and generates **AI-powered engagement improvement tips** for social media platforms such as Instagram, LinkedIn, Twitter, Facebook, and TikTok.

Using a clean UI, drag-and-drop upload, PDF.js text extraction, and OpenAI-powered insights, this tool helps creators, marketers, students, and businesses instantly improve the impact of their content.

---

## 🚀 Features

### 📝 1. **File Upload & Parsing**

* Upload **PDF**, **TXT**, or **Markdown** files.
* Drag-and-drop support with interactive highlighting.
* Uses **PDF.js** to extract text from multi-page PDFs.
* Graceful fallback for unsupported file types.

### 🤖 2. **AI-Powered Engagement Tips**

* Uses OpenAI to analyze extracted content.
* Returns **5 detailed, actionable tips**.
* Each tip includes:

  * **Title**
  * **Explanation**
  * **Best platform suggestion** (Instagram/LinkedIn/etc.)

### 🎨 3. **Modern, Responsive UI**

* Fully custom CSS (no Tailwind).
* Clean cards, soft shadows, gradients, responsive layout.
* Loading spinners, error messages, and smooth animations.

### 🔍 4. **Extracted Text Preview**

* Displays extracted text in a scrollable, monospaced preview.
* Uses subtle borders and soft UI for readability.

### ❌ 5. **Error Handling**

* Invalid files
* Empty content
* Missing API key
* PDF library not loaded yet

---

## 🛠️ Tech Stack

* **React (Vite compatible)**
* **PDF.js** for text extraction
* **OpenAI API** for AI content analysis
* **Lucide Icons** for UI icons
* **Custom CSS** for styling

---

## 📦 Installation

```bash
# Clone the repo
$ git clone https://github.com/your-username/social-media-analyzer.git

# Move into folder
$ cd social-media-analyzer

# Install dependencies
$ npm install

# Start development server
$ npm run dev
```

---

## 🔑 Environment Setup

Create an `.env` file in the root directory:

```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

> ⚠️ **Never hardcode your API key inside your React app.** Always use `.env` variables.

---

## 📂 Project Structure

```
/project-root
 ├── src/
 │   ├── components/
 │   │   └── SocialMediaAnalyzer.jsx
 │   ├── styles/
 │   │   └── app.css
 │   ├── App.jsx
 │   └── main.jsx
 ├── .env
 ├── package.json
 └── README.md
```

---

## 🧠 How It Works

1. **Upload File** → PDF.js extracts content.
2. **Text is cleaned** and prepared for analysis.
3. **AI request sent** to OpenAI using your API key.
4. **5 JSON tips returned**, parsed, and displayed.
5. UI updates with platform badges, cards, and descriptions.

---



*Add your project screenshots here later:*

* Upload UI
* Extracted text preview
* Tips display
* Error states

---

## 🛡️ Security Note

This app runs **entirely in the browser**, so:

* Do **not** expose backend secrets.
* Use environment variables.
* For production, consider a small backend proxy.

---

## 🤝 Contributing

Pull requests, issues, and suggestions are welcome! Feel free to fork the repo and build on top of it.

---

## ⭐ Support

If you like this project:

* ⭐ Star the repository
* 🔄 Fork it
* 📣 Share it

---

## 📬 Contact

For help or issues, open an issue on GitHub or contact me.

---

Made with ❤️ using React + OpenAI

## 📸 Screenshots (Optional)



<img width="1868" height="835" alt="Screenshot 2025-11-15 224809" src="https://github.com/user-attachments/assets/5d089150-a2c2-41f6-83d2-8f0fcb67802d" />



<img width="1860" height="839" alt="Screenshot 2025-11-15 224829" src="https://github.com/user-attachments/assets/a4391c4f-187b-4ba6-bb48-b25b52e73c20" />



<img width="1861" height="834" alt="Screenshot 2025-11-15 224846" src="https://github.com/user-attachments/assets/ca2c4de8-d314-4447-9b81-501f0f361c62" />


