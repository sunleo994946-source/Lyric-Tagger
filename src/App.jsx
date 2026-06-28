import { useState, useRef, useEffect, useCallback } from 'react'
import translations from './translations'
import './App.css'

function App() {
  const [lyrics, setLyrics] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [timings, setTimings] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioName, setAudioName] = useState('')
  const [lyricsLoaded, setLyricsLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [lang, setLang] = useState('zh')
  const audioRef = useRef(null)
  const lyricsRef = useRef(null)
  const progressRef = useRef(null)

  const t = translations[lang]

  const handleAudioImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      audioRef.current.src = url
      setAudioName(file.name)
      audioRef.current.load()
    }
  }

  const handleLyricsImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target.result
        const lines = text.split('\n').filter(line => line.trim() !== '')
        setLyrics(lines)
        setTimings(new Array(lines.length).fill(null))
        setCurrentIndex(-1)
        setLyricsLoaded(true)
      }
      reader.readAsText(file)
    }
  }

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play()
      setIsPlaying(true)
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    audioRef.current.volume = val
    setIsMuted(val === 0)
  }

  const handleTimeUpdate = () => {
    if (!isDragging) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration)
  }

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const time = pos * duration
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleProgressMouseDown = (e) => {
    setIsDragging(true)
    handleProgressClick(e)
  }

  const handleProgressMouseMove = (e) => {
    if (isDragging) {
      const rect = progressRef.current.getBoundingClientRect()
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const time = pos * duration
      setCurrentTime(time)
    }
  }

  const handleProgressMouseUp = (e) => {
    if (isDragging) {
      const rect = progressRef.current.getBoundingClientRect()
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const time = pos * duration
      audioRef.current.currentTime = time
      setIsDragging(false)
    }
  }

  useEffect(() => {
    const handleGlobalMouseMove = () => {
      if (isDragging) {
        document.addEventListener('mousemove', handleProgressMouseMove)
        document.addEventListener('mouseup', handleProgressMouseUp)
      }
    }
    document.addEventListener('mousemove', handleProgressMouseMove)
    document.addEventListener('mouseup', handleProgressMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleProgressMouseMove)
      document.removeEventListener('mouseup', handleProgressMouseUp)
    }
  }, [isDragging])

  const skip = (seconds) => {
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
  }

  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' && lyricsLoaded) {
      e.preventDefault()
      if (currentIndex >= 0 && currentIndex < lyrics.length) {
        const time = audioRef.current.currentTime
        const newTimings = [...timings]
        newTimings[currentIndex] = time
        setTimings(newTimings)
        if (currentIndex < lyrics.length - 1) {
          setCurrentIndex(currentIndex + 1)
        }
      } else if (currentIndex === -1) {
        setCurrentIndex(0)
      }
    }
  }, [currentIndex, lyrics.length, lyricsLoaded, timings])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (lyricsRef.current && currentIndex >= 0) {
      const activeLine = lyricsRef.current.children[currentIndex]
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentIndex])

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formatTimeFull = (seconds) => {
    if (isNaN(seconds)) return '00:00.000'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
  }

  const timedCount = timings.filter(t => t !== null).length

  const clearAllTimings = () => {
    setTimings(new Array(lyrics.length).fill(null))
    setCurrentIndex(-1)
  }

  const formatSrtTime = (seconds) => {
    if (seconds === null) return '--:--.---'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
  }

  const exportSrt = () => {
    let srt = ''
    lyrics.forEach((line, i) => {
      const start = timings[i] || 0
      const end = timings[i + 1] || (timings[i] ? timings[i] + 2 : 2)
      srt += `${i + 1}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${line}\n\n`
    })
    const blob = new Blob([srt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const baseName = audioName ? audioName.replace(/\.[^/.]+$/, '') : 'lyrics'
    const suffix = lang === 'zh' ? '歌词' : lang === 'ja' ? '歌詞' : 'lyrics'
    a.download = `${baseName}_${suffix}.srt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileClick = (id) => {
    document.getElementById(id).click()
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="lang-switcher">
            <button className={`lang-btn ${lang === 'zh' ? 'active' : ''}`} onClick={() => setLang('zh')}>中</button>
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn ${lang === 'ja' ? 'active' : ''}`} onClick={() => setLang('ja')}>日</button>
          </div>
        </div>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <div className="main">
        <div className="player-section">
          <div className="import-buttons">
            <button className="import-btn" onClick={() => handleFileClick('audio-input')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              {audioName || t.importMusic}
            </button>
            <input type="file" id="audio-input" accept="audio/*" onChange={handleAudioImport} hidden />
            
            <button className="import-btn" onClick={() => handleFileClick('lyrics-input')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              {t.importLyrics}
            </button>
            <input type="file" id="lyrics-input" accept=".txt" onChange={handleLyricsImport} hidden />
          </div>

          <div className="player-controls">
            <button className="control-btn" onClick={() => skip(-5)} disabled={!audioName}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 3C17.15 3 21.08 6.03 22.45 10.22L20.08 11C18.96 7.62 15.96 5 12.5 5C10.54 5 8.77 5.77 7.5 7L10 9.5V3L5.5 7.5L10 12V6.5C11 5.95 11.73 5.5 12.5 5.5C15.26 5.5 17.5 7.74 17.5 10.5C17.5 13.26 15.26 15.5 12.5 15.5C11.08 15.5 9.82 14.89 8.91 13.92L7.07 15.76C8.37 17.05 10.3 17.82 12.5 17.82C16.54 17.82 19.82 14.54 19.82 10.5C19.82 6.46 16.54 3.18 12.5 3.18V3Z"/>
                <text x="5" y="16" fontSize="8" fontWeight="bold">5</text>
              </svg>
            </button>

            <button className="play-btn" onClick={togglePlay} disabled={!audioName}>
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>

            <button className="control-btn" onClick={() => skip(5)} disabled={!audioName}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 3C6.85 3 2.92 6.03 1.55 10.22L3.92 11C5.04 7.62 8.04 5 11.5 5C13.46 5 15.23 5.77 16.5 7L14 9.5V3L18.5 7.5L14 12V6.5C13 5.95 12.27 5.5 11.5 5.5C8.74 5.5 6.5 7.74 6.5 10.5C6.5 13.26 8.74 15.5 11.5 15.5C12.92 15.5 14.18 14.89 15.09 13.92L16.93 15.76C15.63 17.05 13.7 17.82 11.5 17.82C7.46 17.82 4.18 14.54 4.18 10.5C4.18 6.46 7.46 3.18 11.5 3.18V3Z"/>
                <text x="14" y="16" fontSize="8" fontWeight="bold">5</text>
              </svg>
            </button>
          </div>

          <div className="progress-section">
            <span className="time">{formatTimeFull(currentTime)}</span>
            <div 
              className="progress-bar" 
              ref={progressRef}
              onMouseDown={handleProgressMouseDown}
            >
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                <div className="progress-thumb" style={{ left: `${progressPercent}%` }}></div>
              </div>
            </div>
            <span className="time">{formatTimeFull(duration)}</span>
          </div>

          <div className="volume-section">
            <button className="volume-btn" onClick={toggleMute} disabled={!audioName}>
              {isMuted || volume === 0 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : volume < 0.5 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>
            <input 
              type="range" 
              className="volume-slider"
              min="0" 
              max="1" 
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={!audioName}
            />
          </div>

          <div className="instructions">
            <h3>{t.instructions.title}</h3>
            <ul>
              {t.instructions.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          <audio 
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          ></audio>
        </div>

        <div className="lyrics-section">
          <div className="lyrics-header">
            <span className="hint">
              {lyricsLoaded ? t.pressSpace : t.importHint}
            </span>
            <span className="progress">
              {lyricsLoaded ? `${timedCount} / ${lyrics.length} ${t.linesTimed}` : ''}
            </span>
          </div>
          <div className="lyrics-container" ref={lyricsRef}>
            {lyrics.map((line, i) => (
              <div 
                key={i} 
                className={`lyric-line ${i === currentIndex ? 'active' : ''} ${timings[i] !== null ? 'timed' : ''}`}
                onClick={() => {
                  setCurrentIndex(i)
                  if (timings[i] !== null) {
                    audioRef.current.currentTime = timings[i]
                  }
                }}
              >
                <span className="line-number">{i + 1}</span>
                <span className="line-text">{line}</span>
                <span className="line-time">{timings[i] !== null ? formatTimeFull(timings[i]) : '--:--.---'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <button className="clear-btn" onClick={clearAllTimings} disabled={!lyricsLoaded || timedCount === 0}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          {t.clearTimings}
        </button>
        <button className="export-btn" onClick={exportSrt} disabled={!lyricsLoaded}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {t.exportSrt}
        </button>
      </footer>
      
      <div className="contact">
        <p>
          {t.contact}
          {lang === 'zh' ? (
            <strong>1056333285</strong>
          ) : (
            <a href="https://github.com/anomalyco/opencode/issues" target="_blank" rel="noopener noreferrer">GitHub</a>
          )}
          {t.contactSuffix}
        </p>
      </div>
    </div>
  )
}

export default App
