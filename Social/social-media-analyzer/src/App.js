import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, Sparkles, AlertCircle, CheckCircle, X, Copy, Download } from 'lucide-react';

/*
  Updated single-file React component with a clean, modern UI (no Tailwind).
  IMPORTANT: Do NOT hardcode your OpenAI key in source. Set it in your environment as:
    REACT_APP_OPENAI_API_KEY
*/

export default function SocialMediaAnalyzer() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);

  // Load PDF.js library lazily
  useEffect(() => {
    const loadPdfLib = async () => {
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          setPdfLibLoaded(true);
        };
        script.onerror = () => setPdfLibLoaded(false);
        document.head.appendChild(script);
      } else {
        setPdfLibLoaded(true);
      }
    };
    loadPdfLib();
  }, []);

  async function extractTextFromPDF(file) {
    if (!window.pdfjsLib) throw new Error('PDF.js library not loaded.');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    return fullText.trim();
  }

  async function extractTextFromImage(file) {
    // Placeholder: keep behavior consistent with your original component
    throw new Error('Image text extraction is not enabled. Use a PDF or paste text.');
  }

  // Call OpenAI to get tips. Use env var for key.
  async function getEngagementTips(text) {
    const prompt = `You are an expert social media strategist. Analyze the following content and provide 5 specific, actionable engagement improvement tips.\n\nContent:\n"""\n${text.slice(0, 4000)}\n"""\n\nProvide your response as a JSON array with exactly 5 objects. Each object must have:\n- \"title\": A short, catchy title (5-8 words)\n- \"body\": A detailed explanation (2-3 sentences)\n- \"platform\": Best platform for this tip (Instagram/LinkedIn/Twitter/Facebook/TikTok)\n\nRespond ONLY with valid JSON, no other text.`;

    const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not found. Set REACT_APP_OPENAI_API_KEY in your environment.');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert social media strategist.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      // Fallback: try to parse whole content
      return JSON.parse(content);
    } catch (e) {
      // Very defensive fallback: build simple tips from lines
      const lines = content.split('\n').filter(l => l.trim()).slice(0, 5);
      return lines.map((l, i) => ({ title: `Tip ${i + 1}`, body: l, platform: 'General' }));
    }
  }

  async function handleFile(selectedFile) {
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);
    setError('');
    setExtractedText('');
    setTips([]);

    try {
      let text = '';
      if (selectedFile.type === 'application/pdf') {
        if (!pdfLibLoaded) throw new Error('PDF library still loading. Try again in a few seconds.');
        text = await extractTextFromPDF(selectedFile);
      } else if (selectedFile.type.startsWith('image/')) {
        text = await extractTextFromImage(selectedFile);
      } else if (selectedFile.type === 'text/plain' || /\.(txt|md)$/i.test(selectedFile.name)) {
        const reader = new FileReader();
        text = await new Promise((resolve, reject) => {
          reader.onload = e => resolve(e.target.result);
          reader.onerror = () => reject(new Error('Failed to read file')); 
          reader.readAsText(selectedFile);
        });
      } else {
        throw new Error('Unsupported file type. Upload a PDF or text file.');
      }

      if (!text || text.length < 10) throw new Error('No text could be extracted from this file.');
      setExtractedText(text);
      const engagementTips = await getEngagementTips(text);
      setTips(engagementTips);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Processing error');
    } finally {
      setLoading(false);
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }

  function handleChange(e) {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  }

  function resetApp() {
    setFile(null);
    setExtractedText('');
    setTips([]);
    setError('');
  }

  function downloadTips() {
    const blob = new Blob([JSON.stringify(tips, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'tips'}.tips.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyTips() {
    navigator.clipboard?.writeText(JSON.stringify(tips, null, 2));
  }

  // --- Styles: component-scoped (keeps everything in one file) ---
  const styles = `
    .sma-root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #1f2937; padding: 28px; background: linear-gradient(180deg,#fbfbff 0%, #fff7fb 100%); min-height:100vh; }
    .container { max-width: 980px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 22px; }
    .title { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; display:flex; align-items:center; justify-content:center; gap:12px; }
    .subtitle { color: #6b7280; margin-top:8px; }

    .card { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 8px 30px rgba(16,24,40,0.06); border: 1px solid rgba(99,102,241,0.06); }

    .dropzone { border: 2px dashed rgba(99,102,241,0.18); border-radius: 12px; padding: 34px; text-align:center; transition: all 180ms ease; }
    .dropzone.drag { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.45); background: linear-gradient(90deg, rgba(243,244,255,0.8), rgba(255,244,250,0.7)); }

    .btn { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius: 12px; cursor:pointer; font-weight:600; }
    .btn-primary { background: linear-gradient(90deg,#7c3aed,#ec4899); color:white; border:none; }
    .btn-ghost { background:transparent; border:1px solid #e6e6f0; color:#374151; }

    .file-row { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:14px; }
    .file-info { display:flex; align-items:center; gap:12px; }
    .file-meta { color:#6b7280; font-size:13px; }

    .loader { display:flex; flex-direction:column; align-items:center; gap:12px; }
    .spinner { width:56px; height:56px; border-radius:50%; border:6px solid rgba(124,58,237,0.12); border-top-color: #7c3aed; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg) }}

    .extracted { white-space:pre-wrap; background:#fbfbff; padding:14px; border-radius:10px; border:1px solid #eef2ff; color:#374151; max-height:320px; overflow:auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Segoe UI Mono'; }

    .tips-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap:14px; }
    .tip-card { background: linear-gradient(180deg,#fff,#fbfdff); padding:14px; border-radius:12px; border:1px solid rgba(96,165,250,0.08); box-shadow: 0 6px 20px rgba(16,24,40,0.04); }

    .error { display:flex; gap:12px; align-items:flex-start; background: #fff7f7; border:1px solid #ffe4e6; padding:12px; border-radius:10px; color:#b91c1c; }

    .empty-state { text-align:center; padding:36px; color:#6b7280; }

    .controls { display:flex; gap:8px; align-items:center; }

    @media (max-width:600px) {
      .title { font-size:20px; }
    }
  `;

  return (
    <div className="sma-root">
      <style>{styles}</style>
      <div className="container">
        <div className="header">
          <div className="title">
            <div style={{ width:44, height:44, borderRadius:10, background: 'linear-gradient(90deg,#7c3aed,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkles style={{ color: 'white' }} />
            </div>
            <div>Social Media Content Analyzer</div>
          </div>
          <div className="subtitle">Upload a PDF or text file to get concise AI engagement suggestions</div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div
            className={`dropzone ${dragActive ? 'drag' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width:60, height:60, borderRadius: 14, display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f6ff' }}>
                <Upload />
              </div>
              <div style={{ fontWeight:700, fontSize:16 }}>Drag & drop your file here</div>
              <div style={{ color:'#6b7280' }}>or</div>
              <label style={{ display:'inline-block' }}>
                <input
                  type="file"
                  accept=".txt,.md,.pdf"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                <div className={`btn ${loading ? 'btn-ghost' : 'btn-primary'}`}>
                  {loading ? 'Processing...' : pdfLibLoaded ? 'Choose File' : 'Loading PDF library...'}
                </div>
              </label>
              <div style={{ marginTop:10, color:'#9ca3af', fontSize:13 }}>Supported: .txt .md .pdf</div>
            </div>
          </div>

          {file && (
            <div className="file-row">
              <div className="file-info">
                <div style={{ width:44, height:44, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:'#f3f4ff' }}>
                  {file.type === 'application/pdf' ? <FileText /> : file.type.startsWith('image/') ? <Image /> : <FileText /> }
                </div>
                <div>
                  <div style={{ fontWeight:700 }}>{file.name}</div>
                  <div className="file-meta">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <div className="controls">
                <button onClick={resetApp} className="btn btn-ghost"><X /> Reset</button>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="loader">
              <div className="spinner" aria-hidden="true"></div>
              <div style={{ fontWeight:700 }}>{extractedText ? 'Analyzing with AI...' : 'Extracting text...'}</div>
              <div style={{ color:'#6b7280' }}>This can take a few moments</div>
            </div>
          </div>
        )}

        {error && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="error">
              <AlertCircle />
              <div>
                <div style={{ fontWeight:700 }}>Error</div>
                <div style={{ marginTop:6 }}>{error}</div>
                <div style={{ marginTop:10 }}>
                  <button onClick={resetApp} className="btn btn-primary">Try again</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {extractedText && !loading && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <FileText />
                <div style={{ fontWeight:700 }}>Extracted text</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(extractedText)}>Copy</button>
              </div>
            </div>
            <div className="extracted">{extractedText}</div>
          </div>
        )}

        {tips.length > 0 && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <Sparkles />
                <div style={{ fontWeight:700, fontSize:16 }}>AI-Powered Engagement Tips</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-ghost" onClick={copyTips}><Copy /> Copy JSON</button>
                <button className="btn btn-primary" onClick={downloadTips}><Download /> Download</button>
              </div>
            </div>

            <div className="tips-grid">
              {tips.map((tip, i) => (
                <div key={i} className="tip-card">
                  <div style={{ display:'flex', justifyContent:'space-between', gap:10, alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ background:'#ecfdf5', padding:8, borderRadius:8 }}><CheckCircle /></div>
                      <div style={{ fontWeight:700 }}>{tip.title}</div>
                    </div>
                    {tip.platform && <div style={{ fontSize:12, background:'#f3f4ff', padding:'6px 8px', borderRadius:999, fontWeight:700 }}>{tip.platform}</div>}
                  </div>
                  <div style={{ color:'#4b5563' }}>{tip.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !extractedText && !error && (
          <div className="card empty-state">
            <div style={{ fontWeight:700, fontSize:18 }}>Ready to analyze your content</div>
            <div style={{ marginTop:8 }}>Upload a PDF or text file and we will suggest ways to boost engagement</div>
          </div>
        )}
      </div>
    </div>
  );
}
