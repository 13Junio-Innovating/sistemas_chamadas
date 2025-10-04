import React, { useEffect, useRef, useState } from "react";
import { api } from "../services/api";

export default function Painel() {
  const [chamando, setChamando] = useState([]);
  const [proximas, setProximas] = useState([]);
  const prevIdsRef = useRef([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const playerRef = useRef(null);

  // pequeno beep com WebAudio (sem arquivos externos)
  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = 880; // A5
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.start(); o.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  async function carregar() {
    try {
      const { data } = await api.get("/senhas/estado");
      // detectar novas senhas chamando
      const newIds = data.chamando.map(s => s._id).sort();
      const prevIds = prevIdsRef.current;
      const hasNew = newIds.some(id => !prevIds.includes(id));
      setChamando(data.chamando);
      const aguardando = [...data.aguardando_preferencial, ...data.aguardando_normal].slice(0, 8);
      setProximas(aguardando);
      if (prevIds.length && hasNew) {
        beep();
        try {
          const novos = data.chamando.filter(s => !prevIds.includes(s._id));
          novos.forEach(anunciarSenha);
        } catch {}
      }
      prevIdsRef.current = newIds;
    } catch {}
  }

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    try {
      if (playerRef.current) {
        if (next) {
          playerRef.current.unMute();
          playerRef.current.setVolume(80);
          playerRef.current.playVideo();
        } else {
          playerRef.current.mute();
        }
      }
      // aquecer o motor de fala para evitar bloqueio na primeira fala
      if (next && window.speechSynthesis) {
      try {
        const test = new SpeechSynthesisUtterance(" ");
        test.lang = "pt-BR";
        test.rate = 1.0;
        test.pitch = 1.0;
        window.speechSynthesis.speak(test);
        window.speechSynthesis.cancel();
      } catch {}
      // anunciar imediatamente a(s) senha(s) atual(is) para confirmar funcionamento
      setTimeout(() => {
        try {
          const atuais = chamando.slice(0, 1);
          atuais.forEach(anunciarSenha);
        } catch {}
      }, 300);
    }
  } catch {}
};

  const anunciarSenha = (s) => {
    if (!audioEnabled) return;
    const tipoLabel = s.tipo === "preferencial" ? "Preferencial" : "Normal";
    const numFmt = (s.tipo === "preferencial" ? "P" : "N") + String(s.numero).padStart(3, "0");
    const guiche = s.guiche || "Guichê 1";
    const text = `Atenção: senha ${tipoLabel} ${numFmt}. Dirija-se ao ${guiche}.`;
    try {
      const speak = () => {
        try {
          window.speechSynthesis.cancel();
        } catch {}
        const utt = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const v = voices && voices.find(v => (v.lang || "").toLowerCase().startsWith("pt"));
        if (v) utt.voice = v;
        utt.lang = "pt-BR";
        utt.rate = 1.0;
        utt.pitch = 1.0;
        window.speechSynthesis.speak(utt);
      };
      const loadedVoices = window.speechSynthesis.getVoices();
      if (!loadedVoices || loadedVoices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => speak();
      } else {
        speak();
      }
    } catch {}
  };

  useEffect(() => { carregar(); const t=setInterval(carregar,3000); return ()=>clearInterval(t); }, []);

  // carregar API do YouTube e instanciar player
  useEffect(() => {
    // carregar script apenas uma vez
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => {
      try {
        playerRef.current = new window.YT.Player('yt-video', {
          videoId: '_TUU487uR38',
          playerVars: {
            autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: '_TUU487uR38',
            modestbranding: 1, rel: 0, playsinline: 1
          },
          events: {
            onReady: (e) => { e.target.mute(); e.target.playVideo(); }
          }
        });
      } catch {}
    };
    return () => { try { window.onYouTubeIframeAPIReady = null; } catch {} };
  }, []);

  const numero = (s) => (s.tipo==="preferencial"?"P":"N")+String(s.numero).padStart(3,"0");
  const hora = (d) => d ? new Date(d).toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"}) : "-";

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white">
      <div className="grid grid-cols-2 h-full">
        {/* Coluna esquerda: conteúdo do painel */}
        <div className="p-6 h-full overflow-hidden flex flex-col">
          <div className="mb-6">
            <div className="text-center mb-6">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9ede071ef_costao_logo.jpeg" alt="Logo" className="w-20 h-20 mx-auto mb-4"/>
              <h1 className="text-5xl font-bold">Costão do Santinho</h1>
              <p className="text-xl text-slate-300">Painel de Chamadas</p>
              <div className="text-lg text-slate-400 mt-2">
                {new Date().toLocaleString("pt-BR", { weekday:"long", year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" })}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleToggleAudio}
                title={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition shadow-sm
                  ${audioEnabled ? 'bg-green-500/20 border-green-500 hover:bg-green-500/30' : 'bg-white/10 border-slate-500 hover:bg-white/20'}`}
              >
                <span className="inline-block w-2 h-2 rounded-full" style={{backgroundColor: audioEnabled ? '#22c55e' : '#64748b'}}></span>
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto flex-1 overflow-hidden flex flex-col">
            <h2 className="text-3xl font-bold mb-4 text-center flex-shrink-0">Senhas Chamadas</h2>
            {chamando.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6 overflow-auto pr-2">
                {chamando.slice(0,6).map((s) => (
                  <div key={s._id} className={`p-6 rounded-2xl shadow-2xl bg-gradient-to-br ${s.tipo==="preferencial"?"from-amber-400 to-orange-500":"from-blue-400 to-cyan-500"}`}>
                    <div className="text-5xl font-bold">{numero(s)}</div>
                    <div className="text-base opacity-90">{s.tipo==="preferencial"?"Preferencial":"Normal"}</div>
                    <div className="text-xl font-semibold mt-3 mb-1">{s.guiche || "Guichê 1"}</div>
                    <div className="opacity-90">{hora(s.hora_chamada)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-white/5 rounded-2xl border border-slate-700 text-center mb-10">
                <p className="text-2xl text-slate-300">Nenhuma senha sendo chamada.</p>
              </div>
            )}

            <h3 className="text-2xl font-bold mb-3 text-center flex-shrink-0">Próximas Senhas</h3>
            {proximas.length ? (
              <div className="flex justify-center flex-1 overflow-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 content-start p-1">
                  {proximas.map((s) => (
                    <div key={s._id} className={`p-4 rounded-xl border text-center ${s.tipo==="preferencial"?"bg-amber-400/20 border-amber-400":"bg-white/10 border-slate-600"}`}>
                      <div className="text-3xl font-bold">{numero(s)}</div>
                      <div className="text-sm text-slate-300 mt-1">{hora(s.hora_retirada)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white/5 rounded-2xl border border-slate-700 text-center flex-1">
                <p className="text-xl text-slate-300">Nenhuma senha aguardando.</p>
              </div>
            )}
          </div>
        </div>
        {/* Coluna direita: vídeo do resort em loop */}
        <div className="relative min-h-screen bg-black">
          <div className="absolute inset-0">
            <div id="yt-video" className="w-full h-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
