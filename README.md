# Kontingentoverblik — Aalborg Volley

En enkelt side, der svarer på: **hvor mange penge står vi til at få i kontingent, og fra
hvilke hold?** Du lægger en eksport fra Holdsport ind, og siden regner.

Alt sker i browseren. Filen bliver læst lokalt og sendes ikke nogen steder — der er ingen
server, ingen database og ingen medlemsdata i dette repo. Derfor kan repoet godt være
offentligt.

## Sæt det op

1. Læg `index.html` og `app.js` i roden af et repo.
2. **Settings → Pages → Build and deployment → Deploy from a branch**, vælg `main` og `/ (root)`.
3. Efter et par minutter ligger siden på `https://<bruger>.github.io/<repo>/`.

Du kan også bare åbne `index.html` direkte fra din egen maskine — den virker uden server.

## De tre filer siden kan læse

| Fil | Hvor i Holdsport | Hvad den bruges til |
|---|---|---|
| **Medlemsliste** | Medlemmer → vælg alle hold → eksportér | Før opkrævningen findes. Regner sats × 2 rater − 5 % |
| **Opkrævning** | Økonomi → Oprettede betalinger → Mere → Eksportér til Excel | Når opkrævningen er oprettet. Bruger Holdsports egne beløb og *Fritaget* |
| **Fritagelsesliste** (valgfri) | — din egen CSV | Fritagelser indtil Holdsport har dem. Huskes i browseren |

Siden kender selv forskel på filerne: har den kolonnerne **Beløb** og **Status**, er det en
opkrævning; har den **Hold**, er det en medlemsliste; har den kun **navn** og **omfang**, er
det fritagelseslisten.

### Fritagelseslisten

```csv
navn,omfang
Luna Sparre,hel
Christopher Hedemand,delvis
Olivia Gaub,uafklaret
```

`hel` og `uafklaret` giver 0 kr., `delvis` giver det halve. Listen ligger kun i din egen
browser (localStorage) — **commit den ikke til repoet**, så bliver navnene offentlige.

Fra det øjeblik opkrævningen er oprettet i Holdsport, er Holdsports egen *Fritaget*-markering
facit. Så bruges listen kun til at sige til, hvis nogen på den ikke er sat som fritaget.

## Holdnavne

Holdnavnet matches på sin **indledning**, så alt efter selve holdet er ligegyldigt:

| I Holdsport | Bliver til |
|---|---|
| `Dame 1- Liga "spiller"` | Dame 1 |
| `Dame 1 - Volleyliga` | Dame 1 |
| `Herre 3- 2. Division "spiller"` | Herre 3 |
| `Mix` | Mix |
| `Fortsætter Mix` | Fortsætter Mix |
| `Herre U15/17 "spiller"` | HU15/17 |
| `Klubstab`, `Trænerhold`, `TRY-OUT`, `Inaktiv`, `Teen`, `Efterskole`, `Herre U20 (Ungdomsstævner)` | intet hold — ingen kontingent |

Kun de hold, der står i budgettet, giver indtægt. Alt andet — Teen, Efterskole, Klubstab,
try-out, stævnegrupper — tæller som «uden kontingent-hold».

**Mix-reglen:** er en spiller både på Mix (eller Fortsætter Mix) og et andet hold, betaler hun
på det andet hold. Mix giver ikke ekstra kontingent for en spiller, der i forvejen er på et
hold. Er mix hendes eneste hold, betaler hun mix-satsen.

**Ungdomsreglen:** er en spiller under 17 og på mere end ét hold, betaler hun ungdomsraten på
750 kr. pr. rate. Har hun et ungdomshold, lægges hun der; ellers bliver hun på sit dyreste hold,
men til ungdomsraten. Reglen kræver, at **Alder** eller **Fødselsdag** er med i eksporten —
mangler de, siger siden til.

Ellers tæller den højeste sats blandt spillerens hold. Grænserne står i `app.js` som
`UNGDOMSSATS`, `UNGDOMSALDER` og `ERMIX`.

## Når satser eller budget ændrer sig

Alt står i toppen af `app.js` i tabellen `HOLD`:

```js
// navn        kode   takst antal komp  budget
["Dame 1",     "D1",   1900, 14,   2,   46930],
```

`takst`, `antal` og `komp` er de samme tal som i budgetarkets fane **Kontingent status**, og
`budget` er linjens resultat: `(2 × antal × takst − komp × takst) × 0,95`. Ret tallene her, så
følger siden med. Husk også `BUDGET_IALT` øverst, hvis totalen ændrer sig.

Nye hold tilføjes i `HOLD` og — hvis navnet ikke allerede fanges — med et mønster i
`MOENSTRE`.

## Hvad siden siger til

- **Samme person med flere profiler** — ét navn, flere medlemsnumre, samme fødselsdato. Typisk
  en forældreoprettet profil ved siden af barnets. Holdsport opkræver pr. profil, så beløbet
  vises.
- **Samme navn, forskellig fødselsdato** — to forskellige personer, som siden ellers slår sammen.
- **Voksne på ungdomshold** — 18+ på et ungdomshold, typisk en forældre- eller trænerprofil.
- **Ungdomsraten brugt** — hvem der er sat ned til 750 kr. efter ungdomsreglen.
- **Ingen alder i filen** — Alder og Fødselsdag mangler, så ungdomsreglen ikke kunne bruges.
- **Hold uden spillere** — der er budgetteret med indtægt, men ingen står på holdet.
- **Hold uden sats** — et holdnavn der ikke kunne matches.

## Flyt spillere og se hvad det gør

Med medlemslisten indlæst har hver person en **Flyt til**-menu, og filtrerer du på et hold, kan
du flytte alle viste på én gang. Øverst står, hvor mange flytninger du har simuleret, og hvad de
gør ved beløbet. Det ændrer ikke noget i Holdsport — det er til at regne på, før du beslutter.

## Grundtal for 26/27

Budget 427.120 kr. fordelt på 248 spillere, opgjort som brutto minus 5 % gebyr og afgang.
Kilde: fanen **Kontingent status** i budgetarket *Overblik*.
