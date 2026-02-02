const URL_JSON = "https://api.allorigins.win/raw?url=" + encodeURIComponent(
  "http://bienstream.top/p2p/jogos/jogos-hoje.json"
);

/* MAPA DE AGRUPAMENTO */
const MAPA_CAMPEONATOS = {
  // Brasileirão
  "Brasileirão Série A": "BRASILEIRÃO",
  "Brasileirão Série B": "BRASILEIRÃO",
  "Brasileirão Série C": "BRASILEIRÃO",
  "Brasileirão Série D": "BRASILEIRÃO",

  // Estaduais
  "Campeonato Paulista": "ESTADUAIS",
  "Paulistão": "ESTADUAIS",
  "Cariocão": "ESTADUAIS",
  "Campeonato Carioca": "ESTADUAIS",
  "Campeonato Mineiro": "ESTADUAIS",
  "Campeonato Gaúcho": "ESTADUAIS",

  // Copas
  "Copa do Brasil": "COPA DO BRASIL",
  "Libertadores": "LIBERTADORES",
  "Sul-Americana": "SUL-AMERICANA"
};

/* ORDEM DE PRIORIDADE */
const PRIORIDADE = [
  "BRASILEIRÃO",
  "ESTADUAIS",
  "COPA DO BRASIL",
  "LIBERTADORES",
  "SUL-AMERICANA",
  "OUTROS"
];

fetch(URL_JSON)
  .then(res => res.json())
  .then(json => {
    const jogos = json.data || [];
    const grupos = agruparJogos(jogos);
    render(grupos);
  })
  .catch(() => {
    document.getElementById("app").innerHTML =
      "<p class='loading'>Erro ao carregar jogos</p>";
  });

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

function render(grupos) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  PRIORIDADE.forEach(campeonato => {
    if (!grupos[campeonato]) return;

    const section = document.createElement("section");
    section.innerHTML = `<h2>${campeonato}</h2>`;

    const row = document.createElement("div");
    row.className = "row";

    grupos[campeonato].forEach(jogo => {
      const card = document.createElement("div");
      card.className = "card";

      const hora = new Date(jogo.datacompleta)
        .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      card.innerHTML = `
        <div class="times">
          <div class="time">
            <img 
              src="${jogo.Logo1}" 
              alt="${jogo.Time}" 
              onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'"
            >
            <div>${jogo.Time}</div>
          </div>

          <div class="vs">x</div>

          <div class="time">
            <img 
              src="${jogo.Logo2}" 
              alt="${jogo.Time2}" 
              onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'"
            >
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

