# 🧠 TwinMind Lite

![Live Demo](https://img.shields.io/badge/Live_Demo-twinmind--lite.vercel.app-blue?style=for-the-badge&logo=vercel)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

TwinMind Lite is a real-time AI Meeting Copilot designed to revolutionize how you capture and process meeting discussions. Offering a sleek, glassmorphic 3-column interface with cinematic video backgrounds, the application transcribes speech into text in real-time, extracts continuous AI-driven insights and suggestions, and features an interactive chat panel—all happening live over continuous microphone input.

**🌐 Live Application:** [https://twinmind-lite.vercel.app](https://twinmind-lite.vercel.app)

---

## 🌟 Key Features

* **🎙️ Live Sentence-Aware Transcript Streaming**
  * Advanced 5-second overlapping audio chunks via `MediaRecorder` API.
  * Intelligent sentence splitting and fuzzy deduplication ensuring highly readable transcripts.
  * Live visual feedback transitioning from partial to finalized transcripts.

* **💡 Automated AI Insights & Suggestions**
  * Continuously parses incoming meeting transcript context using the highly-performant Groq API.
  * Autogenerates key takeaways, meeting summaries, and actionable next-steps without manual prompting.
  * Clickable suggestions automatically bridge to dynamic Chat context.

* **💬 Streaming Chat Interface**
  * Context-aware interactive assistant that uses the entire meeting transcript as context to answer direct queries.
  * Fully streaming token-by-token rendering for immediate response feedback.

* **🎨 Immersive & Cinematic UI**
  * Custom 3-column dashboard (Transcript, AI panels, Chat) ensuring independent, smooth scrolling.
  * Cinematic motion video backgrounds paired with sleek frosted-glass CSS compositing.

* **⚙️ Complete Customization**
  * Settings modal allows configuring API Keys along with custom system prompts, context limits, and generation temperatures to fine-tune AI persona and precision.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 18+)
- **Styling:** Vanilla CSS & [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide-React](https://lucide.dev/)
- **Backend/AI:** [Groq API](https://groq.com/) for lightning-speed LLM processing 
- **Deployment:** Vercel Continuous Deployment

---

## 🚀 Getting Started

If you want to run TwinMind Lite locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rengoku9000/Twinmind-lite.git
   cd Twinmind-lite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Settings:**
   - Launch the app locally and click the Settings icon in the header.
   - Insert your Groq API key (Required for insights/chat).

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) and grant microphone permissions when prompted.

---

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
