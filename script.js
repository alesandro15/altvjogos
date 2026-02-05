document.addEventListener("DOMContentLoaded", () => {

const API_URL =
  "https://api.allorigins.win/raw?url=" +
  encodeURIComponent("https://bienstream.top/p2p/jogos/jogos-hoje.json");

const LOGO_BASE = "https://jogosfut.top/soccer_logos/";
const LOGO_PADRAO = "https://i.imgur.com/6bK6Y5n.png";
const LIGA_PADRAO = "https://i.imgur.com/3ZQ3ZQp.png";

/* DATA */
const elDate = document.getElementById("date");
const elUpdated = document.getElementById("updatedAt");
if (elDate) {
  elDate.textContent = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

/* LOGO TIME */
function montarLogo(logo) {
  if (!logo) return LOGO_PADRAO;
  if (logo.startsWith("http")) return logo;
  return LOGO_BASE + logo;
}

/* LOGO LIGA (MESMA BASE DOS TIMES) */
function montarLogoLiga(jogo) {
  if (jogo.logo_liga) {
    if (jogo.logo_liga.startsWith("http")) return jogo.logo_liga;
    return LOGO_BASE + jogo.logo_liga;
  }

  if (jogo.liga) {
    const slug = jogo.liga
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    return LOGO_BASE + slug + ".png";
  }

  return LIGA_PADRAO;
}

/* NORMALIZA */
function normalizarJogos(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.jogos)) return data.jogos;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

/* STATUS */
function statusJogo(j) {
  if (j.status === "FT") return "encerrado";
  if (j.status !== "NS") return "ao_vivo";
  return "agendado";
}

/* TEXTO STATUS */
function badgeTexto(j) {
  // ENCERRADO
  if (j.status === "FT") {
    return "ENCERRADO";
  }

  // AO VIVO
  if (j.status !== "NS") {
    if (j.tempo) {
      return `AO VIVO • ${j.tempo}'`;
    }
    return "AO VIVO";
  }

  // AGENDADO
  const hora = new Date(j.datacompleta)
    .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return `HOJE • ${hora}`;
}

/* PLACAR */
function placarHTML(j) {
  if (j.placar_time1 != null && j.placar_time2 != null && j.status !== "NS") {
    return `
      <div class="placar">
        <span>${j.placar_time1}</span>
        <span>x</span>
        <span>${j.placar_time2}</span>
      </div>
    `;
  }
  return `<div class="placar vazio"></div>`;
}

/* ORDENA */
function ordenarParaTopo(jogos) {
  const peso = { ao_vivo: 0, agendado: 1, encerrado: 2 };
  return [...jogos].sort((a, b) => {
    const sa = statusJogo(a);
    const sb = statusJogo(b);
    if (peso[sa] !== peso[sb]) return peso[sa] - peso[sb];
    return new Date(a.datacompleta) - new Date(b.datacompleta);
  });
}

/* Classicos */
const CLASSICOS = [
  { t1: "palmeiras", t2: "corinthians", nome: "Derby Paulista" },
  { t1: "sao paulo", t2: "corinthians", nome: "Majestoso" },
  { t1: "palmeiras", t2: "sao paulo", nome: "Choque-Rei" },
  { t1: "santos", t2: "palmeiras", nome: "Clássico da Saudade" },

  { t1: "flamengo", t2: "fluminense", nome: "Fla-Flu" },
  { t1: "flamengo", t2: "vasco", nome: "Clássico dos Milhões" },
  { t1: "fluminense", t2: "vasco", nome: "Clássico dos Gigantes" },
  { t1: "botafogo", t2: "flamengo", nome: "Clássico da Rivalidade" },
  { t1: "botafogo", t2: "fluminense", nome: "Clássico Vovô" },

  { t1: "gremio", t2: "internacional", nome: "Grenal" },
  { t1: "atletico", t2: "cruzeiro", nome: "Clássico Mineiro" },
  { t1: "bahia", t2: "vitoria", nome: "Ba-Vi" },
  { t1: "sport", t2: "nautico", nome: "Clássico dos Clássicos" },
  { t1: "ceara", t2: "fortaleza", nome: "Clássico-Rei" },
  { t1: "athletico", t2: "coritiba", nome: "Athletiba" }
];

function detectarClassico(jogo) {
  const a = jogo.Time.toLowerCase();
  const b = jogo.Time2.toLowerCase();

  return CLASSICOS.find(c =>
    (a.includes(c.t1) && b.includes(c.t2)) ||
    (a.includes(c.t2) && b.includes(c.t1))
  );
}

/* CARD */
function criarCard(jogo) {
  const tipo = statusJogo(jogo);
const isBrasileirao = jogo.liga && jogo.liga.toLowerCase().includes("brasile");
const classico = detectarClassico(jogo);


  const hora =
    tipo === "agendado"
      ? `<div class="hora">Começa às ${new Date(jogo.datacompleta)
          .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>`
      : "";

  return `
   <div class="card ${tipo} ${isBrasileirao ? "brasileirao" : ""} ${classico ? "classico" : ""}">


      
      <div class="liga-info">
        <img src="${montarLogoLiga(jogo)}" onerror="this.src='${LIGA_PADRAO}'">
        <span>${jogo.liga || "Campeonato"}</span>
      </div>

      <div class="badge ${tipo}">${badgeTexto(jogo)}</div>
${classico ? `<div class="classico-nome">${classico.nome}</div>` : ""}


      <div class="times">
        <div class="time">
          <img src="${montarLogo(jogo.Logo1)}" onerror="this.src='${LOGO_PADRAO}'">
          <span>${jogo.Time}</span>
        </div>

        ${placarHTML(jogo)}

        <div class="time">
          <img src="${montarLogo(jogo.Logo2)}" onerror="this.src='${LOGO_PADRAO}'">
          <span>${jogo.Time2}</span>
        </div>
      </div>

      ${hora}
      <div class="canal">${jogo.canal || ""}</div>
    </div>
  `;
}

/* RENDER */
function render(jogos) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const topo = ordenarParaTopo(jogos);
  const secTopo = document.createElement("section");
  secTopo.innerHTML = `<h2>Próximos Jogos</h2><div class="row"></div>`;
  const rowTopo = secTopo.querySelector(".row");

  topo.forEach(j => rowTopo.innerHTML += criarCard(j));
  app.appendChild(secTopo);

  const grupos = {};
  jogos.forEach(j => {
    const liga = j.liga || "Outros";
    if (!grupos[liga]) grupos[liga] = [];
    grupos[liga].push(j);
  });

  const ordemLigas = Object.keys(grupos).sort((a, b) => {
    if (a.toLowerCase().includes("brasile")) return -1;
    if (b.toLowerCase().includes("brasile")) return 1;
    return a.localeCompare(b);
  });

  ordemLigas.forEach(liga => {
    const sec = document.createElement("section");
    sec.innerHTML = `<h2>${liga}</h2><div class="row"></div>`;
    const row = sec.querySelector(".row");

    grupos[liga].forEach(j => row.innerHTML += criarCard(j));
    app.appendChild(sec);
  });
}

/* LOAD */
function carregar() {
  fetch(API_URL)
    .then(r => r.json())
    .then(data => {
      const jogos = normalizarJogos(data);
      localStorage.setItem("jogos_cache", JSON.stringify(jogos));
      render(jogos);
if (elUpdated) {
  const agora = new Date();
  elUpdated.textContent =
    "Atualizado agora • " +
    agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
}


    })
    .catch(console.error);
}

const cache = localStorage.getItem("jogos_cache");
if (cache) render(JSON.parse(cache));

carregar();
setInterval(carregar, 60000);

});
