import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [duration, setDuration] = useState(5 * 60);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [sound, setSound] = useState(true);
  const [minutes, setMinutes] = useState('5');
  const [seconds, setSeconds] = useState('0');
  const deadline = useRef(0);
  const remainingMs = useRef(5 * 60 * 1000);
  const audio = useRef(null);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (!left) {
        remainingMs.current = 0;
        setRunning(false); setDone(true);
        if (soundRef.current && audio.current) {
          const ctx = audio.current;
          for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator(), gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 660;
            const start = ctx.currentTime + i * .45;
            gain.gain.setValueAtTime(.15, start);
            gain.gain.exponentialRampToValueAtTime(.001, start + .35);
            osc.start(start); osc.stop(start + .35);
          }
        }
      }
    };
    tick(); const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    document.title = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')} · 운동타이머`;
  }, [remaining]);

  function configure(total) {
    if (!Number.isInteger(total) || total <= 0 || total > 999 * 60 + 59) return;
    remainingMs.current = total * 1000;
    setRunning(false); setDone(false); setDuration(total); setRemaining(total);
    setMinutes(String(Math.floor(total / 60))); setSeconds(String(total % 60));
  }
  function toggle() {
    if (running) {
      remainingMs.current = Math.max(0, deadline.current - Date.now());
      setRemaining(Math.ceil(remainingMs.current / 1000));
      setRunning(false);
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) { audio.current ||= new AudioContext(); audio.current.resume().catch(() => {}); }
    } catch {}
    const next = remainingMs.current || duration * 1000;
    remainingMs.current = next;
    setRemaining(Math.ceil(next / 1000)); setDone(false); deadline.current = Date.now() + next; setRunning(true);
  }
  const progress = remaining / duration;
  return <div className="app">
    <header><a className="brand" href="./"><span className="brand-icon">◴</span> 운동타이머<span className="brand-sub">MOVE AT YOUR PACE</span></a><span className="header-tag">오늘의 운동, 지금 시작</span></header>
    <main>
      <div className="eyebrow"><span/> TIME TO MOVE</div>
      <h1>가볍게 시작하고, 끝까지 움직여요.</h1>
      <p className="intro">스트레칭부터 런닝까지, 나의 페이스에 맞춘 운동 시간.</p>
      <section className="timer-card" aria-label="카운트다운 타이머">
        <div className="card-top"><span>운동타이머</span><button className="sound" onClick={() => setSound(!sound)} aria-pressed={sound} aria-label="종료 알림 소리">{sound ? '♫' : '♪'} <span>알림 {sound ? '켜짐' : '꺼짐'}</span></button></div>
        <div className="dial">
          <svg viewBox="0 0 320 320" aria-hidden="true"><circle className="track" cx="160" cy="160" r="145"/><circle className="progress" cx="160" cy="160" r="145" strokeDasharray={2 * Math.PI * 145} strokeDashoffset={2 * Math.PI * 145 * (1 - progress)}/></svg>
          <div className="dial-content"><span className="status">{done ? '수고했어요!' : running ? '운동 중 · 페이스를 유지해요' : remaining !== duration ? '잠시 쉬어가요' : '운동할 준비가 됐나요?'}</span><div className="time" role="timer" aria-label={`남은 시간 ${Math.floor(remaining / 60)}분 ${remaining % 60}초`}>{String(Math.floor(remaining / 60)).padStart(2,'0')}<span>:</span>{String(remaining % 60).padStart(2,'0')}</div><span className="dial-label">{done ? '오늘도 한 걸음 더 나아갔어요' : 'EVERY MOVE COUNTS'}</span></div>
        </div>
        <div className="controls"><button className="reset" onClick={() => configure(duration)} aria-label="타이머 초기화">↺</button><button className="start" onClick={toggle}><span>{running ? 'Ⅱ' : '▶'}</span>{running ? '일시정지' : remaining !== duration && remaining > 0 ? '계속하기' : '시작하기'}</button></div>
        <div className="divider"/>
        <p className="setting-label">오늘은 어떤 운동을 할까요?</p>
        <div className="presets">{[{name: '스트레칭', minutes: 1, icon: '↟'}, {name: '런지', minutes: 3, icon: '⇅'}, {name: '런닝', minutes: 5, icon: '↗'}].map(exercise => <button key={exercise.name} aria-pressed={duration === exercise.minutes * 60} className={duration === exercise.minutes * 60 ? 'selected' : ''} onClick={() => configure(exercise.minutes * 60)}><span className="exercise-icon" aria-hidden="true">{exercise.icon}</span><span>{exercise.name}</span><strong>{exercise.minutes}분</strong></button>)}</div>
        <form className="custom" onSubmit={e => { e.preventDefault(); configure(Number(minutes) * 60 + Number(seconds)); }}><span>직접 설정</span><label><input aria-label="분" type="number" min="0" max="999" required value={minutes} onChange={e => setMinutes(e.target.value)}/>분</label><label><input aria-label="초" type="number" min="0" max="59" required value={seconds} onChange={e => setSeconds(e.target.value)}/>초</label><button type="submit" disabled={Number(minutes) * 60 + Number(seconds) <= 0}>적용</button></form>
        <div className="completion" role="status">{done ? '✓ 설정한 시간이 끝났어요. 호흡을 고르고 잠시 쉬어주세요.' : '\u00a0'}</div>
      </section>
      <p className="footnote"><span>✧</span> 작은 움직임이 모여, 더 건강한 하루가 됩니다.</p>
    </main><footer><span>운동타이머</span><span>오늘도, 당신의 속도대로.</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
