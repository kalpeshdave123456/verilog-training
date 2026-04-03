
const { useEffect, useMemo, useState } = React;

const STORAGE_KEY = 'verilog_training_progress_v1';

const defaultProgress = {
  answered: {},
  completedLessons: {},
  solvedProblems: {},
  solvedWaveforms: {},
  notes: '',
  planner: { minutesPerDay: 45, daysPerWeek: 5, targetWeeks: 8 },
  companyTrack: 'General'
};

function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || initial; } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

function markdownToHtml(md) {
  return md
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code.trim())}</code></pre>`)
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br/><br/>');
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

async function loadJson(path) { return fetch(path).then(r => r.json()); }
async function loadText(path) { return fetch(path).then(r => r.text()); }

function App() {
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState({ lessons: [], questions: [], problems: [], tests: [], waveforms: [], videos: [] });
  const [lessonBody, setLessonBody] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [progress, setProgress] = usePersistentState(STORAGE_KEY, defaultProgress);

  useEffect(() => {
    Promise.all([
      loadJson('./content/lessons/manifest.json'),
      loadJson('./content/questions/questions.json'),
      loadJson('./content/problems/problems.json'),
      loadJson('./content/tests/tests.json'),
      loadJson('./content/waveforms/waveforms.json'),
      loadJson('./content/videos/videos.json')
    ]).then(([lessons, questions, problems, tests, waveforms, videos]) => {
      setData({ lessons, questions, problems, tests, waveforms, videos });
      if (lessons[0]) setSelectedLesson(lessons[0]);
    });
  }, []);

  useEffect(() => {
    if (selectedLesson?.file) {
      loadText(`./${selectedLesson.file}`).then(setLessonBody);
    }
  }, [selectedLesson]);

  const navItems = [
    ['dashboard', 'Dashboard'],
    ['learn', 'Learn'],
    ['practice', 'MCQ Practice'],
    ['problems', 'RTL Problems'],
    ['waveforms', 'Waveform Lab'],
    ['tests', 'Test Mode'],
    ['playground', 'RTL Playground'],
    ['planner', 'Planner & Tracks'],
    ['videos', 'Videos']
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Verilog Training<small>Verilog + VHDL | Interview-first | GitHub Pages ready</small></div>
        <div className="nav">
          {navItems.map(([id, label]) => (
            <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}>{label}</button>
          ))}
        </div>
        <div className="card" style={{ marginTop: 18 }}>
          <div className="muted">Current company track</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{progress.companyTrack}</div>
          <div className="footer-note">This is the optional power move: switch company-oriented drill tracks and use the RTL playground for local code feedback.</div>
        </div>
      </aside>
      <main className="content">
        {page === 'dashboard' && <Dashboard data={data} progress={progress} setPage={setPage} />}
        {page === 'learn' && <LearnPage lessons={data.lessons} selectedLesson={selectedLesson} setSelectedLesson={setSelectedLesson} lessonBody={lessonBody} progress={progress} setProgress={setProgress} />}
        {page === 'practice' && <PracticePage questions={data.questions} progress={progress} setProgress={setProgress} />}
        {page === 'problems' && <ProblemsPage problems={data.problems} progress={progress} setProgress={setProgress} />}
        {page === 'waveforms' && <WaveformPage waveforms={data.waveforms} progress={progress} setProgress={setProgress} />}
        {page === 'tests' && <TestsPage tests={data.tests} questions={data.questions} progress={progress} setProgress={setProgress} />}
        {page === 'playground' && <PlaygroundPage />}
        {page === 'planner' && <PlannerPage data={data} progress={progress} setProgress={setProgress} />}
        {page === 'videos' && <VideosPage videos={data.videos} />}
      </main>
    </div>
  );
}

function Dashboard({ data, progress, setPage }) {
  const answered = Object.keys(progress.answered || {}).length;
  const lessonsDone = Object.keys(progress.completedLessons || {}).length;
  const problemsDone = Object.keys(progress.solvedProblems || {}).length;
  const completion = Math.round(((answered + lessonsDone + problemsDone) / Math.max(1, data.questions.length + data.lessons.length + data.problems.length)) * 100);
  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="hero">
        <div className="card">
          <div className="chip">Hybrid learning app</div>
          <h1 style={{ marginBottom: 8 }}>Learn HDL, practice interviews, and debug RTL in one place.</h1>
          <p className="muted">Built for freshers and early-career hardware engineers with equal Verilog and VHDL coverage, test mode, waveform reasoning, and a local RTL playground.</p>
          <div className="row">
            <button className="option" onClick={() => setPage('learn')}>Start learning</button>
            <button className="option" onClick={() => setPage('practice')}>Open practice</button>
            <button className="option" onClick={() => setPage('playground')}>Try playground</button>
          </div>
        </div>
        <div className="card">
          <div className="muted">Overall completion</div>
          <div className="kpi"><div className="stat">{completion}%</div><div className="muted">saved in localStorage</div></div>
          <div className="progress"><div style={{ width: `${completion}%` }} /></div>
          <div className="footer-note">No backend needed. This runs entirely as a static app on GitHub Pages.</div>
        </div>
      </div>
      <div className="grid grid-3">
        <StatCard label="Lessons" value={data.lessons.length} sub={`${lessonsDone} completed`} />
        <StatCard label="MCQs" value={data.questions.length} sub={`${answered} attempted`} />
        <StatCard label="RTL Problems" value={data.problems.length} sub={`${problemsDone} solved`} />
        <StatCard label="Waveforms" value={data.waveforms.length} sub={`${Object.keys(progress.solvedWaveforms || {}).length} reviewed`} />
        <StatCard label="Tests" value={data.tests.length} sub="Timed exam mode" />
        <StatCard label="Track" value={progress.companyTrack} sub="Optional power move" />
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h3>Recommended path</h3>
          <ol className="muted">
            <li>Finish 5 core lessons.</li>
            <li>Do 50 MCQs in mixed mode.</li>
            <li>Solve 10 RTL problems.</li>
            <li>Complete 5 waveform drills.</li>
            <li>Take a full timed test.</li>
          </ol>
        </div>
        <div className="card">
          <h3>Included optional power moves</h3>
          <div className="list">
            <div className="item">Company-focused tracks: General, NVIDIA, Intel, AMD, Qualcomm</div>
            <div className="item">Local RTL playground with heuristic feedback for common interview bugs</div>
            <div className="item">Planner that estimates weekly load based on your target schedule</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return <div className="card"><div className="muted">{label}</div><div className="stat">{value}</div><div className="footer-note">{sub}</div></div>;
}

function LearnPage({ lessons, selectedLesson, setSelectedLesson, lessonBody, progress, setProgress }) {
  const markDone = () => setProgress(prev => ({ ...prev, completedLessons: { ...prev.completedLessons, [selectedLesson.id]: true } }));
  return (
    <div className="layout-2">
      <div className="card">
        <h3>Lessons</h3>
        <div className="list">
          {lessons.map(lesson => (
            <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}>
              <div>{lesson.title}</div>
              <div className="footer-note">{progress.completedLessons?.[lesson.id] ? 'Completed' : 'Open lesson'}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>{selectedLesson?.title || 'Lesson'}</h2>
          <button className="option" onClick={markDone}>Mark complete</button>
        </div>
        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(lessonBody || 'Loading...') }} />
      </div>
    </div>
  );
}

function PracticePage({ questions, progress, setProgress }) {
  const [difficulty, setDifficulty] = useState('all');
  const [topic, setTopic] = useState('all');
  const [track, setTrack] = useState(progress.companyTrack || 'General');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const filtered = useMemo(() => questions.filter(q => (difficulty === 'all' || q.difficulty === difficulty) && (topic === 'all' || q.topic === topic) && (track === 'all' || q.companyTrack === track)), [questions, difficulty, topic, track]);
  const q = filtered[index] || filtered[0];
  useEffect(() => { setIndex(0); setSelected(null); setSubmitted(false); }, [difficulty, topic, track]);
  if (!q) return <div className="card">No questions match the filter.</div>;

  const submit = () => {
    if (!selected) return;
    setSubmitted(true);
    setProgress(prev => ({ ...prev, answered: { ...prev.answered, [q.id]: selected === q.answer } }));
  };
  const next = () => { setSelected(null); setSubmitted(false); setIndex((index + 1) % filtered.length); };
  const topics = [...new Set(questions.map(q => q.topic))];
  const tracks = ['all', ...new Set(questions.map(q => q.companyTrack))];

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card row">
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="all">All difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
        <select value={topic} onChange={e => setTopic(e.target.value)}><option value="all">All topics</option>{topics.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select value={track} onChange={e => { setTrack(e.target.value); setProgress(prev => ({ ...prev, companyTrack: e.target.value === 'all' ? 'General' : e.target.value })); }}>{tracks.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <div className="chip">{filtered.length} questions in current filter</div>
      </div>
      <div className="card">
        <div className="row"><div className="chip">{q.topic}</div><div className="chip">{q.difficulty}</div><div className="chip">{q.companyTrack}</div></div>
        <h2>{q.question}</h2>
        <div className="grid">
          {q.options.map(opt => {
            let cls = 'option';
            if (submitted && opt === q.answer) cls += ' correct';
            else if (submitted && opt === selected && opt !== q.answer) cls += ' wrong';
            return <div key={opt} className={cls} onClick={() => !submitted && setSelected(opt)}>{opt}</div>;
          })}
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="option" onClick={submit}>Submit</button>
          <button className="option" onClick={next}>Next</button>
        </div>
        {submitted && <div className="card" style={{ marginTop: 14 }}><strong>{selected === q.answer ? 'Correct.' : 'Review this.'}</strong><div className="footer-note">{q.explanation}</div></div>}
      </div>
    </div>
  );
}

function ProblemsPage({ problems, progress, setProgress }) {
  const [selectedId, setSelectedId] = useState(problems[0]?.id || 1);
  const [showSolution, setShowSolution] = useState(false);
  useEffect(() => { if (problems[0] && !selectedId) setSelectedId(problems[0].id); }, [problems]);
  const problem = problems.find(p => p.id === selectedId) || problems[0];
  if (!problem) return <div className="card">Loading problems...</div>;
  return (
    <div className="layout-2">
      <div className="card">
        <h3>Problem bank</h3>
        <div className="list">
          {problems.map(p => <button key={p.id} onClick={() => { setSelectedId(p.id); setShowSolution(false); }}>{p.title}<div className="footer-note">{p.topic} · {p.difficulty}</div></button>)}
        </div>
      </div>
      <div className="card">
        <div className="row"><div className="chip">{problem.topic}</div><div className="chip">{problem.difficulty}</div><div className="chip">{problem.companyTrack}</div></div>
        <h2>{problem.title}</h2>
        <p>{problem.prompt}</p>
        <pre><code>{problem.starterCode}</code></pre>
        <div className="row">
          <button className="option" onClick={() => setShowSolution(v => !v)}>{showSolution ? 'Hide solution' : 'Show solution'}</button>
          <button className="option" onClick={() => setProgress(prev => ({ ...prev, solvedProblems: { ...prev.solvedProblems, [problem.id]: true } }))}>Mark solved</button>
        </div>
        {showSolution && <div className="card" style={{ marginTop: 14 }}><pre><code>{problem.solution}</code></pre><div className="footer-note">{problem.explanation}</div></div>}
      </div>
    </div>
  );
}

function WaveformPage({ waveforms, progress, setProgress }) {
  const [idx, setIdx] = useState(0);
  const wf = waveforms[idx] || waveforms[0];
  if (!wf) return <div className="card">Loading waveform drills...</div>;
  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="row"><div className="chip">{wf.difficulty}</div><div className="chip">Waveform reasoning</div></div>
        <h2>{wf.title}</h2>
        <p>{wf.question}</p>
        <div className="ascii">{wf.diagram}</div>
        <div className="row">
          <button className="option" onClick={() => setProgress(prev => ({ ...prev, solvedWaveforms: { ...prev.solvedWaveforms, [wf.id]: true } }))}>Mark reviewed</button>
          <button className="option" onClick={() => setIdx((idx + 1) % waveforms.length)}>Next waveform</button>
        </div>
      </div>
      <div className="card">
        <h3>Answer logic</h3>
        <p>{wf.answer}</p>
        <div className="footer-note">{wf.explanation}</div>
      </div>
    </div>
  );
}

function TestsPage({ tests, questions, progress, setProgress }) {
  const [selectedTestId, setSelectedTestId] = useState(tests[0]?.test_id || 1);
  const [mode, setMode] = useState('list');
  const [answers, setAnswers] = useState({});
  const [startAt, setStartAt] = useState(null);
  const test = tests.find(t => t.test_id === selectedTestId) || tests[0];
  const testQuestions = useMemo(() => test ? test.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean) : [], [test, questions]);
  const elapsedSec = startAt ? Math.floor((Date.now() - startAt) / 1000) : 0;
  const remainingSec = Math.max(0, (test?.durationMinutes || 1) * 60 - elapsedSec);
  useEffect(() => {
    if (mode !== 'run' || remainingSec <= 0) return;
    const t = setInterval(() => setStartAt(x => x), 1000);
    return () => clearInterval(t);
  }, [mode, remainingSec]);

  const score = testQuestions.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0);

  if (!test) return <div className="card">Loading tests...</div>;

  if (mode === 'run') {
    return (
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>{test.name}</h2>
          <div className="chip">Time left: {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, '0')}</div>
        </div>
        <div className="grid" style={{ gap: 16 }}>
          {testQuestions.map((q, i) => (
            <div key={q.id} className="card">
              <div className="muted">Q{i+1} · {q.topic} · {q.difficulty}</div>
              <div style={{ margin: '8px 0 12px' }}>{q.question}</div>
              <div className="grid">{q.options.map(opt => <div key={opt} className="option" onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}>{opt}</div>)}</div>
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="option" onClick={() => setMode('result')}>Submit test</button>
        </div>
      </div>
    );
  }

  if (mode === 'result') {
    return (
      <div className="card">
        <h2>{test.name} results</h2>
        <div className="stat">{score} / {testQuestions.length}</div>
        <div className="footer-note">Use this after completing core lessons and mixed practice.</div>
        <button className="option" onClick={() => { setMode('list'); setAnswers({}); }}>Back to tests</button>
      </div>
    );
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>Available tests</h3>
        <div className="list">
          {tests.map(t => <button key={t.test_id} onClick={() => setSelectedTestId(t.test_id)}>{t.name}<div className="footer-note">{t.durationMinutes} min · {t.focus}</div></button>)}
        </div>
      </div>
      <div className="card">
        <h2>{test.name}</h2>
        <div className="row"><div className="chip">{test.focus}</div><div className="chip">{test.durationMinutes} minutes</div><div className="chip">{testQuestions.length} questions</div></div>
        <p className="muted">Timed, static, no-backend exam mode suitable for GitHub Pages.</p>
        <button className="option" onClick={() => { setStartAt(Date.now()); setAnswers({}); setMode('run'); }}>Start test</button>
      </div>
    </div>
  );
}

function analyzeRtl(code) {
  const findings = [];
  const lower = code.toLowerCase();
  if (/always\s*@\(posedge/.test(lower) && /[^<]=[^=]/.test(code)) findings.push({ level: 'warn', text: 'Clocked block appears to use blocking assignment. Prefer <= for sequential logic.' });
  if (/always\s*@\(\*\)/.test(lower) && /if\s*\(/.test(lower) && !/else/.test(lower)) findings.push({ level: 'warn', text: 'Combinational block has an if without else. Check for latch inference.' });
  if (/always\s*@\((?!\*)/.test(lower) && /if|case/.test(lower)) findings.push({ level: 'warn', text: 'Old-style sensitivity list detected. Make sure it is complete or use always @(*).' });
  if (/process\(/.test(lower) && /if rising_edge/.test(lower) && /:=/.test(code)) findings.push({ level: 'warn', text: 'You may be mixing variable assignment with signal intent in VHDL. Verify whether := or <= is appropriate.' });
  if (!/reset|rst/.test(lower)) findings.push({ level: 'ok', text: 'No reset signal detected. That can be fine, but be ready to justify the choice in interviews.' });
  if (/case/.test(lower) && !/default|when others/.test(lower)) findings.push({ level: 'warn', text: 'Case statement may be missing default / when others path.' });
  if (!findings.length) findings.push({ level: 'ok', text: 'No common lint-style issue detected by local heuristics.' });
  return findings;
}

function PlaygroundPage() {
  const [language, setLanguage] = useState('verilog');
  const [code, setCode] = useState('always @(*) begin\n  if (sel) y = a;\nend');
  const findings = useMemo(() => analyzeRtl(code), [code]);
  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>RTL Playground</h2>
          <select value={language} onChange={e => setLanguage(e.target.value)}><option value="verilog">Verilog</option><option value="vhdl">VHDL</option></select>
        </div>
        <p className="muted">Optional power move: local interview-style code feedback without any backend.</p>
        <textarea className="editor" value={code} onChange={e => setCode(e.target.value)} spellCheck="false" />
      </div>
      <div className="card">
        <h3>Feedback</h3>
        <div className="list">
          {findings.map((f, i) => <div key={i} className="item"><strong className={f.level === 'warn' ? 'badge-warn' : f.level === 'bad' ? 'badge-bad' : 'badge-ok'}>{f.level.toUpperCase()}</strong><div className="footer-note">{f.text}</div></div>)}
        </div>
        <div className="footer-note">This is heuristic feedback, not full simulation or synthesis. It is meant for quick interview prep and common bug spotting.</div>
      </div>
    </div>
  );
}

function PlannerPage({ data, progress, setProgress }) {
  const p = progress.planner || defaultProgress.planner;
  const totalUnits = data.lessons.length + data.problems.length + data.waveforms.length + data.tests.length;
  const minutes = p.minutesPerDay * p.daysPerWeek * p.targetWeeks;
  const unitsPerWeek = (totalUnits / Math.max(1, p.targetWeeks)).toFixed(1);
  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Study planner</h2>
        <div className="grid">
          <label>Minutes per day <input type="number" value={p.minutesPerDay} onChange={e => setProgress(prev => ({ ...prev, planner: { ...p, minutesPerDay: Number(e.target.value) } }))} /></label>
          <label>Days per week <input type="number" value={p.daysPerWeek} onChange={e => setProgress(prev => ({ ...prev, planner: { ...p, daysPerWeek: Number(e.target.value) } }))} /></label>
          <label>Target weeks <input type="number" value={p.targetWeeks} onChange={e => setProgress(prev => ({ ...prev, planner: { ...p, targetWeeks: Number(e.target.value) } }))} /></label>
        </div>
        <div className="footer-note">Estimated study time: {minutes} minutes total. You need roughly {unitsPerWeek} learning units per week.</div>
      </div>
      <div className="card">
        <h2>Company track selector</h2>
        <div className="row">
          {['General', 'NVIDIA', 'Intel', 'AMD', 'Qualcomm'].map(track => <button key={track} className="option" onClick={() => setProgress(prev => ({ ...prev, companyTrack: track }))}>{track}</button>)}
        </div>
        <p className="muted">This lets you bias practice toward a preferred interview flavor. It is implemented as a static metadata filter, so it works on GitHub Pages with no backend.</p>
      </div>
    </div>
  );
}

function VideosPage({ videos }) {
  return (
    <div className="card">
      <h2>Video shelf</h2>
      <p className="muted">This app includes placeholders so you can plug in your preferred curated links. That keeps the repo fully static and easy to maintain.</p>
      <div className="list">
        {videos.map(v => <div className="item" key={v.id}><strong>{v.topic}</strong><div>{v.title}</div><div className="footer-note">{v.url === '#' ? 'Add a link in content/videos/videos.json' : v.url}</div></div>)}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
