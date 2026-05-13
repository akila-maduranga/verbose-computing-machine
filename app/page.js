"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Video, FileText, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { extractAudio } from "@/lib/ffmpeg";

export default function Home() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [vttUrl, setVttUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, processing, transcribing, completed, error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("video/")) {
        setError("Please select a valid video file.");
        return;
      }
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setVttUrl(null);
      setStatus("idle");
      setError(null);
    }
  };

  const processVideo = async () => {
    if (!file) return;

    try {
      setStatus("processing");
      setProgress(20);
      setError(null);

      // 1. Extract Audio using FFmpeg WASM
      const audioBlob = await extractAudio(file);
      setProgress(50);
      
      // 2. Send to API for transcription
      setStatus("transcribing");
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.mp3");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      // 3. Create VTT Blob URL
      const vttBlob = new Blob([data.vtt], { type: "text/vtt" });
      setVttUrl(URL.createObjectURL(vttBlob));
      
      setStatus("completed");
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="container">
      <header>
        <h1 className="title">Subtitle Magic</h1>
        <p className="subtitle">Secure, AI-powered subtitles for your videos. Powered by ElevenLabs Scribe v2.</p>
      </header>

      <main>
        {!videoUrl ? (
          <div 
            className="glass upload-card"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragging'); }}
            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('dragging'); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('dragging');
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) handleFileChange({ target: { files: [droppedFile] } });
            }}
          >
            <div className="icon-wrapper">
              <Upload size={32} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3>Click or drag to upload video</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>MP4, MOV, or WEBM up to 100MB</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="video/*" 
              style={{ display: 'none' }} 
            />
          </div>
        ) : (
          <div className="glass" style={{ padding: '2rem' }}>
            <div className="video-container">
              <video ref={videoRef} controls crossOrigin="anonymous">
                <source src={videoUrl} type={file.type} />
                {vttUrl && (
                  <track 
                    kind="subtitles" 
                    src={vttUrl} 
                    srcLang="en" 
                    label="English" 
                    default 
                  />
                )}
              </video>
            </div>

            <div className="progress-container">
              {status === "idle" && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={processVideo}>
                    <Sparkles size={20} />
                    Generate Subtitles
                  </button>
                </div>
              )}

              {(status === "processing" || status === "transcribing") && (
                <>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="status-text">
                    <span className="pulse">
                      {status === "processing" ? "Extracting audio tracks..." : "Generating subtitles with AI..."}
                    </span>
                    <span>{progress}%</span>
                  </div>
                </>
              )}

              {status === "completed" && (
                <div style={{ textAlign: 'center', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} />
                  <span>Subtitles generated successfully!</span>
                </div>
              )}

              {status === "error" && (
                <div style={{ textAlign: 'center', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                  <button className="btn btn-primary" onClick={processVideo} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>Retry</button>
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <button className="btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => { setVideoUrl(null); setFile(null); setStatus("idle"); }}>
                Change Video
              </button>
              {vttUrl && (
                <a href={vttUrl} download="subtitles.vtt" className="btn btn-primary">
                  Download .VTT
                </a>
              )}
            </div>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '6rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
        <p>&copy; 2026 Subtitle Magic. All processing happens securely.</p>
      </footer>
    </div>
  );
}
