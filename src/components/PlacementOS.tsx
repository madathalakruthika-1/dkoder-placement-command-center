import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Award, BarChart3, BrainCircuit, Check,
  ChevronLeft, ChevronRight, CircleDot, Clock3, Code2, Command, Flame,
  GitCompareArrows, Lightbulb, ListChecks, LockKeyhole, Play, RotateCcw,
  Send, Sparkles, Target, Terminal, Trophy, Zap,
} from 'lucide-react';

const companyGroups = {
  'PRODUCT / GLOBAL TECH': ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'NVIDIA', 'Adobe', 'Salesforce', 'Atlassian', 'Oracle', 'SAP', 'Qualcomm'],
  'SERVICE / IT': ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'HCLTech', 'Zoho', 'IBM'],
  'OTHER TARGETS': ['Flipkart', 'Samsung', 'Goldman Sachs', 'Visa', 'PayPal'],
};
const companies = Object.values(companyGroups).flat();
const roles = ['Software Engineer', 'Data Analyst', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'];
const packages = ['0–3 LPA', '3–5 LPA', '5–7 LPA', '7–15 LPA', '15+ LPA'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const skills = ['Java', 'Python', 'C++', 'JavaScript', 'SQL', 'DSA'];
const missionTasks = ['Solve 10 DSA questions', 'Complete 20 aptitude questions', 'Finish 1 coding challenge', 'Revise 5 mistakes', 'Take a mini mock test'];
const orbitTopics = [
  { name: 'DSA', value: 'Patterns, arrays and problem solving.', progress: 72, action: 'Explore coding practice', icon: Code2 },
  { name: 'Coding', value: 'Solve and review coding challenges.', progress: 64, action: 'Open a challenge', icon: Terminal },
  { name: 'Aptitude', value: 'Practise quantitative and reasoning MCQs.', progress: 81, action: 'Try aptitude MCQs', icon: BrainCircuit },
  { name: 'Core CS', value: 'Revisit OOP, DBMS, OS and networks.', progress: 58, action: 'Review core concepts', icon: Lightbulb },
  { name: 'Projects', value: 'Practise explaining your project decisions.', progress: 55, action: 'Review interview prep', icon: Target },
  { name: 'Mock tests', value: 'Get comfortable with timed test-like rounds.', progress: 47, action: 'Open mock exams', icon: Clock3 },
  { name: 'Interview', value: 'Practise explaining your approach clearly.', progress: 62, action: 'Explore interview prep', icon: Send },
  { name: 'AI report', value: 'Review an illustrative report-card preview.', progress: 68, action: 'See the report preview', icon: Sparkles },
];
const mockQuestions = [
  { prompt: 'Which data structure is commonly used for BFS traversal?', options: ['Stack', 'Queue', 'Heap', 'Hash map'], answer: 1 },
  { prompt: 'What does a database index primarily help improve?', options: ['Query retrieval speed', 'Disk size', 'Network security', 'Data normalization'], answer: 0 },
  { prompt: 'Which paradigm is associated with encapsulation?', options: ['Procedural', 'Object-oriented', 'Functional only', 'Logic programming'], answer: 1 },
];
const demoLeaderboard = [
  { rank: 1, name: 'Aarav S.', xp: '2,480', solved: 86, streak: 12 },
  { rank: 2, name: 'Mira K.', xp: '2,210', solved: 73, streak: 9 },
  { rank: 3, name: 'Dev R.', xp: '1,940', solved: 68, streak: 7 },
  { rank: 4, name: 'You · preview', xp: '1,720', solved: 61, streak: 6 },
];
const constellationNodes = ['DSA', 'Arrays', 'Strings', 'Trees', 'Graphs', 'DP', 'OOP', 'DBMS', 'OS', 'Networks', 'Aptitude', 'Coding', 'Interview'];
const mistakeExamples = [
  { topic: 'Arrays', count: 3 },
  { topic: 'DBMS', count: 2 },
  { topic: 'Probability', count: 4 },
];

type WorkspaceTab = 'mission' | 'compare' | 'practice' | 'progress';
type SelectFieldProps = { label: string; value: string; options: string[]; onChange: (value: string) => void };

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return <label className="os-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export default function PlacementOS({ onCompanyChange, selectedCompany }: { onCompanyChange: (company: string) => void; selectedCompany: string }) {
  const [company, setCompany] = useState(selectedCompany);
  const [compareA, setCompareA] = useState('Amazon');
  const [compareB, setCompareB] = useState('Microsoft');
  const [role, setRole] = useState(roles[0]);
  const [packageGoal, setPackageGoal] = useState(packages[3]);
  const [level, setLevel] = useState(levels[1]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['DSA', 'Java']);
  const [checked, setChecked] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('dkoder-demo-mission') ?? '[]') as number[]; } catch { return []; }
  });
  const [activeOrbit, setActiveOrbit] = useState(0);
  const [activeSkill, setActiveSkill] = useState('DSA');
  const [terminalOutput, setTerminalOutput] = useState('Run the sample preview to view a simulated result. No code is executed.');
  const [mockIndex, setMockIndex] = useState(0);
  const [mockAnswer, setMockAnswer] = useState<number | null>(null);
  const [mockAnswers, setMockAnswers] = useState<Record<number, number>>({});
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [mockSeconds, setMockSeconds] = useState(180);
  const [mockStarted, setMockStarted] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('I want to prepare for a software role.');
  const [aiReply, setAiReply] = useState('Choose a company and target profile above, then generate a sample mission to get a focused next step.');
  const [adaptiveCount, setAdaptiveCount] = useState('10');
  const [adaptiveTopic, setAdaptiveTopic] = useState('DSA');
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState('Medium');
  const [adaptiveGenerated, setAdaptiveGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('mission');
  const [leaderTab, setLeaderTab] = useState('College');
  const [mistakeTopic, setMistakeTopic] = useState('Arrays');
  const [revisedMistakes, setRevisedMistakes] = useState<string[]>([]);

  const readiness = 68 + checked.length * 3;
  const xp = 8420 + checked.length * 36;
  const mockCorrect = mockQuestions.reduce((total, question, index) => total + (mockAnswers[index] === question.answer ? 1 : 0), 0);
  const currentQuestion = mockQuestions[mockIndex];
  const recommendation = useMemo(() => {
    const selected = preferredSkills.length ? preferredSkills.slice(0, 3).join(', ') : 'core fundamentals';
    return `${role} · ${packageGoal} · ${level} · Focus: ${selected}`;
  }, [level, packageGoal, preferredSkills, role]);

  useEffect(() => {
    setCompany(selectedCompany);
  }, [selectedCompany]);

  useEffect(() => {
    try {
      localStorage.setItem('dkoder-demo-mission', JSON.stringify(checked));
    } catch {
      // Local storage may be unavailable in private browsing; the session still works.
    }
  }, [checked]);

  useEffect(() => {
    if (!mockStarted || mockSubmitted || mockSeconds <= 0) return;
    const timer = window.setInterval(() => setMockSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [mockStarted, mockSeconds, mockSubmitted]);

  const toggleMissionTask = (index: number) => setChecked((current) => current.includes(index) ? current.filter((task) => task !== index) : [...current, index]);
  const toggleSkill = (skill: string) => setPreferredSkills((current) => current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]);
  const generateMission = () => {
    setActiveTab('mission');
    document.querySelector('#mission-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const runTerminal = () => setTerminalOutput('✓ Sample checks passed\nInput: [2, 7, 11, 15]\nExpected output: [0, 1]\nDemo simulation only — no code was executed.');
  const resetMock = () => { setMockIndex(0); setMockAnswer(null); setMockAnswers({}); setMockSubmitted(false); setMockSeconds(180); setMockStarted(true); };
  const submitMock = () => { setMockSubmitted(true); setMockStarted(false); };
  const createAiPlan = () => setAiReply(`AI CONCEPT PREVIEW · For ${company} preparation as a ${role} at ${packageGoal}, start with ${preferredSkills[0] ?? 'fundamentals'}, then take a short mock and review what felt difficult. This is a sample response—not a live AI service.`);
  const generatePractice = () => setAdaptiveGenerated(true);

  return (
    <section className="placement-os" id="mission-dashboard" aria-labelledby="os-title">
      <div className="os-ambient os-ambient-one" aria-hidden="true" /><div className="os-ambient os-ambient-two" aria-hidden="true" />
      <div className="os-shell">
        <div className="os-heading"><div className="os-eyebrow"><span /><Command size={13} /> DKODER / PLACEMENT OS <span className="os-preview-tag">DEMO PREVIEW</span></div><div className="os-title-row"><div><h2 id="os-title">Your next move,<br /><span>in one place.</span></h2><p>Select a target. Shape a mission. Try the tools—these local previews don’t connect to an account.</p></div><div className="os-readiness"><div className="os-readiness-ring"><strong>{readiness}</strong><span>%</span></div><span>READINESS<br />DEMO VALUE</span></div></div></div>

        <div className="os-command-layout">
          <aside className="os-company-rail" aria-label="Select preparation target company"><div className="os-rail-top"><span>01 / SELECT TARGET</span><span>COMPANY FOCUS</span></div>{Object.entries(companyGroups).map(([group, names]) => <div className="os-company-group" key={group}><span>{group}</span><div>{names.map((name) => <button type="button" key={name} className={`os-company-chip${company === name ? ' selected' : ''}`} aria-pressed={company === name} onClick={() => { setCompany(name); onCompanyChange(name); }}><b>{name.slice(0, 1)}</b>{name}{company === name && <Check size={12} />}</button>)}</div></div>)}<p className="os-disclaimer">Targets for preparation content only—not company partnerships or official hiring requirements.</p></aside>

          <div className="os-workbench"><div className="os-workbench-top"><div><span className="os-signal"><i /> MISSION CONTROL</span><h3>Make the target yours.</h3></div><div className="os-user-chip"><span>YOU</span><div><b>Student workspace</b><small>LOCAL DEMO · NOT SYNCED</small></div></div></div>
            <div className="os-profile-grid"><SelectField label="TARGET ROLE" value={role} options={roles} onChange={setRole} /><SelectField label="PACKAGE GOAL" value={packageGoal} options={packages} onChange={setPackageGoal} /><SelectField label="SKILL LEVEL" value={level} options={levels} onChange={setLevel} /></div>
            <div className="os-skill-picker"><span>PREFERRED SKILLS</span><div>{skills.map((skill) => <button type="button" aria-pressed={preferredSkills.includes(skill)} className={preferredSkills.includes(skill) ? 'active' : ''} key={skill} onClick={() => toggleSkill(skill)}>{preferredSkills.includes(skill) && <Check size={11} />}{skill}</button>)}</div></div>
            <div className="os-result-line"><div><span>YOUR TARGET PROFILE</span><strong>{role} <i>·</i> {packageGoal}</strong><small>{company} / {level} <b>·</b> {preferredSkills.length ? preferredSkills.join(' + ') : 'Select a skill focus'}</small><small className="os-target-recommendation">Suggested profile · {recommendation}</small></div><button className="os-yellow-button" type="button" onClick={generateMission}>Build my mission <ArrowRight size={15} /></button></div>

            <div className="os-tabbar" role="tablist" aria-label="Placement command center tools">{([{ id: 'mission', label: 'Mission', icon: Target }, { id: 'compare', label: 'Compare', icon: GitCompareArrows }, { id: 'practice', label: 'Practice lab', icon: Terminal }, { id: 'progress', label: 'Progress', icon: BarChart3 }] as const).map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}><Icon size={14} />{label}</button>)}</div>

            {activeTab === 'mission' && <div className="os-tab-panel" role="tabpanel"><div className="os-mission-grid"><div className="os-mission-card"><div className="os-panel-label"><span><Zap size={13} /> TODAY'S MISSION</span><span>{checked.length}/{missionTasks.length} COMPLETE</span></div><div className="os-mission-title"><h4>{company} <i>/</i> {role}</h4><span>{packageGoal}</span></div><div className="os-task-list">{missionTasks.map((task, index) => <label className={checked.includes(index) ? 'done' : ''} key={task}><input type="checkbox" checked={checked.includes(index)} onChange={() => toggleMissionTask(index)} /><span className="os-custom-check"><Check size={11} /></span><span>{task}</span><small>+36 XP</small></label>)}</div><div className="os-mission-footer"><span><Zap size={13} /> +{checked.length * 36} XP earned in this demo</span><span><Flame size={13} /> STREAK IS DEMO DATA</span></div></div><div className="os-copilot-card"><div className="os-panel-label"><span><Sparkles size={13} /> DKODER COPILOT</span><span className="os-concept-label">AI CONCEPT PREVIEW</span></div><div className="os-chat-bubble os-user-bubble">{aiPrompt}</div><div className="os-chat-avatar"><Sparkles size={14} /></div><p className="os-chat-response">{aiReply}</p><label className="os-chat-input"><span className="sr-only">Ask the AI concept preview</span><input value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') createAiPlan(); }} /><button type="button" aria-label="Generate sample copilot response" onClick={createAiPlan}><Send size={14} /></button></label><small className="os-demo-foot"><LockKeyhole size={11} /> Prototype response only · no AI model is connected</small></div></div><div className="os-mission-bottom"><div className="os-mission-stat"><span>MISSION READINESS</span><strong>{readiness}%</strong><div><i style={{ width: `${readiness}%` }} /></div><small>Illustrative progress based on this local checklist.</small></div><div className="os-mission-stat"><span>XP / NEXT LEVEL</span><strong>{xp.toLocaleString()} <i>/ 10,000</i></strong><div><i style={{ width: `${Math.min(99, xp / 100)}%` }} /></div><small>Sample XP only · mission checks persist on this device.</small></div><button className="os-practice-cta" type="button" onClick={() => setActiveTab('practice')}><Play size={14} fill="currentColor" /> Start today's mission <ArrowRight size={14} /></button></div></div>}

            {activeTab === 'compare' && <div className="os-tab-panel" role="tabpanel"><div className="os-compare-header"><div><span className="os-panel-label"><GitCompareArrows size={13} /> COMPANY BATTLE</span><h4>Different targets.<br /><em>Different focus.</em></h4></div><span className="os-demo-label">PREPARATION FOCUS / DEMO</span></div><div className="os-compare-selectors"><SelectField label="TARGET A" value={compareA} options={companies} onChange={setCompareA} /><span>VS</span><SelectField label="TARGET B" value={compareB} options={companies} onChange={setCompareB} /></div><div className="os-compare-chart"><div className="os-compare-legend"><span><i />{compareA}</span><span><i />{compareB}</span></div>{['DSA', 'Coding', 'Aptitude', 'CS Fundamentals', 'Mock Preparation', 'Interview Prep'].map((item, index) => <div className="os-compare-row" key={item}><span>{item}</span><div><i className="compare-a" style={{ width: `${[88, 82, 54, 72, 66, 70][index]}%` }} /><i className="compare-b" style={{ width: `${[82, 78, 62, 76, 71, 74][index]}%` }} /></div><b>{index < 2 ? 'CODING' : 'FOUNDATIONS'}</b></div>)}</div><p className="os-disclaimer">Illustrative preparation-focus visualization only. Not official employer requirements, hiring data, or personalized recommendations.</p></div>}

            {activeTab === 'practice' && <div className="os-tab-panel" role="tabpanel"><div className="os-lab-grid"><div className="os-terminal-card"><div className="os-panel-label"><span><Terminal size={14} /> DKODER TERMINAL</span><span className="os-demo-label">SIMULATION</span></div><div className="os-terminal-problem"><span>PROBLEM PREVIEW / TWO SUM</span><strong>Find two indices that add up to the target.</strong><small>Input: nums = [2, 7, 11, 15], target = 9</small></div><pre className="os-code-snippet"><span className="code-purple">function</span> twoSum(nums, target) {'{'}{'\n'}  <span className="code-muted">// sketch only — no execution</span>{'\n'}  <span className="code-yellow">return</span> [0, 1];{'\n'}{'}'}</pre><div className="os-terminal-output"><span>OUTPUT / SAMPLE</span><pre>{terminalOutput}</pre></div><button type="button" className="os-yellow-button" onClick={runTerminal}><Play size={13} fill="currentColor" /> Run sample preview</button><small className="os-disclaimer">Simulated output for demonstration. No code is executed.</small></div><div className="os-adaptive-card"><div className="os-panel-label"><span><ListChecks size={14} /> ADAPTIVE PRACTICE</span><span className="os-demo-label">LOCAL PROTOTYPE</span></div><div className="os-adaptive-fields"><SelectField label="COMPANY" value={company} options={companies} onChange={setCompany} /><SelectField label="TOPIC" value={adaptiveTopic} options={['DSA', 'Arrays', 'Strings', 'Trees', 'Graphs', 'Aptitude', 'DBMS']} onChange={(value) => { setAdaptiveTopic(value); setAdaptiveGenerated(false); }} /><SelectField label="DIFFICULTY" value={adaptiveDifficulty} options={['Easy', 'Medium', 'Hard']} onChange={(value) => { setAdaptiveDifficulty(value); setAdaptiveGenerated(false); }} /><SelectField label="QUESTIONS" value={adaptiveCount} options={['5', '10', '15', '20']} onChange={(value) => { setAdaptiveCount(value); setAdaptiveGenerated(false); }} /></div><button className="os-yellow-button" type="button" onClick={generatePractice}><Sparkles size={14} /> Generate practice set</button>{adaptiveGenerated && <div className="os-generated-set" role="status"><span><Check size={13} /> DEMO SET READY</span><strong>{adaptiveCount} {adaptiveDifficulty.toLowerCase()} {adaptiveTopic} prompts</strong><small>Preparation preview for {company}. Questions are not loaded from a live question bank.</small><a href="https://dkoder.co.in/practice">Open Dkoder practice <ArrowUpRight size={12} /></a></div>}</div></div><div className="os-mock-card"><div className="os-mock-heading"><div><span className="os-panel-label"><Clock3 size={13} /> MOCK EXAM PREVIEW</span><strong>Quick checkpoint</strong></div><span className="os-timer"><Clock3 size={12} /> {Math.floor(mockSeconds / 60).toString().padStart(2, '0')}:{(mockSeconds % 60).toString().padStart(2, '0')}</span></div>{mockSubmitted ? <div className="os-mock-result"><div className="os-mock-result-icon"><Trophy size={20} /></div><span>DEMO RESULT</span><strong>{Math.round((mockCorrect / mockQuestions.length) * 100)}% sample score</strong><p>{mockCorrect} of {mockQuestions.length} sample answers correct. Suggested review: revisit the questions you missed. No real account result is generated.</p><button type="button" onClick={resetMock}><RotateCcw size={13} /> Try again</button></div> : <><div className="os-mock-progress"><span>QUESTION {mockIndex + 1} / {mockQuestions.length}</span><div><i style={{ width: `${((mockIndex + 1) / mockQuestions.length) * 100}%` }} /></div><span>DEMO</span></div><h4>{currentQuestion.prompt}</h4><div className="os-answer-list">{currentQuestion.options.map((option, index) => <button type="button" key={option} aria-pressed={mockAnswer === index} className={mockAnswer === index ? 'selected' : ''} onClick={() => { setMockAnswer(index); setMockAnswers((answers) => ({ ...answers, [mockIndex]: index })); setMockStarted(true); }}>{String.fromCharCode(65 + index)} <span>{option}</span>{mockAnswer === index && <Check size={13} />}</button>)}</div><div className="os-mock-controls"><button type="button" onClick={() => { setMockIndex((index) => Math.max(0, index - 1)); setMockAnswer(mockAnswers[mockIndex - 1] ?? null); }} disabled={mockIndex === 0}><ChevronLeft size={14} /> Previous</button><button type="button" onClick={() => mockIndex === mockQuestions.length - 1 ? submitMock() : (setMockIndex((index) => index + 1), setMockAnswer(mockAnswers[mockIndex + 1] ?? null), setMockStarted(true))}>{mockIndex === mockQuestions.length - 1 ? 'Submit preview' : 'Next question'} <ChevronRight size={14} /></button></div></>}<p className="os-disclaimer">Mock is a browser-only preview; scores and recommendations are illustrative.</p></div></div>}

            {activeTab === 'progress' && <div className="os-tab-panel" role="tabpanel"><div className="os-progress-layout"><div className="os-orbit-card"><div className="os-panel-label"><span><CircleDot size={14} /> PLACEMENT ORBIT</span><span className="os-demo-label">DEMO DATA</span></div><div className="os-orbit-map"><div className="orbit-ring ring-outer" /><div className="orbit-ring ring-inner" /><div className="orbit-user"><Target size={20} /><span>YOU</span></div>{orbitTopics.map((topic, index) => { const angle = (Math.PI * 2 * index) / orbitTopics.length - Math.PI / 2; const Icon = topic.icon; return <button key={topic.name} type="button" className={`orbit-node node-${index}${activeOrbit === index ? ' selected' : ''}`} style={{ left: `${50 + Math.cos(angle) * 39}%`, top: `${50 + Math.sin(angle) * 39}%` }} onClick={() => setActiveOrbit(index)} aria-pressed={activeOrbit === index}><Icon size={14} /><span>{topic.name}</span></button>; })}</div><p className="os-disclaimer">Select an orbit node to view a sample focus area.</p></div><div className="os-skill-detail"><div className="os-panel-label"><span><Sparkles size={13} /> SKILL FOCUS</span><span className="os-demo-label">ILLUSTRATIVE</span></div><div className="os-skill-detail-icon">{(() => { const Icon = orbitTopics[activeOrbit].icon; return <Icon size={20} />; })()}</div><h4>{orbitTopics[activeOrbit].name}</h4><p>{orbitTopics[activeOrbit].value}</p><span className="os-detail-progress-label">SAMPLE PROGRESS <b>{orbitTopics[activeOrbit].progress}%</b></span><div className="os-detail-track"><i style={{ width: `${orbitTopics[activeOrbit].progress}%` }} /></div><a href={activeOrbit === 7 ? '#report' : '#practice'}>{orbitTopics[activeOrbit].action} <ArrowRight size={13} /></a></div></div><div className="os-progress-tools"><div className="os-radar-card"><div className="os-panel-label"><span><BarChart3 size={14} /> READINESS RADAR</span><span className="os-demo-label">ILLUSTRATIVE</span></div><svg viewBox="0 0 280 230" role="img" aria-label="Illustrative skill radar chart"><polygon className="radar-grid" points="140,25 221,58 244,124 210,190 140,215 70,190 36,124 59,58" /><polygon className="radar-grid" points="140,53 200,77 218,124 192,174 140,195 88,174 62,124 80,77" /><polygon className="radar-grid" points="140,80 180,96 190,124 174,156 140,174 106,156 90,124 100,96" /><polygon className="radar-shape" points="140,55 197,82 205,124 174,157 140,168 97,158 70,124 95,77" /><text x="140" y="14">DSA</text><text x="232" y="56">CODING</text><text x="252" y="128">APTITUDE</text><text x="218" y="204">DBMS</text><text x="128" y="228">OS</text><text x="12" y="204">OOP</text><text x="2" y="127">NETWORKS</text><text x="31" y="53">INTERVIEW</text></svg><p className="os-disclaimer">Demo values for concept visualization, not a real readiness assessment.</p></div><div className="os-week-card"><div className="os-panel-label"><span><Flame size={13} /> DAILY PLACEMENT STREAK</span><span className="os-demo-label">SAMPLE</span></div><div className="os-streak-number"><strong>7</strong><span>DAY<br />STREAK</span><Flame size={23} /></div><div className="os-week-days">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`}><span>{day}</span><b className={index < 5 ? 'complete' : ''}>{index < 5 ? <Check size={11} /> : '·'}</b></div>)}</div><p className="os-disclaimer">Illustrative streak calendar only.</p></div></div><div className="os-leaderboard"><div className="os-leader-head"><div><span className="os-panel-label"><Trophy size={13} /> LEADERBOARD</span><strong>Friendly motivation.</strong></div><div className="os-leader-tabs" role="tablist" aria-label="Leaderboard scope">{['College', 'Friends', 'Global'].map((tab) => <button type="button" role="tab" aria-selected={leaderTab === tab} className={leaderTab === tab ? 'active' : ''} key={tab} onClick={() => setLeaderTab(tab)}>{tab}</button>)}</div></div><div className="os-leader-columns"><span>RANK</span><span>LEARNER</span><span>XP</span><span>SOLVED</span><span>STREAK</span></div>{demoLeaderboard.map((entry) => <div className={`os-leader-row${entry.name.startsWith('You') ? ' own' : ''}`} key={entry.rank}><span>{entry.rank === 1 ? <Award size={14} /> : `0${entry.rank}`}</span><strong>{entry.name}</strong><span>{entry.xp}</span><span>{entry.solved}</span><span><Flame size={11} />{entry.streak}d</span></div>)}<p className="os-disclaimer">Fictional demonstration entries only—no real learner rankings or activity. Selected view: {leaderTab}.</p></div></div>}
          </div>
        </div>
        <div className="os-deep-tools"><section className="os-constellation-card" aria-labelledby="constellation-title"><div className="os-panel-label"><span><CircleDot size={14} /> SKILL CONSTELLATION</span><span className="os-demo-label">DEMO INTERFACE</span></div><h3 id="constellation-title">Connect the concepts.</h3><p className="os-deep-intro">Choose a node to preview a skill focus and suggested next action.</p><div className="os-constellation-map"><svg viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true"><path d="M45 42 145 42 245 42 345 42M45 42 95 100 195 100 295 100 345 42M95 100 45 158 145 158 245 158 345 158M145 42 195 100 245 158M245 42 195 100 145 158M345 42 295 100 245 158" /></svg><div className="os-constellation-nodes">{constellationNodes.map((node) => <button key={node} type="button" className={activeSkill === node ? 'selected' : ''} aria-pressed={activeSkill === node} onClick={() => setActiveSkill(node)}><span>{node.slice(0, 2).toUpperCase()}</span>{node}</button>)}</div></div><div className="os-skill-summary"><span className="os-skill-orb"><Sparkles size={14} /></span><div><span>SELECTED SKILL · ILLUSTRATIVE</span><strong>{activeSkill}</strong><small>Practice {activeSkill} concepts, review examples and choose a difficulty that suits your preparation.</small></div><a href="#practice" aria-label={`Practice ${activeSkill}`}>Practice <ArrowRight size={12} /></a></div></section><section className="os-mistake-card" aria-labelledby="mistake-title"><div className="os-panel-label"><span><RotateCcw size={14} /> MISTAKE NOTEBOOK</span><span className="os-demo-label">SAMPLE DATA</span></div><h3 id="mistake-title">Make misses useful.</h3><p className="os-deep-intro">A sample review list—your real practice history isn’t connected here.</p><div className="os-mistake-list">{mistakeExamples.map(({ topic, count }) => <button type="button" key={topic} className={mistakeTopic === topic ? 'active' : ''} onClick={() => setMistakeTopic(topic)}><span><b>{topic.slice(0, 1)}</b><span>{topic}<small>{count} sample mistakes</small></span></span><span className="os-mistake-count">{count}</span></button>)}</div><div className="os-mistake-action"><span><Lightbulb size={13} /> Next review: <b>{mistakeTopic}</b></span><button type="button" aria-pressed={revisedMistakes.includes(mistakeTopic)} onClick={() => setRevisedMistakes((items) => items.includes(mistakeTopic) ? items.filter((item) => item !== mistakeTopic) : [...items, mistakeTopic])}>{revisedMistakes.includes(mistakeTopic) ? <><Check size={12} /> Reviewed</> : <>Mark reviewed <ArrowRight size={12} /></>}</button></div></section></div>
        {mockSubmitted && <span className="sr-only" role="status">Mock preview score: {Math.round((mockCorrect / mockQuestions.length) * 100)} percent. Demo result only.</span>}
        <div className="os-storyline" aria-label="Placement journey steps"><span>01 <b>DREAM</b></span><i /><span>02 <b>TARGET</b></span><i /><span>03 <b>MISSION</b></span><i /><span>04 <b>PRACTICE</b></span><i /><span>05 <b>PROGRESS</b></span></div>
      </div>
    </section>
  );
}
