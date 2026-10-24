import { Suspense, lazy, useEffect, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, Award, BarChart3,
  BookOpen, BrainCircuit, Check, ChevronDown, CircleHelp, Code2, Command,
  Flame, Menu, MousePointer2, Play, RotateCcw, ScanLine,
  Search, ShieldCheck, Sparkles, Target, X, Zap,
} from 'lucide-react';

type IconComponent = typeof ArrowRight;
const PlacementOS = lazy(() => import('./components/PlacementOS'));
const HeroEnergyScene = lazy(() => import('./components/HeroEnergyScene'));

const companies = [
  'Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant',
  'Accenture', 'IBM', 'Oracle', 'Cisco', 'Zoho', 'HCLTech', 'Adobe',
  'Salesforce', 'Nvidia', 'Flipkart', 'Apple', 'Meta', 'Samsung',
  'Goldman Sachs', 'Visa', 'PayPal', 'Atlassian', 'SAP', 'Qualcomm',
];

const worries = [
  'Where do I even begin?', 'Will they ask me to code?', 'What should I revise tonight?',
  'Have I really improved?', 'Can I explain my projects?', 'What if I fail aptitude?',
  'Did I practise the right questions?', 'Is everyone else better prepared?',
];

const tracks = [
  { id: 'aptitude', number: '01', title: 'Aptitude', sub: 'Build speed & accuracy', icon: BrainCircuit },
  { id: 'dsa', number: '02', title: 'DSA', sub: 'Strengthen core patterns', icon: Code2 },
  { id: 'coding', number: '03', title: 'Coding', sub: 'Solve company-tagged questions', icon: Command },
  { id: 'core', number: '04', title: 'Core CS', sub: 'Revise essential concepts', icon: BookOpen },
  { id: 'mock', number: '05', title: 'Mock exam', sub: 'Practise timed rounds', icon: AudioLines },
  { id: 'review', number: '06', title: 'Review', sub: 'Use your progress to choose next', icon: BarChart3 },
];

const plans = [
  { name: 'Bronze', price: 699, range: '0–3 LPA', desc: 'Service Based Company Interview Questions', features: ['Daily challenges', 'MCQ Practice', 'Coding Questions'] },
  { name: 'Silver', price: 999, range: '0–5 LPA', desc: 'Service Based Company Interview Questions', features: ['Daily challenges', 'MCQ Practice', 'Coding Questions'] },
  { name: 'Gold', price: 1599, range: '0–7 LPA', desc: 'Service & Product Based Interview Questions', features: ['Daily challenges', 'MCQ Practice', 'Coding Questions', 'Advanced AI Report card', 'Topic-wise and platform-wise filter enabled'] },
  { name: 'Platinum', price: 1999, range: '0–15 LPA', desc: 'Service & Product Interview Questions', features: ['Daily challenges', 'MCQ Practice', 'Coding Questions', 'Advanced AI Report card', 'Topic-wise and platform-wise filter enabled', 'Company-wise filter', 'Package-wise filter'], badge: 'MOST POPULAR' },
  { name: 'Super Dream Pack', price: 2999, range: '15+ LPA', desc: 'Product & Service Interview Questions', features: ['Daily challenges', 'MCQ Practice', 'Coding Questions', 'Advanced AI Report card', 'Topic-wise and platform-wise filter enabled', 'Company-wise filter', 'Package-wise filter', 'Frequency-wise filter', 'Year-wise, Quarter-wise filter', 'All Bundles will be unlocked', 'Early Access to all Exam series & notifications'], badge: 'BEST VALUE' },
];

const featureList: { title: string; text: string; detail: string; icon: IconComponent }[] = [
  { title: 'Aptitude & MCQs', text: 'Build speed and accuracy for screening rounds.', detail: 'Practise multiple-choice questions by topic and prepare for timed screening tests.', icon: BrainCircuit },
  { title: 'Coding practice', text: 'Work through challenges and test code in the browser.', detail: 'Move from coding fundamentals to company-tagged problems and platform practice.', icon: Code2 },
  { title: 'Mock exams', text: 'Practise timed, test-like rounds and review results.', detail: 'Get familiar with exam-style practice before the real assessment.', icon: AudioLines },
  { title: 'Courses & sets', text: 'Use curated problem sets and the course library where included.', detail: 'Choose a guided course or a focused question bundle for your next goal.', icon: BookOpen },
  { title: 'Progress & scores', text: 'Track activity, XP and analytics as you improve.', detail: 'Review your practice activity and use progress signals to decide what to do next.', icon: BarChart3 },
  { title: 'AI report card', text: 'See a clearer view of your preparation areas.', detail: 'Eligible plans include an advanced AI report card to help review preparation.', icon: Sparkles },
];

const dayTasks = [
  { time: '09:00', label: 'Try five aptitude questions', kind: 'WARM UP' },
  { time: '12:30', label: 'Solve two array questions', kind: 'PRACTICE' },
  { time: '16:00', label: 'Review one coding solution', kind: 'REVIEW' },
  { time: '19:00', label: 'Take a timed mock exam', kind: 'MOCK' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [company, setCompany] = useState('Amazon');
  const [packageLevel, setPackageLevel] = useState('₹12 LPA+');
  const [role, setRole] = useState('Software Engineer');
  const [level, setLevel] = useState('Intermediate');
  const [mode, setMode] = useState('All practice');
  const [activeWorry, setActiveWorry] = useState(0);
  const [activeFeature, setActiveFeature] = useState(1);
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);
  const [companyFocus, setCompanyFocus] = useState('Amazon');
  const [previewRun, setPreviewRun] = useState(false);
  const [missionPulse, setMissionPulse] = useState(0);

  const launchMission = () => {
    setMissionPulse((pulse) => pulse + 1);
    document.querySelector('#mission-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const buttons = document.querySelectorAll<HTMLElement>('.hero-magnetic');
    const cleanups: (() => void)[] = [];
    buttons.forEach((button) => {
      const onMove = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
        button.style.setProperty('--mag-x', `${x * 5}px`);
        button.style.setProperty('--mag-y', `${y * 4}px`);
      };
      const reset = () => {
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
      };
      button.addEventListener('pointermove', onMove, { passive: true });
      button.addEventListener('pointerleave', reset, { passive: true });
      cleanups.push(() => {
        button.removeEventListener('pointermove', onMove);
        button.removeEventListener('pointerleave', reset);
      });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const toggleTask = (index: number) => {
    setCheckedTasks((current) => current.includes(index) ? current.filter((task) => task !== index) : [...current, index]);
  };
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <nav className="nav-shell" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Dkoder home"><span className="brand-mark"><Command size={18} strokeWidth={2.6} /></span><span>dkoder<span className="brand-period">.</span></span></a>
          <div className={`nav-links${menuOpen ? ' nav-links-open' : ''}`}>
            <a href="#top" onClick={closeMenu}>Home</a>
            <a href="#mission-dashboard" onClick={closeMenu}>Mission</a>
            <a href="#practice" onClick={closeMenu}>Practice</a>
            <a href="#features" onClick={closeMenu}>Courses</a>
            <a href="#companies" onClick={closeMenu}>Companies</a>
            <a href="#plans" onClick={closeMenu}>Plans</a>
            <a href="#colleges" onClick={closeMenu}>For colleges</a>
            <div className="mobile-nav-actions"><a className="nav-login" href="https://dkoder.co.in/auth/login">Log in <ArrowUpRight size={15} /></a><a className="button button-yellow button-small" href="https://dkoder.co.in/auth/signup">Start preparing <ArrowRight size={15} /></a></div>
          </div>
          <div className="nav-actions"><a className="nav-login" href="https://dkoder.co.in/auth/login">Log in</a><a className="button button-yellow button-small" href="https://dkoder.co.in/auth/signup">Start preparing <ArrowRight size={15} /></a></div>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
        </nav>
      </header>

      <main id="main">
        <section className="hero section-wrap" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orbit orbit-one" aria-hidden="true" /><div className="hero-orbit orbit-two" aria-hidden="true" />
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> THE FUTURE OF PLACEMENT PREPARATION</div>
            <h1>Your dream job.<br /><span>Your next move.</span></h1>
            <p className="hero-subtitle">Build your company-focused preparation plan, practise smarter, track your progress, and move closer to your career goals with Dkoder.</p>
            <div className="hero-actions"><button className="button button-yellow hero-magnetic" type="button" onClick={launchMission}>Build my placement mission <ArrowRight size={17} /></button><a className="button button-quiet hero-magnetic" href="#companies">Explore companies <ArrowDownRight size={17} /></a></div>
            <div className="hero-undertext"><span className="mini-check"><Check size={12} /></span> Built for students. Designed for placements.</div>
          </div>
          <div className="hero-visual" aria-label="Interactive Dkoder Placement Intelligence Core. Click the central core to activate Energy Drive.">
            <Suspense fallback={<div className="hero-energy-placeholder" aria-label="Loading Dkoder's interactive placement core"><span><Sparkles size={17} /> Initializing placement core</span></div>}>
              <HeroEnergyScene selectedCompany={companyFocus} missionPulse={missionPulse} onBuildMission={launchMission} />
            </Suspense>
          </div>
          <a className="scroll-cue" href="#story"><span>SCROLL TO FIND YOUR FOCUS</span><div><ArrowDownRight size={15} /></div></a>
        </section>

        <section className="company-strip" id="companies" aria-label="Companies with tagged preparation topics">
          <div className="strip-heading"><span>CHOOSE YOUR PREPARATION TARGET</span><a href="#target">Open target planner <ArrowRight size={14} /></a></div>
          <div className="company-galaxy" role="group" aria-label="Select a company preparation target">{companies.map((name) => <button className={`company-pill${companyFocus === name ? ' is-focused' : ''}`} key={name} type="button" aria-pressed={companyFocus === name} onClick={() => { setCompanyFocus(name); setCompany(name); }}><span className="company-symbol">{name.slice(0, 1)}</span>{name}<ArrowUpRight size={12} /></button>)}</div>
          <p className="company-note" aria-live="polite"><strong>{companyFocus}</strong> selected · Company names are preparation targets only; no employer affiliation is implied.</p>
        </section>

        <Suspense fallback={<section className="placement-os-loading" id="mission-dashboard">Loading the interactive placement command center…</section>}>
          <PlacementOS selectedCompany={companyFocus} onCompanyChange={setCompanyFocus} />
        </Suspense>

        <section className="story-section section-wrap" id="story">
          <div className="section-kicker" data-reveal><span>01 / FIND YOUR FOCUS</span><span className="kicker-line" /></div>
          <div className="story-heading" data-reveal><div><p className="overline">THE NIGHT BEFORE</p><h2>Interview tomorrow.<br /><span>Mind everywhere?</span></h2></div><p className="section-intro">A hundred questions. No clear starting point. Pick the thought on your mind—we’ll help turn it into a next step.</p></div>
          <div className="chaos-layout" data-reveal>
            <div className="thought-cloud" aria-label="Common placement preparation worries">{worries.map((worry, index) => <button className={`thought thought-${index + 1}${activeWorry === index ? ' thought-active' : ''}`} key={worry} onClick={() => setActiveWorry(index)} type="button"><CircleHelp size={14} />{worry}</button>)}</div>
            <div className="chaos-arrow"><span>FILTER THE NOISE</span><ArrowRight size={24} /></div>
            <div className="focus-card"><div className="focus-orbit" /><div className="focus-card-top"><span><Sparkles size={14} /> DKODER / FOCUS MODE</span><span className="status-dot">READY</span></div><div className="focus-content"><div className="focus-target-icon"><Target size={23} /></div><p className="overline">YOUR NEXT STEP</p><h3>{activeWorry === 0 ? 'Start with one target.' : activeWorry === 1 ? 'Practise one coding round.' : activeWorry === 2 ? 'Pick a focused revision set.' : activeWorry === 3 ? 'Review your progress.' : activeWorry === 4 ? 'Revisit your project story.' : activeWorry === 5 ? 'Warm up with aptitude.' : activeWorry === 6 ? 'Filter by company & topic.' : 'Make the next question count.'}</h3><p>Start with a target, then narrow by company, package, mode and level.</p><a href="#target">Build a focused plan <ArrowRight size={15} /></a></div><div className="focus-steps"><div><b>01</b><span>ONE TARGET</span></div><i /><div><b>02</b><span>ONE PLAN</span></div><i /><div><b>03</b><span>ONE NEXT STEP</span></div></div></div>
          </div>
        </section>

        <section className="target-section section-wrap" id="target">
          <div className="target-copy" data-reveal><div className="section-kicker"><span>02 / SET THE TARGET</span><span className="kicker-line" /></div><p className="overline">A SMALLER SHORTLIST</p><h2>Set the target.<br /><span>We’ll map the path.</span></h2><p className="section-intro">Filter by company, package, role and level. Your plan determines which companies and filters you can open.</p><div className="target-fact"><div className="fact-spark"><ScanLine size={17} /></div><p><strong>3,254 questions</strong><br />from <strong>44 companies</strong> across <strong>12 prep bundles</strong></p></div><p className="fact-source">Coverage figures published on dkoder.co.in.</p></div>
          <div className="planner" data-reveal><div className="planner-top"><div><span className="live-indicator"><i /> MISSION PLANNER</span><h3>Build your prep path</h3></div><button className="reset-button" type="button" onClick={() => { setCompany('Amazon'); setPackageLevel('₹12 LPA+'); setRole('Software Engineer'); setLevel('Intermediate'); setMode('All practice'); }}><RotateCcw size={13} /> Reset</button></div>
            <div className="planner-fields">
              <label>Company<select value={company} onChange={(event) => { setCompany(event.target.value); setCompanyFocus(event.target.value); }}>{companies.map((name) => <option key={name}>{name}</option>)}</select><ChevronDown size={14} /></label>
              <label>Package<select value={packageLevel} onChange={(event) => setPackageLevel(event.target.value)}><option>Any package</option><option>₹0–3 LPA</option><option>₹3–7 LPA</option><option>₹7–15 LPA</option><option>₹12 LPA+</option><option>15+ LPA</option></select><ChevronDown size={14} /></label>
              <label>Role<select value={role} onChange={(event) => setRole(event.target.value)}><option>Software Engineer</option><option>Service-company developer</option><option>Data analyst</option><option>Chip & systems engineer</option></select><ChevronDown size={14} /></label>
              <label>Level<select value={level} onChange={(event) => setLevel(event.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select><ChevronDown size={14} /></label>
              <label className="field-wide">Practice mode<select value={mode} onChange={(event) => setMode(event.target.value)}><option>All practice</option><option>Aptitude & MCQs</option><option>Coding questions</option><option>Mock exams</option><option>Courses & sets</option></select><ChevronDown size={14} /></label>
            </div>
            <div className="path-heading"><span>YOUR PREPARATION PATH</span><span>{company.toUpperCase()} / {level.toUpperCase()}</span></div>
            <div className="path-list">{tracks.map((track, index) => { const Icon = track.icon; return <div className="path-step" key={track.id}><div className="path-number">{track.number}</div><div className="path-icon"><Icon size={16} /></div><div className="path-label"><strong>{track.title}</strong><span>{track.sub}</span></div><div className="path-chevron"><ArrowRight size={15} /></div>{index < tracks.length - 1 && <i className="path-connector" />}</div>; })}</div>
            <div className="planner-foot"><span><ShieldCheck size={14} /> {role} · {packageLevel} · {mode}</span><span>Illustrative planner</span></div>
          </div>
        </section>

        <section className="practice-section section-wrap" id="practice">
          <div className="section-kicker" data-reveal><span>03 / DO THE WORK</span><span className="kicker-line" /></div>
          <div className="practice-heading" data-reveal><div><p className="overline">PROGRESS IS MADE IN THE DOING</p><h2>Every question gets<br /><span>you closer.</span></h2></div><p className="section-intro">Real practice beats vague plans. Find coding, MCQ and platform questions tagged to the preparation you care about.</p></div>
          <div className="practice-showcase" data-reveal>
            <div className="editor-window"><div className="editor-top"><div className="window-dots"><i /><i /><i /></div><span>DKODER / PRACTICE SESSION</span><button type="button" aria-label="Run illustrative code preview" aria-pressed={previewRun} onClick={() => setPreviewRun((run) => !run)}><Play size={13} fill="currentColor" /></button></div><div className="editor-body"><div className="editor-meta"><span>QUESTION PREVIEW <b>SAMPLE</b></span><span className="difficulty-tag">MEDIUM</span></div><h3>Find the longest subarray<br />with a target sum.</h3><p>Given an integer array and a target value, find the maximum length subarray whose elements sum to the target.</p><div className="code-sample"><div className="code-line"><span>01</span><code><em>function</em> longestSubarray(arr, target) {'{'}</code></div><div className="code-line"><span>02</span><code>&nbsp;&nbsp;<i>// your solution starts here</i></code></div><div className="code-line"><span>03</span><code>&nbsp;&nbsp;<b>const</b> seen = <em>new</em> Map();</code></div><div className="code-line"><span>04</span><code>&nbsp;&nbsp;<span className="cursor-block" /></code></div><div className="code-line"><span>05</span><code>{'}'}</code></div></div>{previewRun && <p className="run-output" role="status">Preview ready · Open the live practice page to solve this challenge.</p>}<div className="challenge-tags"><span><Target size={12} /> {companyFocus}</span><span><Code2 size={12} /> Arrays</span><span><Zap size={12} /> Coding</span></div><a href="https://dkoder.co.in/practice" className="button button-yellow">Explore practice <ArrowRight size={15} /></a></div></div>
            <div className="practice-side"><div className="practice-side-head"><span className="overline">ONE SESSION AT A TIME</span><div className="practice-ring"><div><strong>86</strong><small>ACCURACY</small></div></div><p>Make room for the next question. Your own scores and activity live in your Dkoder account.</p></div><div className="practice-stat"><div className="stat-icon"><Zap size={16} /></div><div><small>XP SYSTEM</small><strong>Earn as you practise</strong></div><span>↗</span></div><div className="practice-stat"><div className="stat-icon"><Flame size={16} /></div><div><small>DAILY CHALLENGES</small><strong>Keep a steady rhythm</strong></div><span>↗</span></div><div className="practice-disclaimer">Illustrative challenge preview—not a real student account.</div></div>
          </div>
        </section>

        <section className="progress-section section-wrap" id="progress">
          <div className="progress-copy" data-reveal><div className="section-kicker"><span>04 / SEE YOUR PROGRESS</span><span className="kicker-line" /></div><p className="overline">SMALL WINS, VISIBLE</p><h2>Watch yourself<br /><span>level up.</span></h2><p className="section-intro">XP, activity and analytics give you a way to see the work adding up—not just the work still ahead.</p><a className="text-link" href="https://dkoder.co.in/leaderboard">Explore the leaderboard <ArrowUpRight size={16} /></a></div>
          <div className="level-card" data-reveal><div className="level-card-top"><span>STUDENT PROGRESS / PREVIEW</span><span className="live-indicator"><i /> SAMPLE UI</span></div><div className="level-number"><div><small>LEVEL</small><strong>27</strong></div><div className="level-badge"><Award size={22} /><span>CONSISTENCY<br />IN TRAINING</span></div></div><div className="xp-label"><span>LEVEL PROGRESS</span><span>8,420 <i>/ 10,000 XP</i></span></div><div className="xp-track"><i /></div><div className="progress-metrics"><div><span className="metric-icon fire"><Flame size={15} /></span><small>STREAK</small><strong>14 <i>days</i></strong></div><div><span className="metric-icon accuracy"><Zap size={15} /></span><small>ACCURACY</small><strong>86<i>%</i></strong></div><div><span className="metric-icon rank"><Award size={15} /></span><small>RANK</small><strong>#24</strong></div><div><span className="metric-icon solved"><Code2 size={15} /></span><small>PROBLEMS</small><strong>247</strong></div></div><div className="chart-label"><span>ACTIVITY OVERVIEW</span><span>LAST 7 DAYS <ChevronDown size={12} /></span></div><div className="activity-chart" aria-label="Illustrative activity chart"><div style={{ height: '32%' }} /><div style={{ height: '54%' }} /><div style={{ height: '42%' }} /><div style={{ height: '76%' }} /><div style={{ height: '62%' }} /><div style={{ height: '91%' }} /><div style={{ height: '68%' }} /></div><div className="chart-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><p className="illustrative-note">Illustrative interface data only. Your results are personal to your account.</p></div>
        </section>

        <section className="features-section section-wrap" id="features">
          <div className="features-head" data-reveal><div className="section-kicker"><span>05 / THE TOOLKIT</span><span className="kicker-line" /></div><p className="overline">THE FULL PREP PICTURE</p><h2>More than coding<br /><span>problems.</span></h2><p className="section-intro">One platform, different ways to prepare. Choose a focus to see how each part fits into your journey.</p></div>
          <div className="feature-system" data-reveal><div className="feature-list" role="tablist" aria-label="Dkoder product features">{featureList.map((feature, index) => { const Icon = feature.icon; return <button className={`feature-item${activeFeature === index ? ' feature-active' : ''}`} type="button" role="tab" aria-selected={activeFeature === index} key={feature.title} onClick={() => setActiveFeature(index)}><span className="feature-index">0{index + 1}</span><span className="feature-icon"><Icon size={18} /></span><span className="feature-title">{feature.title}</span><ArrowUpRight className="feature-arrow" size={16} /></button>; })}</div><div className="feature-demo" role="tabpanel"><div className="demo-top"><span>DKODER / PRODUCT AREAS</span><span>0{activeFeature + 1} — 06</span></div><div className="demo-graphic"><div className="demo-orbit demo-orbit-a" /><div className="demo-orbit demo-orbit-b" /><div className="demo-core"><div className="demo-core-icon">{(() => { const Icon = featureList[activeFeature].icon; return <Icon size={25} />; })()}</div><span>PREP / MODULE</span><strong>{featureList[activeFeature].title}</strong></div><div className="demo-float demo-float-one"><Check size={12} /> Focused practice</div><div className="demo-float demo-float-two"><Sparkles size={12} /> One next step</div><div className="demo-float demo-float-three"><MousePointer2 size={12} /> Your pace</div></div><div className="demo-description"><div><span className="overline">THE FOCUS</span><p>{featureList[activeFeature].detail}</p></div><a href="https://dkoder.co.in/practice" aria-label="Explore Dkoder product"><ArrowUpRight size={18} /></a></div></div></div>
        </section>

        <section className="report-section section-wrap" id="report">
          <div className="report-visual" data-reveal><div className="scan-line" /><div className="report-top"><span><Sparkles size={14} /> DKODER / AI REPORT CARD</span><span className="report-pulse">ANALYSIS PREVIEW</span></div><div className="report-title"><div><small>YOUR PLACEMENT READINESS</small><h3>A clearer view<br />of your prep.</h3></div><div className="readiness-ring"><div><strong>82</strong><span>%</span></div></div></div><div className="report-bars"><div className="report-bar"><span>DSA</span><div><i style={{ width: '91%' }} /></div><b>91%</b></div><div className="report-bar"><span>Aptitude</span><div><i style={{ width: '87%' }} /></div><b>87%</b></div><div className="report-bar"><span>Core CS</span><div><i style={{ width: '74%' }} /></div><b>74%</b></div><div className="report-bar"><span>Coding</span><div><i style={{ width: '82%' }} /></div><b>82%</b></div><div className="report-bar"><span>Interview</span><div><i style={{ width: '68%' }} /></div><b>68%</b></div></div><div className="ai-recommendation"><span><Sparkles size={13} /> AI RECOMMENDATION</span><p>“Your coding fundamentals look strong. Give your next practice session to interview preparation.”</p></div><p className="illustrative-note">Illustrative report-card preview. Not a real assessment or student result.</p></div>
          <div className="report-copy" data-reveal><div className="section-kicker"><span>06 / CLOSE THE LOOP</span><span className="kicker-line" /></div><p className="overline">LESS GUESSING, MORE DIRECTION</p><h2>Know where<br /><span>you stand.</span></h2><p className="section-intro">See strengths and areas to revisit with Dkoder’s AI report card, available on eligible plans. Use it to make your next session count.</p><a className="button button-yellow" href="#plans">Explore plans <ArrowRight size={16} /></a></div>
        </section>

        <section className="proof-section section-wrap" id="proof"><div className="proof-intro" data-reveal><div className="section-kicker"><span>07 / BUILT FOR THE REAL PREP</span><span className="kicker-line" /></div><p className="overline">INSPECT THE PRODUCT</p><h2>Proof you can<br /><span>look into.</span></h2><p className="section-intro">Explore the practice bank, career tracks and bundles for yourself. No made-up placement promises—just a closer look at what you can use.</p></div><div className="proof-grid" data-reveal><a className="proof-tile proof-wide" href="https://dkoder.co.in/practice"><div className="proof-tile-top"><span><Search size={15} /> THE QUESTION BANK</span><ArrowUpRight size={18} /></div><strong>3,254</strong><span>questions across 44 companies</span><div className="proof-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></a><a className="proof-tile" href="https://dkoder.co.in/bundles"><div className="proof-tile-top"><span><BookOpen size={15} /> PREP BUNDLES</span><ArrowUpRight size={18} /></div><strong>12</strong><span>bundles to explore</span><div className="bundle-preview"><span>INFOSYS COMPLETE PREP <b>473 Q</b></span><span>ACCENTURE COMPLETE PREP <b>446 Q</b></span></div><small className="bundle-price">Both listed at ₹199 on Dkoder.</small></a><div className="proof-tile proof-quote"><div className="quote-mark">“</div><p>“Consistency today, opportunities tomorrow.”</p><span>DKODER DAILY REMINDER</span><div className="quote-orbit" /></div><p className="source-note">Product coverage and bundle details are published on dkoder.co.in. Company names indicate preparation content, not partnerships.</p></div></section>

        <section className="plans-section section-wrap" id="plans"><div className="plans-heading" data-reveal><div><div className="section-kicker"><span>08 / PICK YOUR ACCESS</span><span className="kicker-line" /></div><p className="overline">CLEAR PLANS. CLEAR NEXT STEP.</p><h2>Your target.<br /><span>Your plan.</span></h2></div><div className="plans-aside"><p>Annual pricing, as listed on Dkoder. Your plan determines the company and question filters you can access.</p><span><ShieldCheck size={15} /> Transparent annual pricing</span></div></div><div className="pricing-grid" data-reveal>{plans.map((plan, index) => <article className={`price-card${index === 3 ? ' price-popular' : ''}${index === 4 ? ' price-value' : ''}`} key={plan.name}>{plan.badge && <div className="price-badge">{plan.badge === 'MOST POPULAR' ? <Sparkles size={12} /> : <Zap size={12} />}{plan.badge}</div>}<div className="price-top"><span>{plan.name}</span><span className="price-target">{plan.range}</span></div><p className="price-desc">{plan.desc}</p><div className="price-amount"><span>₹{plan.price.toLocaleString('en-IN')}</span><small>/ year</small></div><div className="per-day">₹{Math.ceil(plan.price / 365)} <span>a day</span></div><div className="price-divider" /><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul><a className={`button ${index >= 3 ? 'button-yellow' : 'button-outline'}`} href="https://dkoder.co.in/auth/login?returnTo=%2Fstudent%2Fsubscription">Choose {plan.name}<ArrowRight size={14} /></a><a className="scholarship-link" href="https://dkoder.co.in/partner-mou">Get Scholarship <ArrowUpRight size={12} /></a></article>)}</div><p className="pricing-note">Prices and plan entitlements can change. <a href="https://dkoder.co.in/pricing">See the current full comparison <ArrowUpRight size={12} /></a></p></section>

        <section className="day-section section-wrap" id="day"><div className="day-heading" data-reveal><div className="section-kicker"><span>09 / MAKE IT A ROUTINE</span><span className="kicker-line" /></div><p className="overline">SMALL STEPS ARE STILL STEPS</p><h2>What if you just did<br /><span>the next thing?</span></h2><p className="section-intro">A sample day, broken into manageable sessions. Check things off to see your day fill in—this demo is local and doesn’t save to an account.</p><div className="day-progress"><div className="day-progress-label"><span>YOUR SAMPLE DAY</span><strong>{checkedTasks.length} / {dayTasks.length} COMPLETE</strong></div><div className="day-progress-track"><i style={{ width: `${(checkedTasks.length / dayTasks.length) * 100}%` }} /></div></div></div><div className="timeline" data-reveal>{dayTasks.map((task, index) => <label className={`timeline-item${checkedTasks.includes(index) ? ' timeline-done' : ''}`} key={task.time}><input type="checkbox" checked={checkedTasks.includes(index)} onChange={() => toggleTask(index)} /><span className="timeline-time">{task.time}</span><span className="timeline-dot"><Check size={12} /></span><span className="timeline-content"><small>{task.kind}</small><strong>{task.label}</strong></span><span className="timeline-check"><Check size={15} /></span></label>)}</div></section>

        <section className="college-section section-wrap" id="colleges"><div className="college-copy" data-reveal><div className="section-kicker"><span>10 / FOR THE WHOLE COHORT</span><span className="kicker-line" /></div><p className="overline">A CAMPUS-WIDE VIEW</p><h2>Now imagine seeing<br /><span>the whole batch.</span></h2><p className="section-intro">Dkoder supports students and colleges with placement preparation. Give placement teams a way to follow cohort activity, spot topics worth revisiting and guide what happens next.</p><div className="college-paths"><a href="https://dkoder.co.in/auth/signup"><span className="path-icon-student"><Target size={17} /></span><span><small>FOR STUDENTS</small><strong>Build your own practice rhythm</strong></span><ArrowUpRight size={16} /></a><a href="https://dkoder.co.in/colleges"><span className="path-icon-college"><BarChart3 size={17} /></span><span><small>FOR PLACEMENT TEAMS</small><strong>Explore the college platform</strong></span><ArrowUpRight size={16} /></a></div><a className="text-link" href="https://dkoder.co.in/partner-mou">Partner with Dkoder <ArrowRight size={15} /></a></div><div className="cohort-dashboard" data-reveal><div className="cohort-top"><div className="cohort-brand"><span className="brand-mark"><Command size={14} /></span><span>dkoder <i>/ CAMPUS</i></span></div><span className="cohort-label"><i /> COHORT OVERVIEW</span></div><div className="cohort-title"><div><small>PLACEMENT READINESS</small><h3>Batch pulse</h3></div><button type="button" aria-label="Dashboard menu"><span /><span /><span /></button></div><div className="cohort-summary"><div><span>ACTIVE STUDENTS</span><strong><i className="pulse-ring" /> Activity view</strong></div><div><span>COHORT PROGRESS</span><strong>On one screen <ArrowUpRight size={13} /></strong></div></div><div className="cohort-chart"><div className="cohort-y-axis"><span>HIGH</span><span>MID</span><span>LOW</span></div><div className="cohort-chart-body"><div className="chart-gridline line-high" /><div className="chart-gridline line-mid" /><div className="chart-gridline line-low" /><svg viewBox="0 0 480 156" preserveAspectRatio="none" role="img" aria-label="Illustrative cohort activity trend"><path d="M0 126 C35 118 38 92 80 99 S132 107 160 72 S205 82 240 62 S287 77 320 48 S362 54 400 28 S451 39 480 12" fill="none" stroke="#d6fa50" strokeWidth="3" /><path d="M0 126 C35 118 38 92 80 99 S132 107 160 72 S205 82 240 62 S287 77 320 48 S362 54 400 28 S451 39 480 12 L480 156 L0 156Z" fill="url(#chartFill)" opacity=".2" /><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d6fa50" /><stop offset="1" stopColor="#d6fa50" stopOpacity="0" /></linearGradient></defs></svg><div className="cohort-x-axis"><span>WEEK 01</span><span>WEEK 02</span><span>WEEK 03</span><span>WEEK 04</span></div></div></div><div className="cohort-focus"><div><span className="focus-dot dot-violet" /><span>TOPIC ACTIVITY</span><strong>See areas to revisit</strong></div><div><span className="focus-dot dot-yellow" /><span>LEARNER MOMENTUM</span><strong>Notice practice patterns</strong></div><div><span className="focus-dot dot-orange" /><span>COHORT VIEW</span><strong>Guide the next session</strong></div></div><p className="illustrative-note">Illustrative dashboard concept. No fabricated institution data.</p></div></section>

        <section className="final-cta section-wrap"><div className="cta-grid" aria-hidden="true" /><div className="cta-orb" aria-hidden="true" /><div className="cta-content" data-reveal><span className="cta-eyebrow"><Sparkles size={14} /> YOUR NEXT MOVE IS YOURS</span><h2>Your dream job<br />starts with the<br /><span>next question.</span></h2><p>Don’t prepare for everything.<br />Prepare for what matters.</p><div className="cta-actions"><a className="button button-yellow" href="https://dkoder.co.in/auth/signup">Start preparing <ArrowRight size={17} /></a><a className="button button-quiet" href="#plans">Explore plans <ArrowUpRight size={16} /></a></div></div><div className="cta-stamp" aria-hidden="true"><span>NEXT<br />QUESTION</span><ArrowDownRight size={22} /></div></section>
      </main>

      <footer className="site-footer"><div className="footer-main"><div className="footer-brand-col"><a className="brand" href="#top"><span className="brand-mark"><Command size={18} /></span><span>dkoder<span className="brand-period">.</span></span></a><p>Placement preparation for students and colleges across India. Practice, learn, make your next move count.</p><a className="footer-contact" href="mailto:support@dkoder.co.in">support@dkoder.co.in <ArrowUpRight size={14} /></a></div><div className="footer-links"><div><h3>PRODUCT</h3><a href="https://dkoder.co.in/practice">Practice</a><a href="https://dkoder.co.in/learn/courses">Courses</a><a href="https://dkoder.co.in/practice">Mock exams</a><a href="https://dkoder.co.in/leaderboard">Progress</a><a href="https://dkoder.co.in/pricing">Plans</a></div><div><h3>FOR COLLEGES</h3><a href="https://dkoder.co.in/colleges">College platform</a><a href="https://dkoder.co.in/partner-mou">Placement teams</a><a href="https://dkoder.co.in/hackathons">Programmes</a></div><div><h3>COMPANY</h3><a href="https://dkoder.co.in/">About Dkoder</a><a href="mailto:support@dkoder.co.in">Contact</a><a href="https://dkoder.co.in/auth/login">Sign in</a></div><div className="footer-next"><span>THE NEXT QUESTION IS WAITING.</span><a href="https://dkoder.co.in/auth/signup">Go make a move <ArrowUpRight size={15} /></a></div></div></div><div className="footer-bottom"><span>© 2026 Dkoder. All rights reserved.</span><span>Practice <i>·</i> Learn <i>·</i> Achieve</span><a href="#top">Back to top <ArrowUpRight size={13} /></a></div><div className="footer-disclaimer">Pricing and product availability may change. Verify current details on dkoder.co.in.</div></footer>
    </>
  );
}

export default App;
