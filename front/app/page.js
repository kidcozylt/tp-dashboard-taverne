'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const CLASSES = [
  'Archéologue', 'Assassin', 'Exploratrice', 'Guerrier', 'Guerrière',
  'Héros', 'Hobbit', 'Magicien', 'Reine', 'Sorceleur',
];

// Le token est relu dans le navigateur à CHAQUE requête
const lireToken = () => localStorage.getItem('token');

export default function Page() {
  const [connecte, setConnecte] = useState(false);
  const [pret, setPret] = useState(false);

  // Au chargement (et après un F5) : on récupère la session mémorisée
  useEffect(() => {
    setConnecte(Boolean(lireToken()));
    setPret(true);
  }, []);

  function connecter(token) {
    localStorage.setItem('token', token);
    setConnecte(true);
  }

  function deconnecter() {
    localStorage.removeItem('token');
    setConnecte(false);
  }

  if (!pret) return <p>Chargement...</p>;
  if (!connecte) return <Login onSucces={connecter} />;
  return <Dashboard onDeconnexion={deconnecter} />;
}

function Login({ onSucces }) {
  const [login, setLogin] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function soumettre(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, motDePasse }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur || 'Connexion refusée.');
      } else {
        onSucces(data.token);
      }
    } catch (err) {
      setErreur('Impossible de joindre le serveur.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <main>
      <h1>Connexion du Maître du Jeu</h1>
      <form onSubmit={soumettre}>
        <div>
          <label>Identifiant</label>
          <input value={login} onChange={(e) => setLogin(e.target.value)} />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
        </div>
        <button type="submit" disabled={chargement}>
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      {erreur && <p className="erreur">{erreur}</p>}
    </main>
  );
}

function Dashboard({ onDeconnexion }) {
  const [pnj, setPnj] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [nom, setNom] = useState('');
  const [classe, setClasse] = useState(CLASSES[0]);
  const [niveau, setNiveau] = useState('');

  async function charger() {
    try {
      const res = await fetch(`${API}/api/pnj`);
      if (!res.ok) throw new Error();
      setPnj(await res.json());
      setErreur('');
    } catch (err) {
      setErreur('Impossible de charger les PNJ.');
    } finally {
      setChargement(false);
    }
  }

  // Appel non bloquant dès l'affichage de l'écran
  useEffect(() => {
    charger();
  }, []);

  async function creer(e) {
    e.preventDefault();
    setMessage('');
    setErreur('');
    try {
      const res = await fetch(`${API}/api/pnj`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${lireToken()}`, // la preuve d'identité
        },
        body: JSON.stringify({ nom, classe, niveau: Number(niveau) }),
      });
      const data = await res.json();

      if (res.status === 401) {
        alert('Session invalide ou expirée : veuillez vous reconnecter.');
        onDeconnexion();
        return;
      }
      if (!res.ok) {
        setErreur(data.erreur || 'La création a échoué.');
        return;
      }
      setMessage(data.message);
      setNom('');
      setClasse(CLASSES[0]);
      setNiveau('');
      charger();
    } catch (err) {
      alert("Le serveur est injoignable. Le PNJ n'a pas été créé.");
    }
  }

  return (
    <main>
      <h1>Tableau de bord du MJ</h1>
      <button onClick={onDeconnexion}>Se déconnecter</button>

      <h2>Nouveau PNJ</h2>
      <form onSubmit={creer}>
        <div>
          <label>Nom</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div>
          <label>Classe</label>
          <select value={classe} onChange={(e) => setClasse(e.target.value)}>
            {CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Niveau</label>
          <input type="number" min="1" value={niveau} onChange={(e) => setNiveau(e.target.value)} />
        </div>
        <button type="submit">Enrôler</button>
      </form>
      {message && <p className="succes">{message}</p>}
      {erreur && <p className="erreur">{erreur}</p>}

      <h2>Registre de la Taverne</h2>
      {chargement ? (
        <p>Chargement...</p>
      ) : pnj.length === 0 ? (
        <p>Aucun PNJ enregistré.</p>
      ) : (
        <div className="grille">
          {pnj.map((p) => (
            <div className="carte" key={p.id}>
              <strong>{p.nom}</strong>
              <p>Classe : {p.classe}</p>
              <p>Niveau : {p.niveau}</p>
              <p>Statut : {p.statut}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}