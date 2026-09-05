import React from "react";
import { createRoot } from "react-dom/client";
import { MessageCircle, Search, Settings, ShieldCheck, Sparkles } from "lucide-react";
import "./styles.css";

const conversations = [
  { name: "Bienvenue dans CHAT FINI", preview: "Votre espace de communication unifié.", time: "—" },
  { name: "OMNI", preview: "Assistant IA — architecture prête à évoluer.", time: "—" },
];

function App() {
  return <main className="shell">
    <aside className="sidebar">
      <header className="brand"><div className="logo">∞</div><div><strong>CHAT FINI</strong><span>Communication, unifiée.</span></div></header>
      <div className="search"><Search size={17}/><input placeholder="Rechercher" /></div>
      <nav>{conversations.map((c) => <button className="conversation" key={c.name}><div className="avatar">{c.name[0]}</div><div className="copy"><strong>{c.name}</strong><span>{c.preview}</span></div><small>{c.time}</small></button>)}</nav>
      <footer><button><Settings size={18}/> Paramètres</button></footer>
    </aside>
    <section className="content">
      <div className="hero"><div className="status"><span className="dot"/> Architecture active</div><h1>Un seul espace pour <em>communiquer.</em></h1><p>CHAT FINI est construit sur un noyau modulaire : identité, messages, présence, médias, appels, synchronisation, sécurité, IA, mémoire et connecteurs.</p><div className="actions"><button className="primary"><MessageCircle size={18}/> Nouvelle conversation</button><button className="secondary"><Sparkles size={18}/> OMNI</button></div></div>
      <div className="cards"><article><ShieldCheck/><h3>Sécurité par conception</h3><p>Les garanties cryptographiques seront implémentées et vérifiées avant d'être déclarées actives.</p></article><article><Sparkles/><h3>IA multi-fournisseurs</h3><p>Un routeur abstrait permet d'intégrer OpenAI, Claude, Gemini et d'autres modèles sans coupler le produit.</p></article><article><MessageCircle/><h3>Multi-appareils</h3><p>Web et mobile partagent les contrats métier et les événements sans dépendre d'une interface unique.</p></article></div>
    </section>
  </main>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
