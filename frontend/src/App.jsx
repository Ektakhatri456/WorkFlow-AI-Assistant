import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Sparkles,
  Search,
  Lightbulb,
  Upload,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  summarizeText,
  askQuestion,
  generateContent,
  analyzeText,
  getSuggestions,
  analyzeDocument,
} from './services/api';
import './App.css';

const FEATURES = [
  {
    id: 'summarize',
    title: 'Summarize',
    icon: FileText,
    description: 'Condense long text into clear summaries',
  },
  {
    id: 'ask',
    title: 'Ask Questions',
    icon: MessageSquare,
    description: 'Get answers from any text or document',
  },
  {
    id: 'generate',
    title: 'Generate Content',
    icon: Sparkles,
    description: 'Create emails, blogs, posts & more',
  },
  {
    id: 'analyze',
    title: 'Analyze Text',
    icon: Search,
    description: 'Deep insights, sentiment & key points',
  },
  {
    id: 'suggest',
    title: 'Smart Suggestions',
    icon: Lightbulb,
    description: 'Actionable productivity recommendations',
  },
  {
    id: 'document',
    title: 'Document Upload',
    icon: Upload,
    description: 'Upload & analyze .txt / .md files',
  },
];

function App() {
  const [activeFeature, setActiveFeature] = useState('summarize');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [text, setText] = useState('');
  const [question, setQuestion] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [contentType, setContentType] = useState('general');
  const [focus, setFocus] = useState('general');
  const [goal, setGoal] = useState('improve productivity');
  const [file, setFile] = useState(null);

  const resetOutput = () => {
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleFeatureChange = (id) => {
    setActiveFeature(id);
    resetOutput();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetOutput();

    let response;

    try {
      switch (activeFeature) {
        case 'summarize':
          if (!text.trim()) throw new Error('Please enter some text to summarize');
          response = await summarizeText(text, tone, length);
          break;

        case 'ask':
          if (!text.trim() || !question.trim())
            throw new Error('Please provide both context and a question');
          response = await askQuestion(text, question);
          break;

        case 'generate':
          if (!prompt.trim()) throw new Error('Please enter a prompt');
          response = await generateContent(prompt, contentType, tone, length);
          break;

        case 'analyze':
          if (!text.trim()) throw new Error('Please enter text to analyze');
          response = await analyzeText(text, focus);
          break;

        case 'suggest':
          if (!text.trim()) throw new Error('Please enter some text');
          response = await getSuggestions(text, goal);
          break;

        case 'document':
          if (!file) throw new Error('Please select a file to upload');
          response = await analyzeDocument(file, question || null);
          break;

        default:
          throw new Error('Unknown feature');
      }

      if (response.success) {
        setResult(response.data.result);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFormFields = () => {
    switch (activeFeature) {
      case 'summarize':
        return (
          <>
            <div className="form-group">
              <label>Text to Summarize</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your long text, article, meeting notes, or document content here..."
                rows={8}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="academic">Academic</option>
                  <option value="simple">Simple / Easy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Length</label>
                <select value={length} onChange={(e) => setLength(e.target.value)}>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long / Detailed</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'ask':
        return (
          <>
            <div className="form-group">
              <label>Context / Source Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the document or text that contains the information..."
                rows={7}
                required
              />
            </div>
            <div className="form-group">
              <label>Your Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to know?"
                required
              />
            </div>
          </>
        );

      case 'generate':
        return (
          <>
            <div className="form-group">
              <label>What do you want to create?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Write a follow-up email after a product demo, or Create a LinkedIn post about finishing an AI internship project..."
                rows={5}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Content Type</label>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                  <option value="general">General</option>
                  <option value="email">Email</option>
                  <option value="blog">Blog / Article</option>
                  <option value="social">Social Media</option>
                  <option value="report">Report</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="persuasive">Persuasive</option>
                </select>
              </div>
              <div className="form-group">
                <label>Length</label>
                <select value={length} onChange={(e) => setLength(e.target.value)}>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'analyze':
        return (
          <>
            <div className="form-group">
              <label>Text to Analyze</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste text for deep analysis..."
                rows={8}
                required
              />
            </div>
            <div className="form-group">
              <label>Focus Area</label>
              <select value={focus} onChange={(e) => setFocus(e.target.value)}>
                <option value="general">Comprehensive Analysis</option>
                <option value="sentiment">Sentiment & Tone</option>
                <option value="key_points">Key Points & Insights</option>
                <option value="structure">Structure & Clarity</option>
              </select>
            </div>
          </>
        );

      case 'suggest':
        return (
          <>
            <div className="form-group">
              <label>Your Text / Situation</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe your current text, task list, or situation..."
                rows={7}
                required
              />
            </div>
            <div className="form-group">
              <label>Goal</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. improve productivity, write better emails, prioritize tasks"
              />
            </div>
          </>
        );

      case 'document':
        return (
          <>
            <div className="form-group">
              <label>Upload Document (.txt or .md)</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept=".txt,.md,text/plain"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
                {file && <span className="file-name">{file.name}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Optional Question (leave empty to summarize)</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something about the document..."
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <div className="logo-icon">
              <Zap size={22} />
            </div>
            <div>
              <h1>WorkFlow AI Assistant</h1>
              <p className="tagline">AI-Powered Productivity Tools</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container main">
        {/* Feature Tabs */}
        <div className="feature-tabs">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                className={`feature-tab ${activeFeature === f.id ? 'active' : ''}`}
                onClick={() => handleFeatureChange(f.id)}
              >
                <Icon size={18} />
                <span>{f.title}</span>
              </button>
            );
          })}
        </div>

        <div className="workspace">
          {/* Input Panel */}
          <section className="panel input-panel">
            <div className="panel-header">
              <h2>{FEATURES.find((f) => f.id === activeFeature)?.title}</h2>
              <p>{FEATURES.find((f) => f.id === activeFeature)?.description}</p>
            </div>

            <form onSubmit={handleSubmit}>
              {renderFormFields()}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Run AI
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Output Panel */}
          <section className="panel output-panel">
            <div className="panel-header">
              <h2>Result</h2>
              {result && (
                <button className="btn-copy" onClick={copyToClipboard} title="Copy to clipboard">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <div className="output-content">
              {loading && (
                <div className="state-message loading-state">
                  <Loader2 className="spin" size={32} />
                  <p>AI is thinking...</p>
                  <span>This usually takes a few seconds</span>
                </div>
              )}

              {!loading && error && (
                <div className="state-message error-state">
                  <AlertCircle size={32} />
                  <p>Error</p>
                  <span>{error}</span>
                </div>
              )}

              {!loading && !error && !result && (
                <div className="state-message empty-state">
                  <Sparkles size={32} />
                  <p>Ready when you are</p>
                  <span>Fill the form and click "Run AI" to see results here</span>
                </div>
              )}

              {!loading && result && (
                <div className="result-text">{result}</div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            WorkFlow AI Assistant • Week 1 Project
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
