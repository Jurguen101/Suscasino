import React, { useState, useEffect } from 'react';
import { Users, Play, Skull, checkCircle, XCircle, AlertTriangle, Crown, RotateCcw, Eye, Gavel } from 'lucide-react';

// Colores de Among Us
const COLORS = [
  { id: 'red', hex: '#C51111', name: 'Rojo' },
  { id: 'blue', hex: '#132ED1', name: 'Azul' },
  { id: 'green', hex: '#117F2D', name: 'Verde' },
  { id: 'pink', hex: '#ED54BA', name: 'Rosa' },
  { id: 'orange', hex: '#EF7D0D', name: 'Naranja' },
  { id: 'yellow', hex: '#F5F557', name: 'Amarillo' },
  { id: 'black', hex: '#3F474E', name: 'Negro' },
  { id: 'white', hex: '#D6E0F0', name: 'Blanco' },
  { id: 'purple', hex: '#6B2FBB', name: 'Morado' },
  { id: 'brown', hex: '#71491E', name: 'Marrón' },
  { id: 'cyan', hex: '#38FEDC', name: 'Cian' },
  { id: 'lime', hex: '#50EF39', name: 'Lima' },
  { id: 'maroon', hex: '#5F1D2E', name: 'Granate' }, // Extra
  { id: 'rose', hex: '#ECC0D3', name: 'Coral' },    // Extra
  { id: 'banana', hex: '#F0E442', name: 'Banana' },  // Extra
];

// Preguntas de la apuesta
const BET_QUESTIONS = [
  { id: 'winner', label: '¿Quién Gana la partida?', type: 'team', options: ['Tripulantes', 'Impostores'] },
  { id: 'first_dead', label: '¿Primer cadáver reportado?', type: 'color' },
  { id: 'first_ejected', label: '¿Primer expulsado (Votación)?', type: 'color_skip' },
  { id: 'sabotage_win', label: '¿Ganan por Sabotaje?', type: 'bool', options: ['Sí', 'No'] },
  { id: 'impostor_alive', label: '¿Sobreviven todos los Impostores?', type: 'bool', options: ['Sí', 'No'] },
];

const CrewmateIcon = ({ colorHex, size = "w-8 h-8", className="" }) => (
  <div className={`relative ${size} ${className}`} style={{ color: colorHex }}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-md">
      <path d="M10.5 2C7.5 2 5 4.5 5 7.5V16C5 17.5 6 18.5 7 19V21C7 21.55 7.45 22 8 22H9C9.55 22 10 21.55 10 21V19H14V21C14 21.55 14.45 22 15 22H16C16.55 22 17 21.55 17 21V18C18.5 17.5 19 16.5 19 15V10C19 10 19 8 17 8V7C17 4.5 14.5 2 12 2H10.5Z" />
      <path d="M14 8H17C18 8 19 9 19 10V12C19 13 18 14 17 14H14C13 14 12 13 12 12V10C12 9 13 8 14 8Z" fill="#93C5FD" fillOpacity="0.8"/>
    </svg>
  </div>
);

const App = () => {
  const [gameState, setGameState] = useState('SETUP'); // SETUP, BETTING, WAITING, RESOLVE, RESULTS
  const [players, setPlayers] = useState([]);
  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const [currentBettorIndex, setCurrentBettorIndex] = useState(0);
  const [bets, setBets] = useState({}); // { playerId: { questionId: value } }
  const [gameResult, setGameResult] = useState({}); // { questionId: value }
  const [notification, setNotification] = useState(null);

  // --- Funciones de Utilidad ---
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Lógica de Setup ---
  const addPlayer = () => {
    if (!currentPlayerName.trim()) return;
    if (players.length >= 15) {
      showNotification("¡Máximo 15 jugadores!");
      return;
    }
    const color = COLORS[players.length % COLORS.length];
    const newPlayer = {
      id: Date.now().toString(),
      name: currentPlayerName,
      color: color
    };
    setPlayers([...players, newPlayer]);
    setCurrentPlayerName('');
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const startGame = () => {
    if (players.length < 2) {
      showNotification("Se necesitan al menos 2 jugadores.");
      return;
    }
    setGameState('BETTING');
    setCurrentBettorIndex(0);
    setBets({});
  };

  // --- Lógica de Apuestas ---
  const submitBets = (playerBets) => {
    const player = players[currentBettorIndex];
    setBets(prev => ({ ...prev, [player.id]: playerBets }));

    if (currentBettorIndex < players.length - 1) {
      setCurrentBettorIndex(currentBettorIndex + 1);
    } else {
      setGameState('WAITING');
    }
  };

  // --- Lógica de Resolución ---
  const submitResolution = (results) => {
    setGameResult(results);
    setGameState('RESULTS');
  };

  const resetRound = () => {
    setBets({});
    setGameResult({});
    setGameState('SETUP'); // Volver a setup para añadir/quitar gente si quieren
  };

  // --- Renderizado de Componentes ---

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden">
      {/* Fondo de Estrellas CSS */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-20 w-2 h-2 bg-blue-200 rounded-full animate-ping duration-1000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute top-3/4 left-10 w-1.5 h-1.5 bg-yellow-100 rounded-full animate-pulse"></div>
        <div className="absolute top-5 right-5 w-1 h-1 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-4 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="text-center mb-8 pt-6 border-b border-slate-700 pb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 uppercase drop-shadow-sm font-[Verdana]">
            Sus<span className="text-white">Casino</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Apuesta tu vida... o lava los platos.</p>
        </header>

        {/* Notificación */}
        {notification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg z-50 font-bold animate-bounce">
            {notification}
          </div>
        )}

        {/* --- PANTALLA 1: SETUP --- */}
        {gameState === 'SETUP' && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-500">
            <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="text-cyan-400" /> Registro de Tripulación
              </h2>
              
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={currentPlayerName}
                  onChange={(e) => setCurrentPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                  placeholder="Nombre del jugador..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors uppercase font-bold tracking-wide"
                />
                <button 
                  onClick={addPlayer}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-transform active:scale-95"
                >
                  AÑADIR
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-700 group">
                    <div className="flex items-center gap-2">
                      <CrewmateIcon colorHex={player.color.hex} />
                      <span className="font-bold truncate max-w-[80px]">{player.name}</span>
                    </div>
                    <button 
                      onClick={() => removePlayer(player.id)}
                      className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ))}
                {players.length === 0 && (
                  <div className="col-span-full text-center text-slate-500 py-4 italic">
                    Nadie en la sala...
                  </div>
                )}
              </div>

              <button
                onClick={startGame}
                disabled={players.length < 2}
                className={`w-full py-4 rounded-xl font-black text-xl uppercase tracking-widest shadow-lg transition-all
                  ${players.length < 2 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-500 text-white hover:scale-[1.02] shadow-green-900/50'}`}
              >
                Abrir Apuestas
              </button>
            </div>
          </div>
        )}

        {/* --- PANTALLA 2: APUESTAS --- */}
        {gameState === 'BETTING' && (
          <BettingForm 
            player={players[currentBettorIndex]} 
            totalPlayers={players.length}
            currentIndex={currentBettorIndex}
            onSubmit={submitBets}
          />
        )}

        {/* --- PANTALLA 3: ESPERA --- */}
        {gameState === 'WAITING' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 mb-6 relative">
              <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20"></div>
              <CrewmateIcon colorHex="#C51111" size="w-24 h-24" className="animate-bounce" />
            </div>
            <h2 className="text-3xl font-black text-red-500 mb-2 uppercase tracking-widest">
              Juego en Curso
            </h2>
            <p className="text-slate-300 max-w-md mb-8">
              ¡Cuidado con las alcantarillas! Cuando termine la partida, el administrador debe registrar los hechos.
            </p>
            <button
              onClick={() => setGameState('RESOLVE')}
              className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Gavel size={20} />
              REGISTRAR RESULTADOS
            </button>
          </div>
        )}

        {/* --- PANTALLA 4: RESOLUCIÓN (ADMIN) --- */}
        {gameState === 'RESOLVE' && (
          <ResolutionForm onSubmit={submitResolution} />
        )}

        {/* --- PANTALLA 5: RESULTADOS --- */}
        {gameState === 'RESULTS' && (
          <ResultsDisplay 
            players={players} 
            bets={bets} 
            actualResults={gameResult} 
            onReset={resetRound} 
          />
        )}

      </div>
    </div>
  );
};

// --- Componente: Formulario de Apuestas ---
const BettingForm = ({ player, totalPlayers, currentIndex, onSubmit }) => {
  const [currentBets, setCurrentBets] = useState({});

  const handleSelect = (questionId, value) => {
    setCurrentBets(prev => ({ ...prev, [questionId]: value }));
  };

  const isComplete = BET_QUESTIONS.every(q => currentBets[q.id]);

  return (
    <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 font-mono text-sm">Jugador {currentIndex + 1}/{totalPlayers}</span>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-600">
           <span className="text-xs text-slate-400">APOSTADOR:</span>
           <CrewmateIcon colorHex={player.color.hex} size="w-5 h-5" />
           <span className="font-bold text-white uppercase">{player.name}</span>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 flex-1">
        <h3 className="text-center text-xl font-bold mb-6 text-cyan-400 border-b border-slate-700 pb-2">
          HAZ TUS PREDICCIONES
        </h3>

        <div className="space-y-6">
          {BET_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">{q.label}</label>
              <div className="flex flex-wrap gap-2">
                {q.type === 'color' || q.type === 'color_skip' ? (
                  <>
                    {q.type === 'color_skip' && (
                       <button
                       onClick={() => handleSelect(q.id, 'skip')}
                       className={`px-3 py-1 rounded border text-sm font-bold transition-all
                         ${currentBets[q.id] === 'skip' 
                           ? 'bg-slate-200 text-slate-900 border-white' 
                           : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-400'}`}
                     >
                       SKIP
                     </button>
                    )}
                    {COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(q.id, c.name)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110
                          ${currentBets[q.id] === c.name ? 'border-white scale-110 ring-2 ring-cyan-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {currentBets[q.id] === c.name && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    ))}
                  </>
                ) : (
                  q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(q.id, opt)}
                      className={`flex-1 py-2 px-3 rounded text-sm font-bold border transition-all
                        ${currentBets[q.id] === opt 
                          ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]' 
                          : 'bg-slate-900 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {opt}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onSubmit(currentBets)}
          disabled={!isComplete}
          className={`w-full mt-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-all
            ${!isComplete 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]'}`}
        >
          {currentIndex === totalPlayers - 1 ? 'Finalizar Apuestas' : 'Siguiente Jugador'}
        </button>
      </div>
    </div>
  );
};

// --- Componente: Formulario de Resolución ---
const ResolutionForm = ({ onSubmit }) => {
  const [results, setResults] = useState({});

  const handleSelect = (questionId, value) => {
    setResults(prev => ({ ...prev, [questionId]: value }));
  };

  const isComplete = BET_QUESTIONS.every(q => results[q.id]);

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-500">
      <div className="bg-slate-800 border-2 border-yellow-600/50 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Banner de "Realidad" */}
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-600"></div>
        
        <h2 className="text-2xl font-black text-center mb-6 text-yellow-500 flex items-center justify-center gap-2">
          <Eye /> LA VERDAD
        </h2>
        <p className="text-center text-slate-400 text-sm mb-6">Ingresa lo que ocurrió realmente en la partida.</p>

        <div className="space-y-6">
          {BET_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-2 bg-slate-900/50 p-3 rounded-lg">
              <label className="block text-xs font-bold text-yellow-600 uppercase tracking-wide">{q.label}</label>
              <div className="flex flex-wrap gap-2">
                {q.type === 'color' || q.type === 'color_skip' ? (
                  <>
                    {q.type === 'color_skip' && (
                       <button
                       onClick={() => handleSelect(q.id, 'skip')}
                       className={`px-2 py-1 rounded text-xs font-bold border ${results[q.id] === 'skip' ? 'bg-yellow-600 text-white border-yellow-400' : 'bg-transparent text-slate-500 border-slate-700'}`}
                     >
                       SKIP
                     </button>
                    )}
                    {COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(q.id, c.name)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${results[q.id] === c.name ? 'scale-125 border-white ring-1 ring-yellow-500' : 'border-transparent opacity-50'}`}
                        style={{ backgroundColor: c.hex }}
                      >
                         {results[q.id] === c.name && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </button>
                    ))}
                  </>
                ) : (
                   q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(q.id, opt)}
                      className={`flex-1 py-1 px-2 rounded text-xs font-bold border transition-all
                        ${results[q.id] === opt 
                          ? 'bg-yellow-600 border-yellow-400 text-white' 
                          : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                    >
                      {opt}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onSubmit(results)}
          disabled={!isComplete}
          className={`w-full mt-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-all
            ${!isComplete 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg hover:shadow-yellow-500/20'}`}
        >
          CALCULAR RESULTADOS
        </button>
      </div>
    </div>
  );
};

// --- Componente: Pantalla de Resultados ---
const ResultsDisplay = ({ players, bets, actualResults, onReset }) => {
  
  // Calcular puntajes
  const scores = players.map(player => {
    let hits = 0;
    const playerBets = bets[player.id];
    let details = [];

    BET_QUESTIONS.forEach(q => {
      const isCorrect = playerBets[q.id] === actualResults[q.id];
      if (isCorrect) hits++;
      details.push({ qId: q.id, bet: playerBets[q.id], correct: isCorrect });
    });

    return { ...player, hits, details };
  }).sort((a, b) => b.hits - a.hits); // Ordenar por aciertos

  return (
    <div className="flex-1 flex flex-col animate-in zoom-in duration-500">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Informe de Misión
        </h2>
      </div>

      <div className="space-y-4 mb-8">
        {scores.map((p, idx) => {
          const isWinner = idx === 0 && p.hits > 0;
          const isLoser = p.hits === 0;

          return (
            <div 
              key={p.id} 
              className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all hover:scale-[1.01]
                ${isWinner ? 'bg-yellow-900/30 border-yellow-500' : 
                  isLoser ? 'bg-red-900/20 border-red-800' : 'bg-slate-800 border-slate-700'}`}
            >
              {/* Etiqueta de Castigo */}
              {isLoser && (
                <div className="absolute top-2 right-2 transform rotate-12 border-2 border-red-600 text-red-600 font-black text-xs px-2 py-1 rounded uppercase tracking-widest opacity-80">
                  CASTIGADO
                </div>
              )}
              {isWinner && (
                 <div className="absolute -top-1 -right-1">
                   <Crown className="text-yellow-400 fill-yellow-400 w-8 h-8 drop-shadow-lg" />
                 </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <CrewmateIcon colorHex={p.color.hex} size="w-10 h-10" />
                    {isLoser && <Skull className="absolute -bottom-1 -right-1 w-5 h-5 text-red-500 bg-slate-900 rounded-full p-0.5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none">{p.name}</h3>
                    <span className={`text-xs font-mono ${isLoser ? 'text-red-400' : 'text-slate-400'}`}>
                      {p.hits} aciertos de {BET_QUESTIONS.length}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-200">
                  {isLoser ? '💀' : `+${p.hits}`}
                </div>
              </div>

              {/* Barra de progreso de aciertos */}
              <div className="flex gap-1 h-2 mt-2">
                {p.details.map((d, i) => (
                   <div 
                    key={i} 
                    className={`flex-1 rounded-full ${d.correct ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-700'}`}
                   />
                ))}
              </div>
              
              {isLoser && (
                 <div className="mt-3 bg-red-500/10 p-2 rounded text-center">
                   <p className="text-red-300 text-xs font-bold uppercase animate-pulse">
                     ¡Castigo Requerido!
                   </p>
                 </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onReset}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-8"
      >
        <RotateCcw size={20} />
        NUEVA RONDA (Mantener Jugadores)
      </button>

      {/* Resumen de la realidad para referencia */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-xs text-slate-500 text-center">
        <p className="uppercase font-bold mb-2">Resultado Real:</p>
        <div className="flex flex-wrap justify-center gap-2">
           {BET_QUESTIONS.map(q => (
             <span key={q.id} className="bg-slate-800 px-2 py-1 rounded">
               {q.label.split(' ')[1]}: <span className="text-slate-300">{actualResults[q.id]}</span>
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};

export default App;