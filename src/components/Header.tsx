import ribbitLogo from '../assets/ribbit-logo.svg';

export function Header() {
  return (
    <header className="app-header">
      <img
        src={ribbitLogo}
        alt="RIBBIT"
        className="app-logo"
      />

      <div className="subtitle" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        Proyecto en desarrollo por The Frog S.A.C.
      </div>
    </header>
  );
}
