# Kontingentoverblik — Aalborg Volley

En enkelt side, der svarer på: **hvor mange penge står vi til at få i kontingent, og fra
hvilke hold?** Du lægger en eksport fra Holdsport ind, og siden regner.

Alt sker i browseren. Filen bliver læst lokalt og sendes ikke nogen steder — der er ingen
server, ingen database og ingen medlemsdata i dette repo. Derfor kan repoet godt være
offentligt.

## Opdatér til en ny version

Kommer der en ny udgave af `index.html` og `app.js`:

1. I repoet: **Add file → Upload files**.
2. Træk begge filer ind. GitHub overskriver dem, der hedder det samme.
3. **Commit changes**. Pages bygger om af sig selv på et minut eller to.

Læg altid **begge** filer op. `index.html` henter scriptet som `app.js?v=<dato>`, og det er
den dato, der fortæller browseren, at der er kommet noget nyt — ellers kan den finde på at
vise den gamle udgave. Retter du selv i `app.js`, så husk at skrive dagens dato i den
`?v=`-stump i `index.html`.

Ser du stadig det gamle, så genindlæs med <kbd>⌘⇧R</kbd> (Windows: <kbd>Ctrl⇧R</kbd>).

## Sæt det op

1. Læg `index.html` og `app.js` i roden af et repo.
2. **Settings → Pages → Build and deployment → Deploy from a branch**, vælg `main` og `/ (root)`.
3. Efter et par minutter ligger siden på `https://<bruger>.github.io/<repo>/`.

Du kan også bare åbne `index.html` direkte fra din egen maskine — den virker uden server.

## Hvad siden kan læse

| Liste | Hvor i Holdsport | Hvornår |
|---|---|---|
| **Fremtidige betalinger** | Økonomi → Fremtidige betalinger | Kontingentet er sat op, men ikke trukket. **Bedste kilde før trækket** |
| **Oprettede betalinger** | Økonomi → Oprettede betalinger → Mere → Eksportér til Excel | Trækket er dannet. Betalt og udestående kommer med |
| **Medlemsliste** | Medlemmer → vælg alle hold → eksportér | Kontingentet er slet ikke sat op endnu |
| **Fritagelsesliste** (valgfri) | — din egen CSV | Kun hvis du bruger medlemslisten |

Siden kender selv forskel: har filen kolonnen **Beløb**, er det en opkrævning; har den **Hold**,
er det en medlemsliste; har den kun **navn** og **omfang**, er det fritagelseslisten.

Navnet må gerne stå som ét **Navn**-felt eller som **Fornavn** og **Efternavn** hver for sig —
Klubmedlemmer-eksporten deler det op, opkrævningen gør ikke.

Er der ingen eksport-knap i visningen, kan du markere tabellen i Holdsport, kopiere den, og
sætte den ind i feltet **«Ingen eksport-knap? Indsæt tabellen i stedet»** på siden.

### Hvem bliver givet fri

**Beløbet er facit.** Står der ikke noget beløb på linjen, bliver der ikke opkrævet noget, og
personen tæller under «Givet fri». Status-kolonnen bruges ikke til at kende dem på — Holdsport
skriver den fritagelse på skiftende måder (`Fritaget`, `Frikontingent`, `exempt`, og i eksporten
fra Fremtidige betalinger som en ren talkode), så teksten kan ikke bruges.

Status bruges kun til det, beløbet ikke kan vise:

| Status | Hvad siden gør |
|---|---|
| Prøveperiode | Regnes ikke med, men vises i en egen advarsel — bliver de medlemmer, kommer beløbet oveni |
| Refunderet | Trækkes ud af det forventede |
| Betalt · Betalt kontant · Fritidspas | Tæller som betalt — først relevant efter trækket |

Hvad en fritaget linje *ville* have kostet, tages fra prisen i betalingstypens navn
(`Ungdom (750 kr.)`), ellers fra det beløb typen faktisk opkræves med, ellers fra holdets sats.

Med **Fremtidige betalinger** har Holdsport allerede fritagelserne, og fritagelseslisten er
overflødig. Har du lagt en ind, kan den ryddes med knappen ved siden af nøgletallene.

### Flere hold på én linje

Hold-kolonnen kan rumme flere hold adskilt af komma:

```
Dame 3 - 2. Division Træner,Herre 2 - 2. Division Spiller
```

Medlemslisten skriver den sidste adskillelse som « og » i stedet: `Dame U15, Dame U17 og
Kidsvolley`. Det er ikke entydigt, for et hold kan selv hedde `Trænerhold og Ungdomstrænere og
ungdomsudvalg`, så der deles kun på « og », hvis delingen giver flere kendte hold end den hele
streng — ellers får navnet lov at stå.

Linjen lægges på det hold, personen selv **spiller** på, og blandt dem det hold, hvis takst
passer med linjens beløb. Rollen (`Spiller`, `Træner`, `Assistent`, `Holdleder`, `Skadet`,
`Ungdomsleder`) står bagerst i navnet og er ellers ligegyldig.

Hver betaling står én gang pr. rate i eksporten. Beløbene lægges sammen inden for den valgte
rate, og «Fritaget» tælles pr. person, ikke pr. linje.

### Fritagelseslisten

```csv
navn,omfang
Luna Sparre,hel
Christopher Hedemand,delvis
Olivia Gaub,uafklaret
```

`hel` og `uafklaret` giver 0 kr., `delvis` giver det halve. Listen ligger kun i din egen
browser (localStorage) — **commit den ikke til repoet**, så bliver navnene offentlige.

Bruger du en af betalingslisterne, er Holdsports egen markering facit, og listen bruges kun til
at sige til, hvis nogen på den ikke er sat som fritaget dér.

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
| `Efterskole - DU17`, `Efterskole - HU17` | Efterskole — ét samlet hold |
| `Klubstab`, `Trænerhold`, `TRY-OUT`, `Inaktiv`, `Teen`, `Herre U20 (Ungdomsstævner)` | intet hold — ingen kontingent |

Alle efterskolehold lægges sammen til ét **Efterskole**-hold til 50 kr. pr. rate. Der er ikke
budgetteret med det, så det — og alt andet uden budget — ligger altid nederst i tabellen, uanset
hvad der sorteres på.

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

## Personlisten

Navn, hold, hvad de betaler på den valgte rate, hvad de er givet fri for, og en status. Søg
efter navn eller hold, eller filtrér på *Bliver opkrævet*, *Givet fri*, *Opkrævet for flere hold*,
*Prøveperiode* — og efter trækket *Mangler betaling* og *Har betalt*. Tælleren nederst viser,
hvad de viste personer løber op i.

## Hvad siden siger til

- **Givet fri** — hvem der står uden beløb, og hvad holdet ellers ville have kostet.
- **Opkrævet for mere end ét hold** — klubbens regel er, at man betaler på ét hold. Siden viser,
  hvor meget der ville falde væk, hvis kun det dyreste blev opkrævet.
- **Hold uden nogen i filen** — der er budgetteret med indtægt, men holdet står ikke på en
  eneste linje. Typisk fordi betalingen ikke er sat op endnu.

- **Samme person med flere profiler** — ét navn, flere medlemsnumre, samme fødselsdato. Typisk
  en forældreoprettet profil ved siden af barnets. Holdsport opkræver pr. profil, så beløbet
  vises.
- **Samme navn, forskellig fødselsdato** — to forskellige personer, som siden ellers slår sammen.
- **Voksne på ungdomshold** — 18+ på et ungdomshold, typisk en forældre- eller trænerprofil.
- **Ungdomsraten brugt** — hvem der er sat ned til 750 kr. efter ungdomsreglen.
- **Ingen alder i filen** — Alder og Fødselsdag mangler, så ungdomsreglen ikke kunne bruges.
- **Hold uden spillere** — der er budgetteret med indtægt, men ingen står på holdet.
- **Hold uden sats** — et holdnavn der ikke kunne matches. Beløbene tæller stadig med i totalen;
  det er sådan fx efterskolekontingentet på 50 kr. dukker op uden for budgettet.

## Rater

Kontingentet opkræves to gange — efterår og forår — og hver opkrævning står som sin egen linje
i eksporten. Øverst på siden vælger du, hvad tallene skal dække:

| Valg | Hvad du ser |
|---|---|
| **1. rate** | Kun den opkrævning, der trækkes i efteråret. Siden åbner her |
| **2. rate** | Kun forårsopkrævningen |
| **Hele sæsonen** | Begge lagt sammen — det budgettet dækker |

Raten udledes af **Trækdato** (og ellers af betalingsfristen). Efternølere med en skæv dato
lægges i den halvsæson, de falder i, så en enkelt aprilbetaling ikke bliver til sin egen rate.

Vælger du én rate, er budgettet **halvdelen** af sæsonbudgettet, fordi der opkræves to gange.
Valget huskes i din browser.

## Sortering

Klik på en kolonneoverskrift for at sortere — både holdtabellen og personlisten. Klik igen for
at vende retningen. Tal sorteres højest først, navne A–Å. Sorteringen huskes.

Kolonnen **Af budget** siger, hvor stor en del af budgettet holdet lander på: 97 % er lige under,
211 % er dobbelt så meget. Sortér på den for at se, hvilke hold der trækker mest fra og til.

## Når raten er trukket

Er der betalinger med status *Betalt* i filen, skifter siden til opfølgning:

- Nøgletallet **Mangler betaling** viser beløbet og hvor mange der står tilbage.
- Holdtabellen bytter «Givet fri» ud med **Betalt** og **Mangler**.
- Udfoldningen pr. hold får en rød liste: **Mangler betaling**, med navn og beløb.
- Filteret får **Mangler betaling** og **Har betalt**.

## Juniorer på seniorhold

Siden kan fange spillere, der er **født i 2010 eller senere**, står på et seniorhold og **ikke**
er tilknyttet et ungdomshold. De betaler seniorsats og hører ikke med i ungdomsafdelingen —
typisk fordi de er glemt på DU- eller HU-holdet.

Det kræver fødselsår, og dem har opkrævningen ikke. Træk **Klubmedlemmer**-eksporten ind én
gang; fødselsårene bliver gemt i din browser og brugt, hver gang du bagefter lægger en opkrævning
ind. Kildelinjen viser, hvor mange navne der er dækket, og advarslen siger til, hvis nogen mangler
et fødselsår og derfor ikke er tjekket.

Er fødselsåret nyere end for tre år siden, kan det ikke passe — så er feltet aldrig blevet udfyldt
i Holdsport. Siden holder dem uden for juniortjekket og lister dem under **Tjek fødselsdatoen**,
så de kan rettes.

Årgangen står i `app.js` som `UNGDOMSAARGANG` — sæt den op med ét, når sæsonen skifter.

## Regnestykket bag hvert hold

Klik på en holdrække (eller tryk Enter, når den er i fokus), så folder den ud og viser, hvordan
tallet er kommet i stand:

- **Sådan ser det ud i Holdsport** — hvor mange der betaler hvilket beløb, lagt sammen til det
  forventede, og hvad de fritagne ville have givet. Bruger du medlemslisten i stedet, hedder
  gruppen *Sådan ligger holdet nu* og viser satsen gange rater, minus 5 %.
- **Sådan er holdet budgetteret** — budgetarkets egen linje, regnet ud trin for trin:
  `2 rater × antal × takst − komp × takst`, minus 5 % til gebyr og afgang.
- **Mod budgettet** — forskellen mellem de to.
- **Tabellen** — alle på holdet med navn, hvad de opkræves, hvad de har betalt, hvad de er
  givet fri for, og en status. De der mangler betaling ligger øverst.

Flere hold kan stå åbne på én gang, og udfoldningen bliver stående, når du simulerer flytninger.
Den lukker, når du lægger en ny fil ind.

## Flyt spillere og se hvad det gør

Med medlemslisten indlæst har hver person en **Flyt til**-menu, og filtrerer du på et hold, kan
du flytte alle viste på én gang. Øverst står, hvor mange flytninger du har simuleret, og hvad de
gør ved beløbet. Det ændrer ikke noget i Holdsport — det er til at regne på, før du beslutter.

## Grundtal for 26/27

Budget 427.120 kr. fordelt på 248 spillere, opgjort som brutto minus 5 % gebyr og afgang.
Kilde: fanen **Kontingent status** i budgetarket *Overblik*.
