import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, CheckSquare, FileText, BookOpen, Plus, Trash2, ChevronLeft, ChevronRight, X, ListTodo, Briefcase, Home, Pencil, Check, Palette, Settings as SettingsIcon } from "lucide-react";

const ACCENTS = [
  { name: "Terracotta", value: "#A9684F" },
  { name: "Indigo", value: "#4D5FA8" },
  { name: "Forest", value: "#4F7A57" },
  { name: "Plum", value: "#8A4F7E" },
  { name: "Slate", value: "#525B66" },
  { name: "Rust", value: "#B85C38" },
];

function getLuminance(hex) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 1;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const TABS = [
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "todo", label: "To-Do", icon: ListTodo },
  { id: "tracker", label: "Tracker", icon: CheckSquare },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "diary", label: "Diary", icon: BookOpen },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const pad = (n) => String(n).padStart(2, "0");
const todayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dayNames = ["S","M","T","W","T","F","S"];

function useStore(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setValue(raw ? JSON.parse(raw) : fallback);
    } catch {
      setValue(fallback);
    } finally {
      setLoaded(true);
    }
  }, [key]);

  const save = useCallback((next) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [key]);

  return [value, save, loaded];
}

export default function DailyCompanion() {
  const [tab, setTab] = useState("calendar");
  const [events, saveEvents, eventsLoaded] = useStore("companion:events", {});
  const [todos, saveTodos, todosLoaded] = useStore("companion:todos", []);
  const [habits, saveHabits, habitsLoaded] = useStore("companion:habits", []);
  const [notes, saveNotes, notesLoaded] = useStore("companion:notes", []);
  const [diary, saveDiary, diaryLoaded] = useStore("companion:diary", {});
  const [appName, saveAppName, appNameLoaded] = useStore("companion:appname", "Daybook");
  const [accent, saveAccent, accentLoaded] = useStore("companion:accent", "#A9684F");
  const [bgTop, saveBgTop, bgTopLoaded] = useStore("companion:bgtop", "#F6F1E7");
  const [bgBottom, saveBgBottom, bgBottomLoaded] = useStore("companion:bgbottom", "#F6F1E7");
  const [textMode, saveTextMode, textModeLoaded] = useStore("companion:textmode", "auto");
  const [customText, saveCustomText, customTextLoaded] = useStore("companion:customtext", "#2E2A24");
  const [glossy, saveGlossy, glossyLoaded] = useStore("companion:glossy", false);
  const [headerBg, saveHeaderBg, headerBgLoaded] = useStore("companion:headerbg", "#FBF8F1");
  const [navBg, saveNavBg, navBgLoaded] = useStore("companion:navbg", "#FBF8F1");
  const [cardBg, saveCardBg, cardBgLoaded] = useStore("companion:cardbg", "#FBF8F1");
  const [showPalette, setShowPalette] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const ready = eventsLoaded && todosLoaded && habitsLoaded && notesLoaded && diaryLoaded && appNameLoaded && accentLoaded && bgTopLoaded && bgBottomLoaded && textModeLoaded && customTextLoaded && glossyLoaded && headerBgLoaded && navBgLoaded && cardBgLoaded;
  const avgLuminance = (getLuminance(bgTop) + getLuminance(bgBottom)) / 2;
  const pageText = textMode === "custom" ? customText : (avgLuminance < 0.45 ? "#F2EDE3" : "#2E2A24");
  const bgStyle = bgTop === bgBottom ? bgTop : `linear-gradient(180deg, ${bgTop}, ${bgBottom})`;
  const cardText = getLuminance(cardBg) < 0.45 ? "#F2EDE3" : "#2E2A24";

  return (
    <div className={`min-h-screen w-full overflow-x-hidden flex flex-col ${glossy ? "glossy-mode" : ""}`} style={{ "--accent": accent, "--card-bg": cardBg, "--card-text": cardText, background: bgStyle, color: pageText }}>
      <header className="border-b border-[#DDD3BD] px-6 py-5 flex items-center justify-between gap-3 relative min-w-0" style={{ backgroundColor: glossy ? `color-mix(in srgb, ${headerBg} 55%, transparent)` : headerBg, color: getLuminance(headerBg) < 0.45 ? "#F2EDE3" : "#2E2A24" }}>
        <div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveAppName(nameDraft.trim() || "Daybook");
                    setEditingName(false);
                  }
                  if (e.key === "Escape") setEditingName(false);
                }}
                className="text-2xl font-semibold tracking-tight bg-transparent border-b-2 border-[var(--accent)] outline-none"
                style={{ fontFamily: "Georgia, serif" }}
              />
              <button
                onClick={() => {
                  saveAppName(nameDraft.trim() || "Daybook");
                  setEditingName(false);
                }}
                className="text-[var(--accent)] hover:opacity-80"
              >
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                {appName}
              </h1>
              <button
                onClick={() => {
                  setNameDraft(appName);
                  setEditingName(true);
                }}
                className="text-[#C7BCA3] hover:text-[var(--accent)] transition-colors"
                title="Rename"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
          <p className="text-xs text-[#8A8071] mt-0.5">calendar · to-do · tracker · notes · diary</p>
        </div>
        <div className="text-xs text-[#8A8071]">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
      </header>

      <nav className="flex border-b border-[#DDD3BD] px-2 overflow-x-auto" style={{ backgroundColor: glossy ? `color-mix(in srgb, ${navBg} 55%, transparent)` : navBg }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all active:scale-95 shrink-0 whitespace-nowrap ${
              tab === id
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[#8A8071] hover:text-[#2E2A24]"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <main className="flex-1 px-4 py-6 md:px-8 max-w-3xl w-full mx-auto min-w-0">
        {!ready ? (
          <div className="text-center text-[#8A8071] py-20 text-sm">Loading your daybook…</div>
        ) : (
          <div key={tab} className="animate-[fadein_0.25s_ease-out]">
            {tab === "calendar" && <CalendarView events={events} saveEvents={saveEvents} />}
            {tab === "todo" && <TodoView todos={todos} saveTodos={saveTodos} />}
            {tab === "tracker" && <TrackerView habits={habits} saveHabits={saveHabits} />}
            {tab === "notes" && <NotesView notes={notes} saveNotes={saveNotes} />}
            {tab === "diary" && <DiaryView diary={diary} saveDiary={saveDiary} />}
            {tab === "settings" && (
              <SettingsView
                accent={accent}
                saveAccent={saveAccent}
                bgTop={bgTop}
                saveBgTop={saveBgTop}
                bgBottom={bgBottom}
                saveBgBottom={saveBgBottom}
                textMode={textMode}
                saveTextMode={saveTextMode}
                customText={customText}
                saveCustomText={saveCustomText}
                glossy={glossy}
                saveGlossy={saveGlossy}
                headerBg={headerBg}
                saveHeaderBg={saveHeaderBg}
                navBg={navBg}
                saveNavBg={saveNavBg}
                cardBg={cardBg}
                saveCardBg={saveCardBg}
              />
            )}
          </div>
        )}
      </main>
      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popcheck {
          0% { transform: scale(0.7); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .pop-check { animation: popcheck 0.25s ease-out; }
        .glossy-mode .glass-card {
          background: color-mix(in srgb, var(--card-bg) 55%, transparent) !important;
          backdrop-filter: blur(14px) saturate(140%);
          -webkit-backdrop-filter: blur(14px) saturate(140%);
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.5);
        }
        .glossy-mode header {
          backdrop-filter: blur(14px) saturate(140%);
          -webkit-backdrop-filter: blur(14px) saturate(140%);
        }
        .glossy-mode nav {
          backdrop-filter: blur(14px) saturate(140%);
          -webkit-backdrop-filter: blur(14px) saturate(140%);
        }
      `}</style>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`glass-card border border-[#DDD3BD] rounded-lg ${className}`}
      style={{ backgroundColor: "var(--card-bg)", color: "var(--card-text)" }}
    >
      {children}
    </div>
  );
}

function CalendarView({ events, saveEvents }) {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(todayKey());
  const [draft, setDraft] = useState("");
  const [draftTime, setDraftTime] = useState("");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const keyFor = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const addEvent = async () => {
    if (!draft.trim()) return;
    const list = events[selected] || [];
    const next = [...list, { id: Date.now().toString(), text: draft.trim(), time: draftTime }];
    next.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
    await saveEvents({ ...events, [selected]: next });
    setDraft("");
    setDraftTime("");
  };

  const removeEvent = async (id) => {
    const list = (events[selected] || []).filter((e) => e.id !== id);
    const next = { ...events, [selected]: list };
    if (list.length === 0) delete next[selected];
    await saveEvents(next);
  };

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-1.5 rounded hover:bg-[#EDE6D6]">
            <ChevronLeft size={18} />
          </button>
          <span className="font-medium" style={{ fontFamily: "Georgia, serif" }}>{monthNames[month]} {year}</span>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-1.5 rounded hover:bg-[#EDE6D6]">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#8A8071] mb-1">
          {dayNames.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const k = keyFor(d);
            const isToday = k === todayKey();
            const isSelected = k === selected;
            const hasEvents = (events[k] || []).length > 0;
            return (
              <button
                key={i}
                onClick={() => setSelected(k)}
                className={`relative aspect-square rounded text-sm flex items-center justify-center transition-colors ${
                  isSelected ? "bg-[var(--accent)] text-white" : isToday ? "bg-[#EDE6D6] font-semibold" : "hover:bg-[#EDE6D6]"
                }`}
              >
                {d}
                {hasEvents && <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[var(--accent)]"}`} />}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-medium mb-3">{new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        <div className="space-y-2 mb-3">
          {(events[selected] || []).length === 0 && (
            <p className="text-sm text-[#8A8071]">Nothing scheduled. Add something below.</p>
          )}
          {(events[selected] || []).map((e) => (
            <div key={e.id} className="flex items-center justify-between bg-[#F6F1E7] rounded px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                {e.time && <span className="text-xs font-medium text-[var(--accent)] w-20 shrink-0">{formatTime(e.time)}</span>}
                <span>{e.text}</span>
              </div>
              <button onClick={() => removeEvent(e.id)} className="text-[#8A8071] hover:text-[var(--accent)]">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] text-[#8A8071] px-0.5">Time (optional)</label>
            <input
              type="time"
              value={draftTime}
              onChange={(e) => setDraftTime(e.target.value)}
              className="bg-white border border-[#DDD3BD] rounded px-2 py-2 text-sm outline-none focus:border-[var(--accent)] w-full sm:w-32"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0 w-full sm:w-auto">
            <label className="text-[10px] text-[#8A8071] px-0.5">Event</label>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEvent()}
              placeholder="Add an event…"
              className="bg-white border border-[#DDD3BD] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)] w-full"
            />
          </div>
          <button onClick={addEvent} className="bg-[var(--accent)] text-white rounded px-3 py-2 text-sm font-medium hover:opacity-90 w-full sm:w-auto sm:self-end">
            Add
          </button>
        </div>
      </Card>
    </div>
  );
}

function TodoView({ todos, saveTodos }) {
  const [category, saveCategory, categoryLoaded] = useStore("companion:todocategory", "work");
  const [draft, setDraft] = useState("");

  const categories = [
    { id: "work", label: "Work", icon: Briefcase, color: "#4D6FA8", bg: "#E9EEF6" },
    { id: "personal", label: "Day to Day", icon: Home, color: "#5C8A5C", bg: "#EAF2E8" },
  ];

  const activeCat = categories.find((c) => c.id === category);
  const filtered = todos.filter((t) => t.category === category);

  const addTodo = async () => {
    if (!draft.trim()) return;
    await saveTodos([...todos, { id: Date.now().toString(), text: draft.trim(), category, done: false }]);
    setDraft("");
  };

  const toggleDone = async (id) => {
    await saveTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTodo = async (id) => {
    await saveTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {categories.map(({ id, label, icon: Icon, color, bg }) => {
          const count = todos.filter((t) => t.category === id && !t.done).length;
          const isActive = category === id;
          return (
            <button
              key={id}
              onClick={() => saveCategory(id)}
              style={isActive ? { backgroundColor: color, borderColor: color } : { borderColor: "#DDD3BD" }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium border transition-all active:scale-95 ${
                isActive ? "text-white" : "bg-[#FBF8F1] text-[#2E2A24] hover:border-[var(--accent)]"
              }`}
            >
              <Icon size={15} />
              {label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 ${isActive ? "bg-white/20" : "bg-[#EDE6D6]"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Card className="p-4">
        <div className="flex gap-2 mb-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder={category === "work" ? "e.g. Send follow-up email" : "e.g. Buy groceries"}
            className="flex-1 bg-white border border-[#DDD3BD] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={addTodo}
            style={{ backgroundColor: activeCat.color }}
            className="text-white rounded px-3 py-2 text-sm font-medium flex items-center gap-1 active:scale-95 transition-transform hover:opacity-90"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-[#8A8071] text-center py-6">No {category === "work" ? "work" : "day-to-day"} tasks yet.</p>
        ) : (
          <div className="space-y-2">
            {filtered
              .slice()
              .sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1))
              .map((t) => (
                <div key={t.id} style={{ backgroundColor: activeCat.bg }} className="flex items-center justify-between rounded px-3 py-2 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleDone(t.id)}
                      style={t.done ? { backgroundColor: activeCat.color, borderColor: activeCat.color } : { borderColor: "#C7BCA3" }}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
                    >
                      {t.done && <CheckSquare size={12} className="text-white pop-check" />}
                    </button>
                    <span className={`text-sm transition-colors ${t.done ? "line-through text-[#8A8071]" : ""}`}>{t.text}</span>
                  </div>
                  <button onClick={() => removeTodo(t.id)} className="text-[#8A8071] hover:text-[var(--accent)] transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function TrackerView({ habits, saveHabits }) {
  const [draft, setDraft] = useState("");
  const today = todayKey();

  const addHabit = async () => {
    if (!draft.trim()) return;
    await saveHabits([...habits, { id: Date.now().toString(), name: draft.trim(), log: {} }]);
    setDraft("");
  };

  const toggleToday = async (id) => {
    const next = habits.map((h) => {
      if (h.id !== id) return h;
      const log = { ...h.log, [today]: !h.log[today] };
      return { ...h, log };
    });
    await saveHabits(next);
  };

  const removeHabit = async (id) => {
    await saveHabits(habits.filter((h) => h.id !== id));
  };

  const streak = (h) => {
    let count = 0;
    let d = new Date();
    while (h.log[todayKey(d)]) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-sm text-[#8A8071] mb-3">Track a habit by checking it off each day.</p>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="e.g. Apply to 3 jobs"
            className="flex-1 bg-white border border-[#DDD3BD] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button onClick={addHabit} className="bg-[var(--accent)] text-white rounded px-3 py-2 text-sm font-medium hover:opacity-90 flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </Card>

      {habits.length === 0 ? (
        <p className="text-sm text-[#8A8071] text-center py-8">No habits yet. Add one above to start tracking.</p>
      ) : (
        <div className="space-y-2">
          {habits.map((h) => (
            <Card key={h.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleToday(h.id)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors active:scale-90 ${
                    h.log[today] ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[#DDD3BD]"
                  }`}
                >
                  {h.log[today] && <CheckSquare size={14} className="text-white pop-check" />}
                </button>
                <div>
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="text-xs text-[#8A8071]">{streak(h)} day streak</p>
                </div>
              </div>
              <button onClick={() => removeHabit(h.id)} className="text-[#8A8071] hover:text-[var(--accent)]">
                <Trash2 size={14} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesView({ notes, saveNotes }) {
  const [active, setActive] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const openNote = (n) => {
    setActive(n.id);
    setDraftTitle(n.title);
    setDraftBody(n.body);
  };

  const newNote = async () => {
    const n = { id: Date.now().toString(), title: "Untitled", body: "", updated: Date.now() };
    await saveNotes([n, ...notes]);
    openNote(n);
  };

  const saveActive = async () => {
    const next = notes.map((n) => (n.id === active ? { ...n, title: draftTitle || "Untitled", body: draftBody, updated: Date.now() } : n));
    await saveNotes(next);
  };

  const removeNote = async (id) => {
    await saveNotes(notes.filter((n) => n.id !== id));
    if (active === id) setActive(null);
  };

  if (active) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={saveActive}
            className="text-lg font-medium bg-transparent outline-none flex-1"
            style={{ fontFamily: "Georgia, serif" }}
          />
          <button onClick={() => setActive(null)} className="text-[#8A8071] hover:text-[#2E2A24]">
            <X size={18} />
          </button>
        </div>
        <textarea
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          onBlur={saveActive}
          placeholder="Write your note…"
          rows={14}
          className="w-full bg-white border border-[#DDD3BD] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)] resize-none"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <button onClick={newNote} className="w-full bg-[var(--accent)] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 flex items-center justify-center gap-1.5">
        <Plus size={16} /> New note
      </button>
      {notes.length === 0 ? (
        <p className="text-sm text-[#8A8071] text-center py-8">No notes yet.</p>
      ) : (
        notes.map((n) => (
          <Card key={n.id} className="p-3 flex items-center justify-between cursor-pointer hover:border-[var(--accent)]" >
            <div onClick={() => openNote(n)} className="flex-1">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-[#8A8071] truncate">{n.body || "Empty note"}</p>
            </div>
            <button onClick={() => removeNote(n.id)} className="text-[#8A8071] hover:text-[var(--accent)] ml-2">
              <Trash2 size={14} />
            </button>
          </Card>
        ))
      )}
    </div>
  );
}

function SettingsView({
  accent, saveAccent,
  bgTop, saveBgTop, bgBottom, saveBgBottom,
  textMode, saveTextMode, customText, saveCustomText,
  glossy, saveGlossy,
  headerBg, saveHeaderBg, navBg, saveNavBg, cardBg, saveCardBg,
}) {
  return (
    <div className="space-y-5">
      <Card className="p-4">
        <p className="text-sm font-medium mb-1 flex items-center gap-2">
          <Palette size={15} /> Accent color
        </p>
        <p className="text-xs text-[#8A8071] mb-3">Used for buttons, highlights, and selected items.</p>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              onClick={() => saveAccent(a.value)}
              className={`w-full aspect-square rounded-full border-2 transition-transform active:scale-90 ${
                accent === a.value ? "border-[#2E2A24]" : "border-transparent"
              }`}
              style={{ backgroundColor: a.value }}
              title={a.name}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="color" value={accent} onChange={(e) => saveAccent(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-[#DDD3BD]" />
          <input type="text" value={accent} onChange={(e) => saveAccent(e.target.value)} className="flex-1 bg-white border border-[#DDD3BD] rounded px-2 py-2 text-sm outline-none focus:border-[var(--accent)] font-mono" />
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-medium mb-1">Page background</p>
        <p className="text-xs text-[#8A8071] mb-3">The outermost background. Set one color for solid, or two for a top-to-bottom gradient.</p>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <p className="text-xs text-[#8A8071] mb-1.5">Top</p>
            <div className="flex items-center gap-2">
              <input type="color" value={bgTop} onChange={(e) => saveBgTop(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-[#DDD3BD]" />
              <input type="text" value={bgTop} onChange={(e) => saveBgTop(e.target.value)} className="flex-1 w-0 bg-white border border-[#DDD3BD] rounded px-2 py-2 text-xs outline-none focus:border-[var(--accent)] font-mono" />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#8A8071] mb-1.5">Bottom</p>
            <div className="flex items-center gap-2">
              <input type="color" value={bgBottom} onChange={(e) => saveBgBottom(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-[#DDD3BD]" />
              <input type="text" value={bgBottom} onChange={(e) => saveBgBottom(e.target.value)} className="flex-1 w-0 bg-white border border-[#DDD3BD] rounded px-2 py-2 text-xs outline-none focus:border-[var(--accent)] font-mono" />
            </div>
          </div>
        </div>
        <button onClick={() => saveBgBottom(bgTop)} className="text-xs text-[#8A8071] hover:text-[var(--accent)] underline">
          Use solid color instead
        </button>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-medium mb-1">Sections</p>
        <p className="text-xs text-[#8A8071] mb-3">Color the header, the content boxes (calendar, to-do, notes…), and the tab bar separately.</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Header</span>
            <div className="flex items-center gap-2">
              <input type="color" value={headerBg} onChange={(e) => saveHeaderBg(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-[#DDD3BD]" />
              <input type="text" value={headerBg} onChange={(e) => saveHeaderBg(e.target.value)} className="w-24 bg-white border border-[#DDD3BD] rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)] font-mono" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Content boxes</span>
            <div className="flex items-center gap-2">
              <input type="color" value={cardBg} onChange={(e) => saveCardBg(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-[#DDD3BD]" />
              <input type="text" value={cardBg} onChange={(e) => saveCardBg(e.target.value)} className="w-24 bg-white border border-[#DDD3BD] rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)] font-mono" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Tab bar</span>
            <div className="flex items-center gap-2">
              <input type="color" value={navBg} onChange={(e) => saveNavBg(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-[#DDD3BD]" />
              <input type="text" value={navBg} onChange={(e) => saveNavBg(e.target.value)} className="w-24 bg-white border border-[#DDD3BD] rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)] font-mono" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-medium mb-1">Text color</p>
        <p className="text-xs text-[#8A8071] mb-3">Auto picks light or dark text to stay readable against the page background.</p>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => saveTextMode("auto")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
              textMode === "auto" ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "bg-white text-[#2E2A24] border-[#DDD3BD]"
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => saveTextMode("custom")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
              textMode === "custom" ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "bg-white text-[#2E2A24] border-[#DDD3BD]"
            }`}
          >
            Custom
          </button>
        </div>
        {textMode === "custom" && (
          <div className="flex items-center gap-2">
            <input type="color" value={customText} onChange={(e) => saveCustomText(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-[#DDD3BD]" />
            <input type="text" value={customText} onChange={(e) => saveCustomText(e.target.value)} className="flex-1 bg-white border border-[#DDD3BD] rounded px-2 py-2 text-sm outline-none focus:border-[var(--accent)] font-mono" />
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Glossy mode</p>
            <p className="text-xs text-[#8A8071] mt-0.5">Frosted-glass header, tab bar, and content boxes over your background.</p>
          </div>
          <button
            onClick={() => saveGlossy(!glossy)}
            className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${glossy ? "bg-[var(--accent)]" : "bg-[#DDD3BD]"}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${glossy ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </Card>

      <button
        onClick={() => {
          saveAccent("#A9684F");
          saveBgTop("#F6F1E7");
          saveBgBottom("#F6F1E7");
          saveTextMode("auto");
          saveGlossy(false);
          saveHeaderBg("#FBF8F1");
          saveNavBg("#FBF8F1");
          saveCardBg("#FBF8F1");
        }}
        className="text-xs text-[#8A8071] hover:text-[var(--accent)] underline"
      >
        Reset everything to default
      </button>
    </div>
  );
}

function DiaryView({ diary, saveDiary }) {
  const [selected, setSelected] = useState(todayKey());
  const [text, setText] = useState(diary[selected] || "");

  useEffect(() => {
    setText(diary[selected] || "");
  }, [selected, diary]);

  const commit = async () => {
    const next = { ...diary };
    if (text.trim()) next[selected] = text;
    else delete next[selected];
    await saveDiary(next);
  };

  const entryDates = Object.keys(diary).sort((a, b) => b.localeCompare(a));

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-4">
      <Card className="p-3">
        <p className="text-xs text-[#8A8071] mb-2 px-1">Entries</p>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {entryDates.length === 0 && <p className="text-sm text-[#8A8071] px-1">No entries yet.</p>}
          {entryDates.map((d) => (
            <button
              key={d}
              onClick={() => setSelected(d)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm ${selected === d ? "bg-[var(--accent)] text-white" : "hover:bg-[#EDE6D6]"}`}
            >
              {new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </button>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <p className="text-sm font-medium mb-3" style={{ fontFamily: "Georgia, serif" }}>
          {new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          placeholder="How was your day?"
          rows={12}
          className="w-full bg-white border border-[#DDD3BD] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)] resize-none"
        />
      </Card>
    </div>
  );
}
