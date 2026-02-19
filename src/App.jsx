import { AnimatePresence, motion } from "framer-motion";
import RoughTab from "./components/RoughTab.jsx";
import { taps } from "./features/index.js";
import { useTapStore } from "./store/useTapStore.js";

const motionVariants = {
  initial: {
    opacity: 0,
    x: 40,
    rotateY: -18,
    scale: 0.98,
    filter: "blur(3px)",
    transformOrigin: "left center",
  },
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    filter: "blur(0px)",
    transformOrigin: "left center",
  },
  exit: {
    opacity: 0,
    x: -40,
    rotateY: 18,
    scale: 0.98,
    filter: "blur(3px)",
    transformOrigin: "right center",
  },
};

export default function App() {
  const { activeId, setActive } = useTapStore();
  const activeTap = taps.find((tap) => tap.id === activeId) ?? taps[0];

  return (
    <div className="paper">
      <header className="hero">
        <h1 className="title">FRIDAY</h1>
        <nav className="tabs" aria-label="TAP navigation">
          {taps.map((tap) => (
            <RoughTab
              key={tap.id}
              label={tap.label}
              active={tap.id === activeTap.id}
              onClick={() => setActive(tap.id)}
            />
          ))}
        </nav>
      </header>

      <main className="tap-panel" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.section
            key={activeTap.id}
            className="tap-content"
            variants={motionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <p className="tap-meta">TAP MODULE</p>
            <h2 className="tap-title">{activeTap.title}</h2>
            <p className="tap-text">{activeTap.description}</p>
            <div className="tap-body">
              <activeTap.Component />
            </div>
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}
