import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  useLocation
} from 'react-router-dom';
import { 
  Car, 
  ShieldCheck, 
  AlertCircle, 
  MessageSquare, 
  LayoutDashboard, 
  Menu, 
  X, 
  ChevronRight,
  Search,
  FileText,
  User,
  LogOut,
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { cn } from './lib/utils';
import { Claim, KBArticle, UserProfile } from './types';
import { getChatResponse } from './lib/gemini';

// --- Components ---

const Navbar = ({ user, profile }: { user: FirebaseUser | null, profile: UserProfile | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Help Center', path: '/help' },
    { name: 'Claims', path: '/claims' },
  ];

  if (profile?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-md border-b border-border h-16">
      <div className="max-w-7xl mx-auto px-10 h-full">
        <div className="flex justify-between h-full items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-accent rounded-[4px]" />
            <span className="text-lg font-bold tracking-tighter text-accent">TAXICLAIMS<span className="text-muted">.scot</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={cn(
                  "text-[13px] font-medium uppercase tracking-wider transition-colors hover:text-accent",
                  location.pathname === link.path ? "text-accent" : "text-muted"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-border">
                <button 
                  onClick={() => signOut(auth)}
                  className="text-xs text-muted hover:text-accent transition-colors uppercase tracking-widest"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="px-4 py-2 bg-accent text-bg text-[13px] font-bold rounded-md hover:opacity-90 transition-opacity uppercase tracking-wider"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black border-b border-white/10 px-4 py-6 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-white/60 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <button 
                onClick={handleLogin}
                className="w-full py-3 bg-white text-black font-semibold rounded-xl"
              >
                Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-2 py-1 border border-border rounded-md text-[11px] font-semibold text-muted uppercase tracking-wider mb-6">
              Regulated Claims Management
            </span>
            <h1 className="text-7xl md:text-[4.5rem] font-bold text-accent tracking-[-0.05em] mb-6 leading-[0.95]">
              Justice for <br />
              Scottish Drivers.
            </h1>
            <p className="text-lg text-muted max-w-lg mb-10 leading-relaxed">
              Enterprise-grade legal recovery for taxi, PHC, and Uber drivers across Glasgow, Edinburgh, Aberdeen, and Dundee.
            </p>
            
            {/* Step Visual */}
            <div className="flex flex-wrap gap-8">
              {[
                { num: '01', text: 'Submit Claim', active: true },
                { num: '02', text: 'Expert Review', active: false },
                { num: '03', text: 'Instant Payout', active: false },
              ].map((step, idx) => (
                <div key={idx} className={cn("flex items-center gap-3", !step.active && "opacity-50")}>
                  <div className="w-6 h-6 border border-muted rounded-full flex items-center justify-center text-[10px] text-muted font-mono">
                    {step.num}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">{step.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-border rounded-xl p-8 flex flex-col justify-center h-[380px]"
          >
            <h3 className="text-xl font-bold text-accent mb-3">Check Eligibility</h3>
            <p className="text-sm text-muted mb-8 leading-relaxed">
              Secure claim assessment backed by our AI-powered knowledge base of Scottish transport law.
            </p>
            <div className="flex-grow space-y-3 mb-8">
              <div className="p-3 border border-border rounded-md text-[13px] text-muted">
                Select Region (e.g. Glasgow)
              </div>
              <div className="p-3 border border-border rounded-md text-[13px] text-muted">
                License Type (Taxi / PHC)
              </div>
            </div>
            <Link 
              to="/claims/new"
              className="w-full py-4 bg-accent text-bg font-bold rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-[15px]"
            >
              Start My Claim
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ServicesGrid = () => {
  const services = [
    {
      label: 'Liability',
      title: 'Non-Fault Accidents',
      desc: 'Specialist replacement plated vehicles and full loss of earnings recovery for licensed drivers.',
    },
    {
      label: 'Passenger',
      title: 'Injury & Misconduct',
      desc: 'Legal representation for Uber and Bolt passengers involved in incidents within Scottish borders.',
    },
    {
      label: 'Compliance',
      title: 'Fare & Dispute Resolution',
      desc: 'AI-assisted auditing of overcharges and regulatory disputes with local licensing authorities.',
    }
  ];

  return (
    <section className="bg-border border-y border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px]">
        {services.map((service, idx) => (
          <div key={idx} className="bg-bg px-10 py-12 group transition-colors hover:bg-surface">
            <span className="tag-mono">{service.label}</span>
            <h4 className="text-[1.1rem] font-bold text-accent mb-2">{service.title}</h4>
            <p className="text-[13px] text-muted leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const HelpCenter = () => {
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'kb'), orderBy('priority', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KBArticle)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filtered = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">How can we help?</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search for articles, regulations, or guides..."
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/30 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-20 text-white/40">Loading articles...</div>
          ) : filtered.length > 0 ? (
            filtered.map(article => (
              <Link 
                key={article.id} 
                to={`/help/${article.id}`}
                className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-colors group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white/60 uppercase tracking-wider">
                    {article.category}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{article.title}</h3>
                <p className="text-white/50 text-sm line-clamp-2">{article.summary}</p>
              </Link>
            ))
          ) : (
            <div className="col-span-2 text-center py-20 text-white/40">No articles found matching your search.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const ClaimForm = ({ user }: { user: FirebaseUser | null }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'accident',
    location: 'Glasgow',
    details: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'claims'), {
        ...formData,
        userId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setStep(3);
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-40 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Please sign in to submit a claim</h2>
        <button 
          onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
          className="px-8 py-3 bg-white text-black font-bold rounded-xl"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl px-4">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-white mb-8">Tell us what happened</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Claim Type</label>
                  <select 
                    className="w-full p-4 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="accident">Non-Fault Accident</option>
                    <option value="overcharge">Fare Overcharge</option>
                    <option value="misconduct">Driver/Passenger Misconduct</option>
                    <option value="cancellation">Unfair Cancellation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Location</label>
                  <select 
                    className="w-full p-4 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  >
                    <option value="Glasgow">Glasgow</option>
                    <option value="Edinburgh">Edinburgh</option>
                    <option value="Aberdeen">Aberdeen</option>
                    <option value="Dundee">Dundee</option>
                    <option value="Other">Other Scotland</option>
                  </select>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-white text-black font-bold rounded-xl"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-white mb-8">Incident Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    rows={6}
                    placeholder="Please provide as much detail as possible..."
                    className="w-full p-4 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 resize-none"
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={submitting || !formData.details}
                    className="flex-2 py-4 bg-white text-black font-bold rounded-xl disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Claim Submitted!</h2>
              <p className="text-white/60 mb-8">Our legal team will review your details and contact you within 24 hours.</p>
              <button 
                onClick={() => navigate('/claims')}
                className="w-full py-4 bg-white text-black font-bold rounded-xl"
              >
                View My Claims
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your Scottish Taxi Claims assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // In a real app, we'd fetch KB articles here for context
      const response = await getChatResponse(userMsg, []);
      setMessages(prev => [...prev, { role: 'ai', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("Chat failed", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-8 w-96 h-[500px] bg-black border border-white/10 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-white">AI Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-white text-black ml-auto rounded-tr-none" 
                    : "bg-white/10 text-white mr-auto rounded-tl-none"
                )}>
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="bg-white/10 text-white mr-auto rounded-2xl rounded-tl-none p-3 text-sm animate-pulse">
                  Thinking...
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
              <input 
                type="text"
                placeholder="Ask anything..."
                className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="p-2 bg-white text-black rounded-xl"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // In a real app, we'd fetch the profile from Firestore here
        // For demo, we'll mock an admin if email matches
        const isAdmin = u.email === "autoassistscotland@gmail.com";
        setProfile({
          uid: u.uid,
          email: u.email!,
          role: isAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="bg-black min-h-screen" />;

  return (
    <Router>
      <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
        <Navbar user={user} profile={profile} />
        
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <ServicesGrid />
              </>
            } />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/claims/new" element={<ClaimForm user={user} />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>

        <ChatAssistant />

        <footer className="h-16 border-t border-border flex items-center justify-between px-10 mt-auto">
          <div className="flex items-center gap-6 text-[12px] text-muted">
            <span className="font-bold uppercase tracking-wider text-accent/80">© 2026 TAXICLAIMS SCOTLAND</span>
            <span className="hidden sm:inline">No Win No Fee • FCA Regulated</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-muted">
            <span>SYSTEM STATUS: <span className="text-emerald-500">OPERATIONAL</span></span>
            <span className="hidden md:inline">• LATENCY: 24MS</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}
