/* ================= PROXIES ================= */
const PROXIES = [
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`
];

const SOURCE_URL = "http://bienstream.top/p2p/jogos/jogos-hoje.json";
const LOGO_BASE = "https://jogosfut.top/soccer_logos/";

/* ================= MAPA DE CAMPEONATOS ================= */
const MAPA_CAMPEONATOS = {
  "Brasileirão Série A": "BRASILEIRÃO",
  "Brasileirão Série B": "BRASILEIRÃO",
  "Brasileirão Série C": "BRASILEIRÃO",
  "Brasileirão Série D": "BRASILEIRÃO",

  "Campeonato Paulista": "ESTADUAIS",
  "Paulistão": "ESTADUAIS",
  "Cariocão": "ESTADUAIS",
  "Campeonato Carioca": "ESTADUAIS",
  "Campeonato Mineiro": "ESTADUAIS",
  "Campeonato Gaúcho": "ESTADUAIS",

  "Copa do Brasil": "COPA DO BRASIL",
  "Libertadores": "LIBERTADORES",
  "Sul-Americana": "SUL-AMERICANA"
};

const PRIORIDADE = [
  "BRASILEIRÃO",
  "ESTADUAIS",
  "COPA DO BRASIL",
  "LIBERTADORES",
  "SUL-AMERICANA",
  "OUTROS"
];

/* ================= FETCH COM FALLBACK ================= */
async function fetchComFallback(url) {
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url));
      if (!res.ok) continue;
      const json = await res.json();
      if (json && json.data) return json.data;
    } catch (e) {}
  }
  throw new Error("Nenhum proxy respondeu");
}

/* ================= START ================= */
fetchComFallback(SOURCE_URL)
  .then(jogos => {
    const grupos = agruparJogos(jogos);
    render(grupos);
  })
  .catch(() => {
    document.getElementById("app").innerHTML =
      "<p class='loading'>Erro ao carregar jogos</p>";
  });

/* ================= FUNÇÕES ================= */
function agruparJogos(jogos) {
  const grupos = {};
  jogos.forEach(jogo => {
    const liga = jogo.liga || "OUTROS";
    const grupo = MAPA_CAMPEONATOS[liga] || "OUTROS";
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(jogo);
  });
  return grupos;
}

function montarLogo(logo) {
  const padrao =
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";

  if (!logo) return padrao;

  // Se já vier URL completa
  if (logo.startsWith("http")) return logo;

  // Se vier só o nome do arquivo (caso real da API)
  return LOGO_BASE + logo;
}

function render(grupos) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  PRIORIDADE.forEach(camp => {
    if (!grupos[camp]) return;

    const section = document.createElement("section");
    section.innerHTML = `<h2>${camp}</h2>`;

    const row = document.createElement("div");
    row.className = "row";

    grupos[camp].forEach(jogo => {
      const hora = new Date(jogo.datacompleta)
        .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      const logo1 = montarLogo(jogo.Logo1);
      const logo2 = montarLogo(jogo.Logo2);

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="times">
          <div class="time">
            <img src="${logo1}">
            <div>${jogo.Time}</div>
          </div>

          <div class="vs">x</div>

          <div class="time">
            <img src="${logo2}">
            <div>${jogo.Time2}</div>
          </div>
        </div>

        <div class="hora">${hora}</div>
        <div class="canal">${jogo.canal || ""}</div>
      `;

      row.appendChild(card);
    });

    section.appendChild(row);
    app.appendChild(section);
  });
}
