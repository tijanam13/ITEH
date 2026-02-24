## Veb aplikacija za kupovinu i gledanje kurseva šminkanja

Aplikacija je namenjena za prodaju i gledanje kurseva šminkanja. 
Ciljevi aplikacije su omogućavanje bezbednog i lakog pristupa kursevima, video lekcijama i dodatnim materijalima, kao i praćenje napretka. Pored toga važno je poboljšanje korisničkog iskustva kroz jednostavnu registraciju, pregled ponude, plaćanje i praćenje kupljenih kurseva, pristup lekcijama nezavisno od vremena i lokacije. Jedan od ciljeva je i obezbeđivanje mesta na tržištu kroz digitalizaciju edukacija.


## Funkcionalnosti aplikacije:

**Za klijente:**
   - Registracija i kreiranje korisničkog naloga
   - Prijava 
   - Pregled ponude kurseva: šminka, trajna šminka obrva i usana
   - Kupovina kurseva i online plaćanje
   - Gledanje video lekcija u okviru aplikacije
   - Pregled kupljenih kurseva i praćenje napretka
**Za edukatore:**
   - Dodavanje kurseva
   - Uređivanje kurseva
   - Brisanje kurseva
   - Pregled dostupnih kurseva
   - Postavljanje video lekcija, opisa, cena i materijala
   - Pregled prodaje kurseva i klijenata
**Za administratore:**
   - Mesečni izveštaji o broju klijenata
   - Statistika prodaje kurseva
   - Pregled klijenata i edukatora
   - Dodavanje novih korisnika


## Tehnologije

**Frontend:** Next.js, React, TailwindCSS 
**Backend:** Next.js
**Baza podataka:** PostgreSQL
**Plaćanje:** Stripe
**Docker:** multi-stage build za izgradnju i deployment
**Hosting/Deployment:** Docker Compose za lokalni razvoj, 


## Instalacija 

**1. Kloniranje repozitorijuma:**

git clone https://github.com/username/projekat-sminkanje.git OVDE NAS NAZIV
cd projekat-sminkanje

**2. Kreiranje .env fajla sa potrebnim varijablama:**

DATABASE_URL=postgres://user:password@db:5432/database
NODE_ENV=production
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000/api
STRIPE_SECRET_KEY=your_stripe_key
NASI PODACI 

**3. Pokretanje Docker-a:**

docker-compose up --build


**Aplikacija će biti dostupna na:**
http://localhost:3000


## Struktura projekta

/src - Kod (komponente, stranice, API rute)
/public - Slike, ikone
/drizzle.config. - Konfiguracija baze podataka
Dockerfile - Multi-stage build za Next.js aplikaciju
docker-compose.yml - Definisanje servisa: web, db, stripe


## Git grane

Za razvoj projekta korišćena je Git strategija sa glavnom, integracionom i feature granama. Svaka grana ima specifičnu ulogu u razvoju i omogućava paralelan rad na različitim funkcionalnostima.

main – stabilna, produkciona verzija projekta. Sadrži samo testiran i integrisan kod spreman za deployment.

develop – integraciona grana u koju se spajaju sve feature grane. Ova grana predstavlja radnu verziju projekta pre spajanja u main.

feature/docker – grana namenjena implementaciji Docker podrške. Sadrži: Dockerfile, dockerignore i docker-compose.yml.
Nakon testiranja i potvrde da kontejnerizacija funkcioniše, ova grana se spaja u develop.

feature/tests – grana za automatizovane testove. Sadrži folder __tests__ sa test fajlovima za backend i frontend funkcionalnosti. Testovi se pokreću kroz CI/CD pipeline i nakon validacije se spajaju u develop.
