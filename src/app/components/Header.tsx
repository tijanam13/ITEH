"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const uloga = user?.uloga;

  return (
    <header className="site-header">
      <nav className="site-nav">
        <Link href="/" className="nav-logo">
          <Image src="/logo.png" alt="Logo" width={70} height={70} />
        </Link>

        <div className="nav-links">

          {!user && (
            <>
              <Link href="/login" className="nav-link">Prijava</Link>
              <Link href="/register" className="nav-link">Registracija</Link>
            </>
          )}

          {uloga === "KLIJENT" && (
            <>
              <Link href="/stranice/svi-kursevi" className="nav-link">Kursevi</Link>
              <Link href="/stranice/kupljeni-kursevi" className="nav-link">Kupljeni kursevi</Link>
              <Link href="/stranice/kontakt" className="nav-link">Kontakt</Link>

              <Link href="/stranice/korpa" className="nav-link">
                <Image src="/korpa3.png" alt="Korpa" width={30} height={40} />
              </Link>

              <button onClick={logout} className="nav-link logout-btn">Logout</button>
            </>
          )}

          {uloga === "EDUKATOR" && (
            <>
              <Link href="/stranice/pregled-klijenata" className="nav-link">Klijenti</Link>
              <Link href="/stranice/dodaj-kurs" className="nav-link">Dodaj kurs</Link>
              <Link href="/stranice/obrisi-kurs" className="nav-link">Obriši kurs</Link>
              <Link href="/stranice/promeni-kurs" className="nav-link">Promeni kurs</Link>
              <Link href="/stranice/svi-kursevi" className="nav-link">Kursevi</Link>
              <Link href="/stranice/pregled-prodaje-kurseva" className="nav-link">Pregled prodaje</Link>

              <button onClick={logout} className="nav-link logout-btn">Logout</button>
            </>
          )}

          {uloga === "ADMIN" && (
            <>
              <Link href="/stranice/administratori/admin" className="nav-link">Admin panel</Link>
              <Link href="/stranice/administratori/klijenti-edukatori" className="nav-link">Klijenti i edukatori</Link>
              <button onClick={logout} className="nav-link logout-btn">Logout</button>
            </>
          )}
          <Link href="/stranice/o-meni" className="nav-link">O meni</Link>

        </div>
      </nav>
    </header>
  );
}