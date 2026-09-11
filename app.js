/* Kontingentoverblik — Aalborg Volley 2026/27
   Alt regnes i browseren. Ingen data forlader siden. */
(function () {
  "use strict";

  // ------------------------------------------------------------ satser
  // Kilde: fanen «Kontingent status» i budgetarket Overblik.
  // budget = (2 rater × antal × takst − komp × takst) × 0,95
  var GEBYR = 0.05, RATER = 2, BUDGET_IALT = 427120;
  var HOLD = [
    // navn                     kode      takst antal komp  budget
    ["Dame 1",                  "D1",      1900, 14,   2,   46930],
    ["Dame 2",                  "D2",      1700, 14,   3,   40375],
    ["Dame 3",                  "D3",      1200, 15,   4,   29640],
    ["Dame 4",                  "D4",       950, 12,   0,   21660],
    ["Dame 5 - Old girls",      "D5",       500,  8,   0,    7600],
    ["Herre 1",                 "H1",      1700, 15,   5,   40375],
    ["Herre 2",                 "H2",      1200, 14,   4,   27360],
    ["Herre 3",                 "H3",      1200, 17,   7,   30780],
    ["Herre 4",                 "H4",       950, 14,   1,   24367.5],
    ["Herre 5 - Old boys",      "H5",       750, 12,   1,   16387.5],
    ["Mix",                     "MIX",      800, 16,   0,   24320],
    ["Fortsætter Mix",          "FMIX",     800, 13,   1,   19000],
    ["DU 15",                   "DU15",     750, 22,   0,   31350],
    ["DU 17",                   "DU17",     750, 26,   0,   37050],
    ["HU15/17",                 "HU1517",   750, 11,   1,   14962.5],
    ["Kids",                    "KIDS",     350, 25,   5,   14962.5],
    ["Ramasjang",               "RAMA",       0,  0,   0,       0]
  ];

  // Holdnavnet i Holdsport matches på sin INDLEDNING, så tilføjelser som
  // «- Liga spiller», «- 2. Division» eller «(Ungdomsstævner)» ikke spænder ben.
  var MOENSTRE = [
    [/^fort?s(ae)?tter\s*mix/, "FMIX"],
    [/^fors(ae)?tter\s*mix/,   "FMIX"],
    [/^begynder\s*mix/,        "MIX"],
    [/^mix\b/,                 "MIX"],
    [/^dame\s*u\s*15/,         "DU15"],
    [/^dame\s*u\s*17/,         "DU17"],
    [/^du\s*15/,               "DU15"],
    [/^du\s*17/,               "DU17"],
    [/^herre\s*u\s*15/,        "HU1517"],
    [/^herre\s*u\s*17/,        "HU1517"],
    [/^hu\s*15/,               "HU1517"],
    [/^kids/,                  "KIDS"],
    [/^ramasjang/,             "RAMA"],
    [/^dame\s*([1-5])\b/,      "D$1"],
    [/^herre\s*([1-5])\b/,     "H$1"],
    [/^d\s*([1-5])\b/,         "D$1"],
    [/^h\s*([1-5])\b/,         "H$1"]
  ];

  var UNGDOM = {DU15:1, DU17:1, HU1517:1, KIDS:1};
  // Er man under 17 og på mere end ét hold, betaler man ungdomsraten.
  var UNGDOMSSATS = 750, UNGDOMSALDER = 17;
  // Mix giver ikke ekstra kontingent for en spiller, der også er på et andet hold.
  var ERMIX = {MIX:1, FMIX:1};
  var UD = "__ud__";

  // ------------------------------------------------------------ småting
  function norm(s){
    return String(s == null ? "" : s).toLowerCase()
      .replace(/æ/g,"ae").replace(/ø/g,"oe").replace(/å/g,"aa")
      .normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9]+/g," ").trim();
  }
  function kr(n){ return Math.round(n).toLocaleString("da-DK") + " kr."; }
  function tal(n){ return Math.round(n).toLocaleString("da-DK"); }
  function fortegn(n){ return (n > 0 ? "+" : n < 0 ? "−" : "") + tal(Math.abs(n)); }
  function esc(s){ return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function el(id){ return document.getElementById(id); }
  function rensHold(v){
    var t = String(v == null ? "" : v).replace(/\(\s*slettet[^)]*\)/gi," ").replace(/\s+/g," ").trim();
    var m = t.match(/^\(([^()]+)\)$/);
    return (m ? m[1] : t).trim();
  }
  function punktliste(dele, loft){
    loft = loft || 8;
    return '<ul><li>' + dele.slice(0, loft).join('</li><li>') + '</li>'
      + (dele.length > loft ? '<li>… og ' + (dele.length - loft) + ' mere</li>' : '') + '</ul>';
  }

  var EFTERKODE = {};
  HOLD.forEach(function(h){
    EFTERKODE[h[1]] = {navn:h[0], kode:h[1], takst:h[2], antal:h[3], komp:h[4], budget:h[5]};
  });

  function slaaOp(v){
    var n = norm(rensHold(v));
    if (!n) return null;
    for (var i = 0; i < MOENSTRE.length; i++){
      var m = n.match(MOENSTRE[i][0]);
      if (m){
        var kode = MOENSTRE[i][1].replace("$1", m[1] || "");
        if (EFTERKODE[kode]) return EFTERKODE[kode];
      }
    }
    return null;
  }

  // ------------------------------------------------------------ læsning
  var KOL = {
    navn:["Navn","Fulde navn","Medlem","Medlemsnavn"],
    hold:["Hold","Holdnavn"],
    afdeling:["Hold/afdeling","Afdeling"],
    betaling:["Betaling","Betalingstype"],
    belob:["Beløb","Belob","Beloeb","Pris","Amount"],
    status:["Status"],
    frist:["Betalingsfrist","Frist","Trækdato"],
    rolle:["Rolle"],
    alder:["Alder"],
    foedsel:["Fødselsdag","Fødselsdato","Født","Birthday"],
    nr:["Medlemsnr","Medlemsnummer","Nr","Id"],
    email:["E-mail","Email","Mail"],
    omfang:["Omfang","Fritagelse"]
  };
  function findKolonner(hdr){
    var n = hdr.map(norm), ud = {};
    Object.keys(KOL).forEach(function(k){
      for (var i = 0; i < KOL[k].length; i++){
        var j = n.indexOf(norm(KOL[k][i]));
        if (j !== -1){ ud[k] = j; return; }
      }
    });
    return ud;
  }
  function celle(row, i){ return i == null ? "" : String(row[i] == null ? "" : row[i]).trim(); }
  function tilTal(v){
    if (typeof v === "number") return v;
    var s = String(v == null ? "" : v).replace(/[^\d,.-]/g,"");
    if (s.indexOf(",") !== -1) s = s.replace(/\./g,"").replace(",",".");
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }
  function tilDato(v){
    if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0,10);
    var s = String(v == null ? "" : v).trim(), m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[0];
    m = s.match(/^(\d{2})[-./](\d{2})[-./](\d{2,4})$/);
    if (m) return (m[3].length === 2 ? "20" + m[3] : m[3]) + "-" + m[2] + "-" + m[1];
    return "";
  }
  function alderAf(alder, foedsel){
    var n = parseInt(String(alder).replace(/\D/g,""), 10);
    if (!isNaN(n) && n > 0 && n < 120) return n;
    var d = tilDato(foedsel); if (!d) return null;
    var f = new Date(d), nu = new Date(); if (isNaN(f)) return null;
    var aar = nu.getFullYear() - f.getFullYear(), m = nu.getMonth() - f.getMonth();
    if (m < 0 || (m === 0 && nu.getDate() < f.getDate())) aar--;
    return (aar >= 0 && aar < 120) ? aar : null;
  }
  // Beløbet er facit. Står der ikke noget beløb på linjen, bliver der ikke
  // opkrævet noget — og så er personen givet fri, uanset hvad der står i
  // Status-kolonnen. Holdsport skriver den fritagelse på skiftende måder
  // («Fritaget», «Frikontingent», «exempt», og i eksporten en ren talkode),
  // så teksten kan ikke bruges til at kende dem på. Statussen bruges kun til
  // det, beløbet ikke kan vise: refunderet og prøveperiode.
  function klassificer(status, belob, harBelob){
    var s = norm(status), b = +belob;
    if (s.indexOf("refunder") !== -1) return "refunderet";
    if (s.indexOf("proeve") === 0) return "proeve";
    if (harBelob && !(b > 0)) return "fritaget";
    if (s.indexOf("fritaget") === 0) return "fritaget";
    if (s.indexOf("frikontingent") === 0) return "fritaget";
    if (s === "exempt" || s === "free") return "fritaget";
    if (s.indexOf("fritidspas") !== -1) return "fritidspas";
    if (s.indexOf("betalt") === 0) return "betalt";
    return "udest";
  }

  // Prisen står tit i betalingstypens navn: «Ungdom (750 kr.)». Den er det
  // sikreste bud på, hvad en fritaget linje ville have kostet.
  function prisAf(navn){
    var m = String(navn == null ? "" : navn).match(/(\d[\d.\s]*)\s*kr/i);
    return m ? tilTal(m[1]) : 0;
  }

  // Hold-kolonnen kan rumme flere hold adskilt af komma, fx
  // «Dame 3 - 2. Division Træner,Herre 2 - 2. Division Spiller».
  function delHold(v){
    return String(v == null ? "" : v).split(/\s*[,;]\s*|\s\/\s/)
      .map(rensHold).filter(function(x){ return x; });
  }
  var SPILLERROLLE = /(spiller|medlem)\s*$/i;
  // Vælg det hold, linjen hører til: helst det, personen selv spiller på, og
  // blandt dem det, hvis takst passer med linjens beløb.
  function vaelgHold(holdstr, pris){
    var dele = delHold(holdstr);
    if (!dele.length) return null;
    var kand = dele.map(function(t){ var o = slaaOp(t); return o ? {t:t, o:o} : null; })
                   .filter(Boolean);
    if (!kand.length) return {t:dele[0], o:null};
    var spillere = kand.filter(function(x){ return SPILLERROLLE.test(x.t); });
    var felt = spillere.length ? spillere : kand;
    if (pris > 0){
      for (var i = 0; i < felt.length; i++) if (felt[i].o.takst === pris) return felt[i];
    }
    return felt[0];
  }

  function laes(raekker, filnavn){
    var start = -1;
    for (var i = 0; i < Math.min(raekker.length, 25); i++){
      if (raekker[i] && norm(raekker[i].join(" ")).split(" ").indexOf("navn") !== -1){ start = i; break; }
    }
    if (start === -1) throw new Error("Kunne ikke finde en overskriftsrække med en Navn-kolonne.");
    var k = findKolonner(raekker[start]);
    if (k.navn == null) throw new Error("Filen mangler kolonnen Navn.");
    var rows = raekker.slice(start + 1).filter(function(r){ return r && celle(r, k.navn); });
    if (!rows.length) throw new Error("Der er ingen datarækker i filen.");

    // Beløb alene gør det til en opkrævning — Status er ikke længere nødvendig.
    var harBetaling = (k.belob != null);
    var harHold = (k.hold != null || k.afdeling != null);

    if (!harBetaling && !harHold && k.omfang != null) return {slags:"fritagelser",
      liste: rows.map(function(r){ return {navn: celle(r,k.navn), omfang: norm(celle(r,k.omfang)) || "hel"}; })};
    if (!harBetaling && !harHold) return {slags:"fritagelser",
      liste: rows.map(function(r){ return {navn: celle(r,k.navn), omfang:"hel"}; })};

    if (harBetaling) return {slags:"data", data: beregnBetalinger(rows.map(function(r){
      return {navn:celle(r,k.navn), hold:celle(r,k.hold), afdeling:celle(r,k.afdeling),
              betaling:celle(r,k.betaling), belob:tilTal(r[k.belob]),
              status:celle(r,k.status), frist:tilDato(r[k.frist])};
    }), filnavn)};

    return {slags:"data", data: samlHold(rows.map(function(r){
      return {navn:celle(r,k.navn), hold:celle(r,k.hold) || celle(r,k.afdeling),
              rolle:celle(r,k.rolle),
              alder:alderAf(celle(r,k.alder), k.foedsel != null ? r[k.foedsel] : ""),
              nr:celle(r,k.nr), foedsel:tilDato(k.foedsel != null ? r[k.foedsel] : ""),
              email:celle(r,k.email)};
    }), filnavn)};
  }

  // ------------------------------------------------------------ holdlister
  function samlHold(linjer, filnavn){
    var folk = {};
    linjer.forEach(function(l){
      var nk = norm(l.navn); if (!nk) return;
      var p = folk[nk] || (folk[nk] = {n:l.navn, h:[], a:null, ids:{}, fdato:{}, mails:{}});
      delHold(l.hold).forEach(function(h){ if (p.h.indexOf(h) === -1) p.h.push(h); });
      if (p.a == null && l.alder != null) p.a = l.alder;
      if (l.nr) p.ids[l.nr] = 1;
      if (l.foedsel) p.fdato[l.foedsel] = 1;
      String(l.email || "").split(/[\s,;]+/).forEach(function(m){
        if (m.indexOf("@") !== -1) p.mails[m.toLowerCase()] = 1;
      });
    });
    return {v:3, tilstand:"hold", filnavn:filnavn, opdateret:new Date().toISOString(),
            linjer:linjer.length, sim:{},
            raa: Object.keys(folk).map(function(k){
              var p = folk[k];
              return {n:p.n, h:p.h, a:p.a, ids:Object.keys(p.ids),
                      fd:Object.keys(p.fdato), m:Object.keys(p.mails)};
            })};
  }

  function beregnHold(d, sim, fri){
    sim = sim || {}; fri = fri || {};
    var hold = {}, personer = [], friKr = 0, friAntal = 0, udenHold = 0, brutto = 0;
    HOLD.forEach(function(h){ if (h[2] > 0) hold[h[1]] = {
      navn:h[0], kode:h[1], takst:h[2], budget:h[5], forventet:0, fritaget:0, personer:0}; });

    d.raa.forEach(function(p){
      var nk = norm(p.n);
      var muligheder = (p.h || []).map(slaaOp).filter(function(o){ return o && o.takst > 0; });
      // Mix-reglen: er spilleren på et hold uden for mix, betaler hun dér — mix
      // giver ikke ekstra kontingent. Kun mix-spillere uden andet hold betaler mix.
      var ikkeMix = muligheder.filter(function(o){ return !ERMIX[o.kode]; });
      // Ungdomsreglen: under 17 og på mere end ét hold betaler ungdomsraten.
      // Spilleren lægges på sit ungdomshold, hvis hun har et.
      var ungdomsrate = (p.a != null && p.a < UNGDOMSALDER && muligheder.length > 1);
      var ungdomshold = ungdomsrate ? muligheder.filter(function(o){ return UNGDOM[o.kode]; }) : [];
      var felt = ungdomshold.length ? ungdomshold : (ikkeMix.length ? ikkeMix : muligheder);
      var standard = null;
      felt.forEach(function(o){ if (!standard || o.takst > standard.takst) standard = o; });
      var valgt = Object.prototype.hasOwnProperty.call(sim, nk) ? sim[nk]
                : (standard ? standard.kode : null);
      var aendret = Object.prototype.hasOwnProperty.call(sim, nk)
                 && valgt !== (standard ? standard.kode : null);
      var o = valgt === UD ? null : (EFTERKODE[valgt] || null);

      var omfang = fri[nk] || "";
      var takst = o ? (ungdomsrate ? Math.min(UNGDOMSSATS, o.takst) : o.takst) : 0;
      var nedsat = !!(o && ungdomsrate && takst < o.takst);
      var fuld = takst * RATER;
      var forventet = omfang === "hel" || omfang === "uafklaret" ? 0
                    : omfang === "delvis" ? fuld / 2 : fuld;

      if (o){
        var b = hold[o.kode];
        if (b){ b.forventet += forventet; b.personer++; if (omfang) b.fritaget++; }
        brutto += fuld;
      } else udenHold++;
      if (omfang && o){ friKr += fuld - forventet; friAntal++; }

      personer.push({
        n:p.n, nk:nk, alder:(p.a == null ? null : p.a),
        profiler:(p.ids || []).length, fdatoer:(p.fd || []).length,
        fdato:(p.fd || []).join(", "), mails:(p.m || []),
        kode:o ? o.kode : (valgt === UD ? UD : null),
        h:o ? o.navn : (valgt === UD ? "Meldt ud" : "Uden kontingent-hold"),
        fra:standard ? standard.navn : "",
        ogsaa:muligheder.filter(function(m){ return !o || m.kode !== o.kode; })
                        .map(function(m){ return m.navn; }).join("; "),
        f:forventet, fuld:fuld, fri:omfang, aendret:aendret, flere:muligheder.length > 1,
        takst:takst, nedsat:nedsat
      });
    });

    personer.sort(function(a,b){ return b.f - a.f || a.n.localeCompare(b.n,"da"); });
    var liste = Object.keys(hold).map(function(k){ return hold[k]; });
    var sum = 0;
    liste.forEach(function(h){ h.netto = h.forventet * (1 - GEBYR); sum += h.forventet; });
    liste.sort(function(a,b){ return b.netto - a.netto || b.budget - a.budget; });

    return {tilstand:"hold", filnavn:d.filnavn, opdateret:d.opdateret, linjer:d.linjer,
            brutto:sum, forventet:sum * (1 - GEBYR), budget:BUDGET_IALT,
            fritaget_kr:friKr, fritaget_personer:friAntal, uden_hold:udenHold,
            hold:liste, personer:personer};
  }

  // Fritagelseslinjerne kommer én gang pr. rate. Læg dem sammen pr. person og hold,
  // så listen viser hvad hver person er sluppet for på hele sæsonen.
  function samlFri(raa){
    var m = {};
    raa.forEach(function(x){
      var k = norm(x.n) + "|" + norm(x.h);
      if (m[k]) m[k].b += x.b; else m[k] = {n:x.n, h:x.h, b:x.b};
    });
    return Object.keys(m).map(function(k){ return m[k]; })
      .sort(function(a,b){ return b.b - a.b || a.n.localeCompare(b.n,"da"); });
  }

  // ------------------------------------------------------------ opkrævning
  function beregnBetalinger(linjer, filnavn){
    var folk = {}, hold = {}, frister = {}, refunderet = 0, friKr = 0, proeve = [], fri = [];
    var harBelob = linjer.some(function(l){ return l.belob > 0; });
    var sats = {};
    linjer.forEach(function(l){
      if (!l.belob) return;
      var b = sats[l.betaling] || (sats[l.betaling] = {});
      b[l.belob] = (b[l.belob] || 0) + 1;
    });
    // Dækker én betalingstype flere takster (fx halv pris til trænere), kan typens
    // hyppigste beløb ikke stå alene — så vejer prisen i typens navn tungest.
    var spredt = {};
    Object.keys(sats).forEach(function(k){
      var bedst = 0, flest = -1, n = Object.keys(sats[k]).length;
      Object.keys(sats[k]).forEach(function(v){
        var c = sats[k][v];
        if (c > flest || (c === flest && +v > bedst)){ flest = c; bedst = +v; }
      });
      sats[k] = bedst; spredt[k] = n > 1;
    });

    linjer.forEach(function(l){
      var pris = prisAf(l.betaling);
      var valg = vaelgHold(l.hold, pris) || vaelgHold(l.afdeling, pris);
      var slag = (valg && valg.o) || slaaOp(l.betaling);
      var holdnavn = slag ? slag.navn
        : ((valg && valg.t) || rensHold(l.afdeling) || l.betaling || "Uden hold");
      var noegle = slag ? slag.kode : "?" + norm(holdnavn);
      var art = klassificer(l.status, l.belob, harBelob);
      var med = (art !== "fritaget" && art !== "refunderet" && art !== "proeve") ? l.belob : 0;
      var betalt = (art === "betalt" || art === "fritidspas") ? l.belob : 0;
      if (l.frist) frister[l.frist.slice(0,7)] = 1;
      if (art === "refunderet") refunderet += l.belob;

      var h = hold[noegle] || (hold[noegle] = {navn:holdnavn, kode:slag?slag.kode:null,
        takst:slag?slag.takst:0, budget:slag?slag.budget:0,
        forventet:0, betalt:0, fritaget:0, frikr:0, folk:{}, frifolk:{}});
      h.forventet += med; h.betalt += betalt; h.folk[norm(l.navn)] = 1;

      var nk = norm(l.navn);
      var p = folk[nk] || (folk[nk] = {n:l.navn, hold:{}, betalinger:{}, l:0, f:0, be:0, u:0,
                                       fr:0, pr:0, frikr:0, pr_bet:{}});
      p.l++; p.f += med; p.be += betalt;
      if (med) p.pr_bet[l.betaling] = (p.pr_bet[l.betaling] || 0) + med;
      if (art === "fritaget"){
        // Hvad linjen ville have kostet: prisen i betalingstypens navn, ellers det
        // beløb typen faktisk opkræves med, ellers holdets egen takst.
        var vaerd = l.belob || pris
                 || (spredt[l.betaling] && slag ? slag.takst : 0)
                 || sats[l.betaling]
                 || (slag ? slag.takst : 0);
        p.fr++; p.frikr += vaerd; friKr += vaerd;
        h.fritaget++; h.frikr += vaerd; h.frifolk[nk] = 1;
        fri.push({n:l.navn, h:holdnavn, b:vaerd});
      }
      if (art === "proeve"){ p.pr++; proeve.push({n:l.navn, h:holdnavn, b:l.belob}); }
      if (art === "udest") p.u += l.belob;
      if (holdnavn) p.hold[holdnavn] = 1;
      if (l.betaling) p.betalinger[l.betaling] = 1;
    });

    // Én person kan optræde på flere linjer for samme hold (én pr. rate), så
    // «fritaget» tælles pr. person, ikke pr. linje.
    Object.keys(hold).forEach(function(k){
      hold[k].fritaget = Object.keys(hold[k].frifolk).length;
    });

    var personer = Object.keys(folk).map(function(k){
      var p = folk[k];
      return {n:p.n, nk:k, h:Object.keys(p.hold).join("; "), b:Object.keys(p.betalinger).join("; "),
              l:p.l, f:Math.round(p.f), be:Math.round(p.be), u:Math.round(p.u), fr:p.fr, pr:p.pr,
              frikr:Math.round(p.frikr),
              hoejest:Math.round(Math.max.apply(null, [0].concat(
                Object.keys(p.pr_bet).map(function(k){ return p.pr_bet[k]; })))),
              flere:Object.keys(p.pr_bet).length > 1};
    }).sort(function(a,b){ return b.f - a.f || a.n.localeCompare(b.n,"da"); });

    var liste = Object.keys(hold).map(function(k){
      var h = hold[k];
      return {navn:h.navn, kode:h.kode, takst:h.takst, budget:h.budget,
              forventet:Math.round(h.forventet), betalt:Math.round(h.betalt),
              fritaget:h.fritaget, frikr:Math.round(h.frikr),
              personer:Object.keys(h.folk).length};
    }).sort(function(a,b){ return b.forventet - a.forventet; });

    var sumF = 0, sumB = 0, sumBud = 0, set = {}, friAntal = 0;
    liste.forEach(function(h){
      sumF += h.forventet; sumB += h.betalt;
      if (h.kode && !set[h.kode]){ set[h.kode] = 1; sumBud += h.budget; }
    });
    personer.forEach(function(p){ if (p.fr) friAntal++; });

    return {v:3, tilstand:"betalinger", filnavn:filnavn, opdateret:new Date().toISOString(),
            linjer:linjer.length, frister:Object.keys(frister).sort(),
            forventet:Math.round(sumF), betalt:Math.round(sumB),
            udestaaende:Math.round(sumF - sumB), budget:BUDGET_IALT, budget_ramt:sumBud,
            refunderet:Math.round(refunderet), fritaget_kr:Math.round(friKr),
            fritaget_personer:friAntal, proeve:proeve, fri:samlFri(fri),
            sendt: linjer.some(function(l){ return klassificer(l.status, l.belob, harBelob) === "betalt"; }),
            pr_person:personer.length ? linjer.length/personer.length : 0,
            hold:liste, personer:personer};
  }

  // ------------------------------------------------------------ lager
  var DB = null, NOEGLE = "aav.kontingent";
  function gemLokalt(n, v){ try { localStorage.setItem(NOEGLE + "." + n, JSON.stringify(v)); } catch (e) {} }
  function hentLokalt(n){
    try { var s = localStorage.getItem(NOEGLE + "." + n); return s ? JSON.parse(s) : null; }
    catch (e) { return null; }
  }
  function gem(){
    if (GEMT){ gemLokalt("data", GEMT);
      if (DB) try { DB.doc("kontingent/seneste").set(GEMT).catch(function(){}); } catch (e) {} }
    gemLokalt("fritagelser", FRITAG);
  }

  // ------------------------------------------------------------ visning
  var GEMT = null, VIST = null, BASIS = null, FRITAG = hentLokalt("fritagelser") || {};

  function genberegn(){
    if (!GEMT) return;
    if (GEMT.tilstand === "hold"){
      BASIS = beregnHold(GEMT, {}, FRITAG);
      VIST = beregnHold(GEMT, GEMT.sim || {}, FRITAG);
    } else { BASIS = GEMT; VIST = GEMT; }
    tegn();
  }

  function saetFig(id, o, v, u){ el(id+"-k").textContent = o; el(id).textContent = v;
    el(id+"-s").textContent = u || ""; }

  function tegn(){
    var d = VIST, erHold = d.tilstand === "hold";
    el("tom").hidden = true; el("data").hidden = false;

    if (erHold){
      var mod = d.forventet - d.budget;
      saetFig("f1","Forventet", kr(d.forventet),
        "Brutto " + kr(d.brutto) + " minus 5 % gebyr og afgang");
      saetFig("f2","Mod budget", fortegn(mod) + " kr.", "Budget " + kr(d.budget));
      el("f2").parentNode.className = "fig " + (mod < 0 ? "fri" : "god");
      saetFig("f3","Spillere", tal(d.personer.filter(function(p){ return p.f > 0; }).length),
        d.uden_hold + " uden kontingent-hold");
      saetFig("f4","Givet fri", kr(d.fritaget_kr),
        d.fritaget_personer + " på fritagelseslisten");
    } else {
      var betalere = d.personer.filter(function(p){ return p.f > 0; }).length;
      saetFig("f1","Forventet i alt", kr(d.forventet),
        betalere + " betaler · " + d.personer.length + " på listen");
      var mod = d.forventet - d.budget;
      if (d.sendt){
        saetFig("f2","Allerede betalt", kr(d.betalt),
          d.forventet ? Math.round(d.betalt/d.forventet*100) + " % af det forventede" : "");
        el("f2").parentNode.className = "fig god";
        var mangler = d.personer.filter(function(p){ return p.u > 0; }).length;
        saetFig("f3","Udestående", kr(d.udestaaende),
          mangler + (mangler === 1 ? " person mangler" : " personer mangler"));
      } else {
        saetFig("f2","Mod budget", fortegn(mod) + " kr.", "Budget " + kr(d.budget));
        el("f2").parentNode.className = "fig " + (mod < 0 ? "fri" : "god");
        saetFig("f3","Ikke trukket endnu", kr(d.forventet),
          d.frister.length ? "Frist " + d.frister.join(" og ") : d.linjer + " linjer i filen");
      }
      saetFig("f4","Givet fri", kr(d.fritaget_kr),
        d.fritaget_personer + (d.fritaget_personer === 1 ? " person" : " personer") + " uden beløb");
    }

    el("k-fil").textContent = d.filnavn || "ukendt fil";
    el("k-tilstand").textContent = erHold ? "holdlister + satser"
      : (d.sendt ? "oprettet opkrævning" : "fremtidig opkrævning — ikke sendt endnu");
    el("k-tid").textContent = new Date(d.opdateret).toLocaleString("da-DK",
      {day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
    el("k-linjer").textContent = d.linjer;
    var antalFri = Object.keys(FRITAG).length;
    el("k-fri").textContent = antalFri ? antalFri + " navne" : "ingen";
    el("ryd").hidden = !antalFri;

    el("holdsub").textContent = erHold
      ? "Satsen gange to rater for hver spiller, minus 5 % til gebyr og afgang — samme regnestykke som budgettet. En spiller på flere hold tæller kun på det dyreste."
      : "Beløbene er Holdsports egne. Budgettet dækker hele sæsonen — dækker filen kun én rate, er cirka halvdelen det rigtige at sammenligne med.";
    el("persontitel").textContent = erHold ? "Alle på listerne" : "Alle der opkræves";

    visSim(); visAdvarsler(d, erHold); visHold(d, erHold); saetFilter(erHold); visPersoner();
  }

  function visSim(){
    var b = el("simbanner");
    if (!VIST || VIST.tilstand !== "hold"){ b.hidden = true; el("bulk").hidden = true; return; }
    el("bulk").hidden = false;
    var n = Object.keys(GEMT.sim || {}).length;
    if (!n){ b.hidden = true; return; }
    var d = VIST.forventet - BASIS.forventet;
    b.hidden = false;
    b.innerHTML = '<div class="sim"><span class="t">' + n + (n === 1 ? " flytning" : " flytninger")
      + ' simuleret</span><span class="d ' + (d >= 0 ? "op" : "ned") + '">' + fortegn(d)
      + ' kr. i forhold til Holdsport</span>'
      + '<span class="r"><button class="knap stille" type="button" id="nulstil">Nulstil</button></span></div>';
    el("nulstil").addEventListener("click", function(){ GEMT.sim = {}; gem(); genberegn(); });
  }

  function visAdvarsler(d, erHold){
    var ud = [];
    if (!erHold){
      var fritagne = {}, kendte = {};
      d.personer.forEach(function(p){ kendte[p.nk] = 1; if (p.fr) fritagne[p.nk] = 1; });
      var glemt = Object.keys(FRITAG).filter(function(nk){ return kendte[nk] && !fritagne[nk]; });
      if (glemt.length) ud.push('<div class="call"><span class="t">På fritagelseslisten, men ikke fritaget i Holdsport</span>'
        + '<p>Disse ' + glemt.length + ' bliver opkrævet, som filen ser ud nu.</p>'
        + punktliste(glemt.map(esc)) + '</div>');
      if (d.fri && d.fri.length) ud.push('<div class="call"><span class="t">Givet fri — '
        + d.fritaget_personer + (d.fritaget_personer === 1 ? ' person' : ' personer')
        + '</span><p>Der står ikke noget beløb på deres linjer i Holdsport, så de bliver ikke '
        + 'opkrævet. Beløbet her er det, holdet ellers koster for hele sæsonen — tilsammen '
        + kr(d.fritaget_kr) + ' Vælg <b>Givet fri</b> i filteret for at se dem alle.</p>'
        + punktliste(d.fri.map(function(x){ return esc(x.n) + " — " + esc(x.h)
            + (x.b ? ", " + tal(x.b) + " kr." : ""); }), 10) + '</div>');

      var dobbelt = d.personer.filter(function(p){ return p.flere && p.f > 0; });
      if (dobbelt.length){
        var forMeget = 0;
        dobbelt.forEach(function(p){ forMeget += p.f - p.hoejest; });
        ud.push('<div class="call"><span class="t">Opkrævet for mere end ét hold</span>'
          + '<p>Klubbens regel er, at man betaler på ét hold. Betalte de kun det dyreste, ville '
          + kr(forMeget) + ' falde væk. Er de under 17, skal de have ungdomsraten — så sæt den '
          + 'anden linje som fritaget i Holdsport, inden opkrævningen oprettes.</p>'
          + punktliste(dobbelt.map(function(p){ return esc(p.n) + " — " + tal(p.f) + " kr.: "
              + esc(p.b); })) + '</div>');
      }

      var ramt = {}; d.hold.forEach(function(h){ if (h.kode) ramt[h.kode] = 1; });
      var mangler = HOLD.filter(function(h){ return h[5] > 0 && !ramt[h[1]]; });
      if (mangler.length) ud.push('<div class="call"><span class="t">Hold uden nogen i filen</span>'
        + '<p>Der er budgetteret med indtægt fra disse hold, men ingen af dem står på en linje i '
        + 'opkrævningen. Er de sat op endnu?</p>'
        + punktliste(mangler.map(function(h){ return esc(h[0]) + " — budgetteret " + kr(h[5]); })) + '</div>');
      var uden = d.hold.filter(function(h){ return !h.kode; });
      if (uden.length) ud.push('<div class="call"><span class="t">Hold uden sats</span>'
        + '<p>Kunne ikke matches mod et hold i budgettet. Beløbene tæller med i totalen.</p>'
        + punktliste(uden.map(function(h){ return esc(h.navn) + " (" + h.personer
            + (h.personer === 1 ? " person)" : " personer)"); })) + '</div>');
      if (d.proeve && d.proeve.length) ud.push('<div class="call"><span class="t">Prøveperiode</span>'
        + '<p>Disse står som prøveperiode og bliver ikke opkrævet i denne omgang. Bliver de '
        + 'medlemmer, kommer beløbet oveni.</p>'
        + punktliste(d.proeve.map(function(x){ return esc(x.n) + " — " + esc(x.h)
            + (x.b ? ", " + tal(x.b) + " kr." : ""); })) + '</div>');
      if (d.refunderet) ud.push('<div class="call"><span class="t">Refunderet</span><p>'
        + kr(d.refunderet) + ' står som refunderet og er trukket ud af det forventede.</p></div>');
      el("advarsler").innerHTML = ud.join(""); return;
    }

    var dub = d.personer.filter(function(p){ return p.profiler > 1 && p.fdatoer <= 1; });
    if (dub.length){
      var ekstra = 0; dub.forEach(function(p){ ekstra += (p.profiler - 1) * p.fuld; });
      ud.push('<div class="call"><span class="t">Samme person med flere profiler</span>'
        + '<p>Ét navn med flere medlemsnumre og samme fødselsdato — typisk en profil, forælderen '
        + 'selv har oprettet ved siden af barnets. Siden tæller dem som én, men Holdsport opkræver '
        + 'pr. profil, så opkrævningen kan blive op til ' + kr(ekstra) + ' højere.</p>'
        + '<p>Slå dem sammen under <b>Medlemmer → profilen → Mere → Sammenlæg to profiler</b>. '
        + 'De skal dele mindst én mailadresse først.</p>'
        + punktliste(dub.map(function(p){ return esc(p.n) + " — " + p.profiler + " profiler"
            + (p.fdato ? ", født " + esc(p.fdato) : "")
            + (p.mails.length ? ", " + p.mails.map(esc).join(" / ") : ""); })) + '</div>');
    }
    var sammenfald = d.personer.filter(function(p){ return p.fdatoer > 1; });
    if (sammenfald.length) ud.push('<div class="call"><span class="t">Samme navn, forskellig fødselsdato</span>'
      + '<p>Formentlig to forskellige personer, som siden slår sammen til én — den tæller derfor for lidt.</p>'
      + punktliste(sammenfald.map(function(p){ return esc(p.n) + " — " + esc(p.fdato); })) + '</div>');

    if (!d.personer.some(function(p){ return p.alder != null; }))
      ud.push('<div class="call"><span class="t">Ingen alder i filen</span>'
        + '<p>Hverken Alder eller Fødselsdag er med i eksporten, så ungdomsreglen — under 17 på '
        + 'flere hold betaler ungdomsraten — kunne ikke bruges, og voksne på ungdomshold kan ikke '
        + 'findes. Tag kolonnerne med i eksporten fra Holdsport, hvis de tal skal være rigtige.</p></div>');

    var nedsatte = d.personer.filter(function(p){ return p.nedsat; });
    if (nedsatte.length) ud.push('<div class="call"><span class="t">Ungdomsraten brugt</span>'
      + '<p>Disse er under 17 og på mere end ét hold, så de betaler ' + tal(UNGDOMSSATS)
      + ' kr. pr. rate i stedet for holdets egen takst.</p>'
      + punktliste(nedsatte.map(function(p){ return esc(p.n) + " — " + p.alder + " år, "
          + esc(p.h) + (p.ogsaa ? " + " + esc(p.ogsaa) : "") + ", " + tal(p.f) + " kr."; })) + '</div>');

    var voksne = d.personer.filter(function(p){
      return p.alder != null && p.alder >= 18 && p.kode && UNGDOM[p.kode] && !p.fri; });
    if (voksne.length) ud.push('<div class="call"><span class="t">Voksne på ungdomshold</span>'
      + '<p>De bliver opkrævet ungdomskontingent. Er det en forældre- eller trænerprofil på selve '
      + 'holdet, skal den af holdet eller sættes som fritaget, inden opkrævningen oprettes.</p>'
      + punktliste(voksne.map(function(p){ return esc(p.n) + " — " + p.alder + " år, "
          + esc(p.h) + ", " + tal(p.f) + " kr."; })) + '</div>');

    var tomme = d.hold.filter(function(h){ return h.personer === 0 && h.budget > 0; });
    if (tomme.length) ud.push('<div class="call"><span class="t">Hold uden spillere</span>'
      + '<p>Der er budgetteret med indtægt fra disse hold, men ingen står på dem i filen.</p>'
      + punktliste(tomme.map(function(h){ return esc(h.navn) + " — budgetteret " + kr(h.budget); })) + '</div>');

    if (d.uden_hold) ud.push('<div class="call"><span class="t">' + d.uden_hold
      + ' uden kontingent-hold</span><p>De står kun på hold der ikke opkræves — Klubstab, '
      + 'trænerhold, try-out, stævnegrupper og lignende. Filtrér på «Uden kontingent-hold» for at se dem.</p></div>');

    el("advarsler").innerHTML = ud.join("");
  }

  function visHold(d, erHold){
    var skala = 0;
    d.hold.forEach(function(h){ skala = Math.max(skala, erHold ? h.netto : h.forventet, h.budget); });
    skala = skala || 1;
    el("skala").textContent = "Skalaen går til " + tal(skala) + " kr."
      + (erHold ? "" : " Beløbene er lagt sammen over alle rater, så de dækker hele sæsonen — "
         + "det samme som budgettet.");

    el("holdhead").innerHTML = erHold
      ? '<tr><th class="l">Hold</th><th>Spillere</th><th>Fritaget</th><th class="l">Mod budget</th>'
        + '<th>Brutto</th><th>Efter 5 %</th><th>Budget</th><th>Forskel</th></tr>'
      : '<tr><th class="l">Hold</th><th>Personer</th><th>Fri</th><th class="l">Mod budget</th>'
        + '<th>Forventet</th>' + (d.sendt ? '<th>Betalt</th><th>Udestående</th>'
          : '<th>Givet fri</th><th>Budget</th>')
        + (d.sendt ? '<th>Budget</th>' : '<th>Forskel</th>') + '</tr>';

    el("holdrows").innerHTML = d.hold.map(function(h){
      var vis = erHold ? h.netto : h.forventet;
      var diff = h.budget ? vis - h.budget : 0;
      var kl = h.budget ? " diff " + (diff < 0 ? "neg" : diff > 0 ? "pos" : "zero") : "";
      var s = '<tr><td class="l"><span class="code' + (h.kode ? '' : ' ukendt') + '">'
        + esc(h.kode || "?") + '</span><span class="team">' + esc(h.navn) + '</span></td>'
        + '<td class="num">' + h.personer + '</td>'
        + '<td class="num">' + (h.fritaget || "—") + '</td>'
        + '<td class="barcell"><span class="bar">'
        + '<i style="width:' + Math.min(100, vis/skala*100).toFixed(1) + '%"></i>'
        + (h.budget ? '<b style="left:calc(' + Math.min(100, h.budget/skala*100).toFixed(1) + '% - 1px)"></b>' : '')
        + '</span></td>';
      return s + (erHold
        ? '<td class="num">' + tal(h.forventet) + '</td>'
          + '<td class="num' + kl + '">' + tal(h.netto) + '</td>'
          + '<td class="num">' + (h.budget ? tal(h.budget) : "—") + '</td>'
          + '<td class="num' + kl + '">' + (h.budget ? fortegn(diff) : "—") + '</td></tr>'
        : '<td class="num' + kl + '">' + tal(h.forventet) + '</td>'
          + (d.sendt
            ? '<td class="num">' + tal(h.betalt) + '</td>'
              + '<td class="num">' + (h.forventet - h.betalt ? tal(h.forventet - h.betalt) : "—") + '</td>'
              + '<td class="num">' + (h.budget ? tal(h.budget) : "—") + '</td>'
            : '<td class="num">' + (h.frikr ? tal(h.frikr) : "—") + '</td>'
              + '<td class="num">' + (h.budget ? tal(h.budget) : "—") + '</td>'
              + '<td class="num' + kl + '">' + (h.budget ? fortegn(diff) : "—") + '</td>')
          + '</tr>');
    }).join("");

    el("holdfoot").innerHTML = erHold
      ? '<tr><td class="l">I alt</td><td class="num">' + d.personer.length + '</td>'
        + '<td class="num">' + d.fritaget_personer + '</td><td></td>'
        + '<td class="num">' + tal(d.brutto) + '</td><td class="num">' + tal(d.forventet) + '</td>'
        + '<td class="num">' + tal(d.budget) + '</td>'
        + '<td class="num">' + fortegn(d.forventet - d.budget) + '</td></tr>'
      : '<tr><td class="l">I alt</td><td class="num">' + d.personer.length + '</td>'
        + '<td class="num">' + d.fritaget_personer + '</td><td></td>'
        + '<td class="num">' + tal(d.forventet) + '</td>'
        + (d.sendt
          ? '<td class="num">' + tal(d.betalt) + '</td>'
            + '<td class="num">' + tal(d.udestaaende) + '</td>'
            + '<td class="num">' + tal(d.budget) + '</td>'
          : '<td class="num">' + tal(d.fritaget_kr) + '</td>'
            + '<td class="num">' + tal(d.budget) + '</td>'
            + '<td class="num">' + fortegn(d.forventet - d.budget) + '</td>')
        + '</tr>';
  }

  function holdValg(valgt){
    var ud = '<option value="">Uden kontingent-hold</option>';
    HOLD.forEach(function(h){
      if (h[2] <= 0) return;
      ud += '<option value="' + h[1] + '"' + (valgt === h[1] ? ' selected' : '') + '>'
          + esc(h[0]) + ' — ' + tal(h[2]*RATER) + ' kr.</option>';
    });
    return ud + '<option value="' + UD + '"' + (valgt === UD ? ' selected' : '') + '>Meldt ud</option>';
  }

  function saetFilter(erHold){
    var f = el("filter"), tidligere = f.value;
    var ud = '<option value="alle">Alle</option>';
    if (erHold){
      ud += '<option value="fritaget">Fritaget</option>'
          + '<option value="flere">På flere hold</option>'
          + '<option value="udenhold">Uden kontingent-hold</option>'
          + '<option value="aendret">Simulerede flytninger</option>';
      VIST.hold.forEach(function(h){
        ud += '<option value="hold:' + h.kode + '">' + esc(h.navn) + '</option>'; });
    } else {
      ud += '<option value="fritaget">Givet fri</option>'
          + '<option value="flere">Opkrævet for flere hold</option>'
          + '<option value="proeve">Prøveperiode</option>'
          + '<option value="udest">Mangler betaling</option>'
          + '<option value="betalt">Betalt</option>';
      VIST.hold.forEach(function(h){
        ud += '<option value="hold:' + esc(h.navn) + '">' + esc(h.navn) + '</option>'; });
    }
    f.innerHTML = ud;
    if (tidligere) f.value = tidligere;
    if (!f.value) f.value = "alle";
    el("bulkhold").innerHTML = '<option value="">Vælg hold …</option>' + holdValg(null);
  }

  function filtrer(){
    var q = norm(el("soeg").value), f = el("filter").value, erHold = VIST.tilstand === "hold";
    return VIST.personer.filter(function(p){
      if (q && norm(p.n + " " + p.h + " " + (p.ogsaa || "")).indexOf(q) === -1) return false;
      if (f.indexOf("hold:") === 0)
        return erHold ? p.kode === f.slice(5)
                      : (p.h || "").split("; ").indexOf(f.slice(5)) !== -1;
      if (f === "fritaget") return erHold ? !!p.fri : p.fr > 0;
      if (f === "flere") return p.flere;
      if (f === "proeve") return p.pr > 0;
      if (f === "udenhold") return !p.kode;
      if (f === "aendret") return p.aendret;
      if (f === "udest") return p.u > 0;
      if (f === "betalt") return p.be > 0 && p.u === 0;
      return true;
    });
  }

  function visPersoner(){
    if (!VIST) return;
    var erHold = VIST.tilstand === "hold", liste = filtrer();
    el("tael").textContent = liste.length + " af " + VIST.personer.length
      + " · " + kr(liste.reduce(function(a,p){ return a + p.f; }, 0));

    el("personhead").innerHTML = erHold
      ? '<tr><th class="l">Navn</th><th class="l">Hold</th><th class="l">Også på</th>'
        + '<th>Fuld sæson</th><th class="l">Status</th><th class="l">Flyt til</th></tr>'
      : '<tr><th class="l">Navn</th><th class="l">Hold</th><th class="l">Betaling</th>'
        + '<th>Givet fri</th><th>Forventet</th><th class="l">Status</th></tr>';

    el("personrows").innerHTML = liste.slice(0, 600).map(function(p){
      if (erHold){
        var pille = p.fri === "hel" ? '<span class="pille fritaget">Fritaget</span>'
          : p.fri === "delvis" ? '<span class="pille fritaget">Halv</span>'
          : p.fri === "uafklaret" ? '<span class="pille mangler">Uafklaret</span>'
          : !p.kode ? '<span class="pille andet">Ingen sats</span>'
          : '<span class="pille betalt">' + tal(p.f) + ' kr.</span>';
        if (p.nedsat) pille += ' <span class="pille mangler">Ungdomsrate</span>';
        return '<tr' + (p.aendret ? ' class="aendret"' : '') + '>'
          + '<td class="l w">' + esc(p.n) + '</td>'
          + '<td class="l w">' + esc(p.h)
            + (p.aendret && p.fra ? ' <span class="fra">(fra ' + esc(p.fra) + ')</span>' : '') + '</td>'
          + '<td class="l w">' + esc(p.ogsaa || "—") + '</td>'
          + '<td class="num">' + tal(p.f) + '</td>'
          + '<td class="l">' + pille + '</td>'
          + '<td class="l"><select class="flyt' + (p.aendret ? ' aendret' : '') + '" data-n="'
            + esc(p.nk) + '">' + holdValg(p.kode) + '</select></td></tr>';
      }
      var pil = p.fr && !p.f ? '<span class="pille fritaget">Fritaget</span>'
        : p.fr ? '<span class="pille fritaget">Delvis fri</span>'
        : p.be > 0 ? '<span class="pille betalt">Betalt</span>'
        : p.u > 0 && VIST.sendt ? '<span class="pille mangler">Mangler ' + tal(p.u) + '</span>'
        : p.f > 0 ? '<span class="pille betalt">Opkræves</span>'
        : '<span class="pille andet">—</span>';
      if (p.flere && p.f > 0) pil += ' <span class="pille mangler">Flere hold</span>';
      if (p.pr) pil += ' <span class="pille andet">Prøve</span>';
      return '<tr><td class="l w">' + esc(p.n) + '</td><td class="l w">' + esc(p.h) + '</td>'
        + '<td class="l w">' + esc(p.b) + '</td><td class="num">'
        + (p.frikr ? tal(p.frikr) : "—") + '</td>'
        + '<td class="num">' + tal(p.f) + '</td><td class="l">' + pil + '</td></tr>';
    }).join("")
      + (liste.length > 600 ? '<tr><td class="l" colspan="6">Viser de første 600 — søg for at indsnævre.</td></tr>' : '');
  }

  // ------------------------------------------------------------ simulering
  function standardKode(nk){
    var p = null;
    BASIS.personer.forEach(function(x){ if (x.nk === nk) p = x; });
    return p ? p.kode : null;
  }
  el("personrows").addEventListener("change", function(e){
    var s = e.target;
    if (!s || !s.classList || !s.classList.contains("flyt")) return;
    if (!GEMT || GEMT.tilstand !== "hold") return;
    GEMT.sim = GEMT.sim || {};
    var nk = s.dataset.n;
    if (s.value === (standardKode(nk) || "")) delete GEMT.sim[nk];
    else GEMT.sim[nk] = s.value || null;
    gem(); genberegn();
  });
  el("bulkhold").addEventListener("change", function(e){
    var kode = e.target.value;
    if (!kode || !GEMT || GEMT.tilstand !== "hold"){ e.target.value = ""; return; }
    var navne = filtrer().map(function(p){ return p.nk; });
    GEMT.sim = GEMT.sim || {};
    navne.forEach(function(nk){
      if (kode === (standardKode(nk) || "")) delete GEMT.sim[nk];
      else GEMT.sim[nk] = kode;
    });
    e.target.value = "";
    gem(); genberegn();
  });

  // Indsat tabel: kopieret fra en HTML-tabel bliver kolonnerne tabulatorer.
  // Faldback til semikolon og komma, hvis det kommer fra et regneark.
  function parseTekst(t){
    var linjer = String(t || "").replace(/\r/g,"").split("\n").filter(function(l){ return l.trim(); });
    if (!linjer.length) throw new Error("Der er ikke noget at læse.");
    var tegn = linjer[0].indexOf("\t") !== -1 ? "\t"
             : linjer[0].indexOf(";") !== -1 ? ";"
             : linjer[0].indexOf(",") !== -1 ? "," : "\t";
    return linjer.map(function(l){
      return l.split(tegn).map(function(c){ return c.trim().replace(/^"|"$/g,""); });
    });
  }

  // ------------------------------------------------------------ filer
  function haandterFil(file){
    var fejl = el("fejl"), ok = el("okbesked");
    fejl.hidden = true; ok.hidden = true;
    if (!file) return;
    if (typeof XLSX === "undefined"){
      fejl.textContent = "Regnearks-læseren kunne ikke hentes. Er du offline?";
      fejl.hidden = false; return;
    }
    var fr = new FileReader();
    fr.onerror = function(){ fejl.textContent = "Filen kunne ikke læses."; fejl.hidden = false; };
    fr.onload = function(e){
      try {
        var wb = XLSX.read(new Uint8Array(e.target.result), {type:"array", cellDates:true});
        var raekker = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],
          {header:1, raw:true, defval:""});
        brugResultat(laes(raekker, file.name));
      } catch (err) {
        fejl.textContent = (err && err.message) ? err.message : "Filen kunne ikke læses.";
        fejl.hidden = false;
      }
    };
    fr.readAsArrayBuffer(file);
  }

  function brugResultat(res){
    var fejl = el("fejl"), ok = el("okbesked");
    fejl.hidden = true; ok.hidden = true;
    try {
        if (res.slags === "fritagelser"){
          FRITAG = {};
          res.liste.forEach(function(r){
            var o = r.omfang;
            FRITAG[norm(r.navn)] = (o.indexOf("delvis") === 0) ? "delvis"
                                 : (o.indexOf("uafklaret") === 0) ? "uafklaret" : "hel";
          });
          gem();
          ok.textContent = "Fritagelsesliste indlæst: " + Object.keys(FRITAG).length
            + " navne. Den huskes i denne browser.";
          ok.hidden = false;
          if (GEMT) genberegn();
          return;
        }
        GEMT = res.data; gem(); genberegn();
        window.scrollTo({top:0, behavior:"smooth"});
    } catch (err) {
      fejl.textContent = (err && err.message) ? err.message : "Filen kunne ikke læses.";
      fejl.hidden = false;
    }
  }

  el("vaelg").addEventListener("click", function(){ el("fil").click(); });
  el("fil").addEventListener("change", function(e){ haandterFil(e.target.files[0]); e.target.value = ""; });
  el("ny").addEventListener("click", function(){
    el("data").hidden = true; el("tom").hidden = false;
    el("fejl").hidden = true; el("okbesked").hidden = true;
    window.scrollTo({top:0, behavior:"smooth"});
  });
  el("laestekst").addEventListener("click", function(){
    var fejl = el("fejl"); fejl.hidden = true;
    try { brugResultat(laes(parseTekst(el("tekst").value), "indsat tabel")); }
    catch (err){ fejl.textContent = (err && err.message) || "Kunne ikke læse det indsatte."; fejl.hidden = false; }
  });
  el("ryd").addEventListener("click", function(){
    FRITAG = {}; gem();
    if (GEMT) genberegn();
  });
  el("soeg").addEventListener("input", visPersoner);
  el("filter").addEventListener("change", visPersoner);

  var drop = el("drop");
  ["dragenter","dragover"].forEach(function(t){
    drop.addEventListener(t, function(e){ e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave","drop"].forEach(function(t){
    drop.addEventListener(t, function(e){ e.preventDefault(); drop.classList.remove("over"); }); });
  drop.addEventListener("drop", function(e){
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length)
      haandterFil(e.dataTransfer.files[0]);
  });

  // ------------------------------------------------------------ opstart
  var lokal = hentLokalt("data");
  if (lokal && (lokal.raa || lokal.personer)){ GEMT = lokal; genberegn(); }

  if (window.claude && typeof window.claude.use === "function"){
    window.claude.use("db").then(function(db){
      if (!db) return;
      DB = db;
      return db.doc("kontingent/seneste").get().then(function(snap){
        if (!snap || !snap.exists || GEMT) return;
        var d = snap.data();
        if (d && (d.raa || d.personer)){ GEMT = d; genberegn(); }
      });
    }).catch(function(){});
  }
})();
