# Protótipo Moodle Unipampa — visão do aluno (design)

Data: 2026-11-08 · Autor do pedido: Rafael (trabalho da disciplina de IHC)

## 1. Intenção

Trabalho prático de IHC: redesenhar a interface do Moodle institucional da Unipampa, **visão do aluno**. O entregável é um **site estático navegável** (mockup de alta fidelidade) publicado online, para apresentação e avaliação de usabilidade. Não há funcionalidade real (nada é enviado, salvo ou criado); tudo é dado fictício embutido, mas toda tela alcançável deve existir e parecer real.

O ponto de partida é `moodle_prototipo_mockups.html` (versão gerada pelo ChatGPT). **Ela pode ser reescrita livremente.** A referência de estrutura é o Moodle real, não a versão do ChatGPT:

- `Curso_ CC INTERACAO HUMANO-COMPUTADOR _ Moodle.html` — página real do curso (aba Curso), fonte do conteúdo de IHC.
- As capturas de tela que o aluno mostrou cobrem **só a página do curso**: cabeçalho (logo · Página inicial · Painel · Meus cursos | busca · notificações · mensagens · avatar), título em caixa, abas, seções colapsáveis com chevron em quadradinho, itens com ícone e prefixo de tipo, subseções "EaD (2h)" aninhadas, datas "Aberto/Vencimento". As demais telas (Página inicial, Painel, Meus cursos, Calendário, Participantes, Notas) seguem as convenções do Moodle 4.x, redesenhadas no mesmo design system. *(Decisão do redator.)*
- Mockup aprovado do "modelo B": `.superpowers/brainstorm/35838-1794164381/content/pagina-curso.html` (segunda metade, "Opção B"). É **direção de layout e hierarquia**, não alvo pixel a pixel.

## 2. Objetivos

1. **Consistência visual total** — um design system pequeno e aplicado em tudo: mesmos botões (altura, padding, raio), mesma escala de espaçamento, cores com papel semântico. É um trabalho de IHC; inconsistência é defeito.
2. **Usabilidade** de acordo com as heurísticas de Nielsen (estado do sistema visível, consistência, prevenção de erro, reconhecimento em vez de memorização, estética minimalista, mensagens de vazio/erro úteis).
3. **Página do curso redesenhada** (modelo "B — Moodle modernizado", aprovado no mockup) com barra lateral direita: calendário do curso → avisos do professor → informações do curso + Plano de ensino.
4. **Filtro de "Meus cursos" realmente usável.**
5. **Cinco cursos ativos** com conteúdo próprio e completo, todos no **mesmo modelo de página**.
6. **Navegação sem becos sem saída**: nenhum 404 do servidor; rotas desconhecidas caem numa página "não encontrada" do próprio site.

## 3. Não-objetivos

- Visão de professor/admin, edição, upload, login real, back-end, persistência entre sessões (exceto conveniências locais opcionais, ver §9).
- A aba "Competências" do Moodle original.
- Telas de detalhe de cada atividade/arquivo (abrem aviso, ver §6.9).

## 4. Anti-objetivos (fracasso mesmo que "funcione")

- **Qualquer emoji** na interface. Todo ícone é SVG.
- Cursos com estruturas de página diferentes entre si (a versão do ChatGPT fazia isso — remover).
- Textos de bastidor na UI ("Mockup exclusivo", "versão V4", banner "Protótipo acadêmico…", "100% cursos ativos nesta versão", avatar "RD RD").
- Controles que parecem interativos e não fazem nada sem retorno (ex.: o campo "Favoritos" somente-leitura atual).
- Nomes/e-mails reais de pessoas além do próprio aluno. Ver §8.

## 5. Decisões técnicas (tomadas na conversa)

- **SPA estática com roteamento por hash** (`#/...`), HTML/CSS/JS puros, sem build, sem framework, sem dependências externas (fontes podem ser do sistema ou Google Fonts — escolha do builder).
- Estrutura de arquivos:
  ```
  index.html
  404.html            → redireciona para index.html (GitHub Pages)
  css/styles.css      → tokens + componentes
  js/icons.js         → sprite SVG (<symbol>) injetado no body; uso <svg><use href="#i-nome"/></svg>
  js/data.js          → cursos, semanas, atividades, avisos, notas, participantes, eventos
  js/app.js           → router + renderização das telas
  ```
- **Deploy: GitHub Pages**, como *project page* (`https://<usuario>.github.io/<repo>/`), arquivos do site na **raiz** do repositório; `404.html` redireciona calculando a base a partir de `location.pathname` (funciona em qualquer nome de repo). Criar o repositório e publicar é um passo separado, feito só com confirmação do aluno. *(Decisão do redator.)* O site deve funcionar também abrindo `index.html` direto do disco (file://) — por isso hash routing e nenhum `fetch` de JSON.
- Ícones: estilo traço único 24×24, stroke 2, cantos arredondados (estilo Lucide; pode copiar paths do Lucide, licença ISC, ou desenhar).
- O arquivo antigo `moodle_prototipo_mockups.html` fica no repositório como histórico, sem ser usado.

## 6. Telas e rotas

"Hoje" no protótipo é fixo: **domingo, 08/11/2026** (bate com o calendário real do curso de IHC). Usuário logado: **Rafael da Silva Moral (RM)**.

Cabeçalho global (todas as telas), espelhando o Moodle: logo Unipampa | Página inicial · Painel · Meus cursos | (direita) busca, notificações (badge com contagem), mensagens, avatar com menu. Item ativo do menu destacado. Calendário é acessível pelo Painel e pelo menu do avatar/link "Calendário" (builder decide se entra também no menu principal; recomendação: sim, como 4º item).

| Rota | Tela |
|---|---|
| `#/` | Página inicial |
| `#/painel` | Painel |
| `#/cursos` | Meus cursos (aceita query: `#/cursos?q=&status=&area=&fav=1&ordem=`) |
| `#/calendario` (opcional `?mes=2026-11&curso=ihc`) | Calendário geral |
| `#/curso/:id` | Curso — aba Curso |
| `#/curso/:id/participantes` | aba Participantes |
| `#/curso/:id/notas` | aba Notas |
| `#/curso/:id/atividades` | aba Atividades |
| `#/curso/:id/plano` | Plano de ensino |
| `#/curso/:id/avisos` | Todos os avisos do curso |
| qualquer outra | "Página não encontrada" com link para Página inicial e Meus cursos |

### 6.1 Página inicial
Capa do site: saudação, avisos gerais da universidade (2–3 fictícios, ex.: calendário acadêmico, semana de TCC), acesso rápido aos cursos em andamento (cards compactos).

### 6.2 Painel
"Meu dia": **Linha do tempo** de próximas entregas de todos os cursos (filtro 7 dias / 30 dias / atrasadas; ordenar por data ou por curso), **Acessados recentemente** (3 cursos), **calendário pequeno** com eventos de todos os cursos e link para o calendário completo.

### 6.3 Meus cursos (filtro)
- Busca por nome/professor/área com botão "×" para limpar; busca ignora acentos e maiúsculas.
- Segmentado de situação: **Em andamento · Concluídos · Todos** (padrão: Em andamento).
- Toggle **Só favoritos** (estrela; contador).
- Chips de área (multi ou single — builder decide; recomendação: single com "Todas").
- Ordenar: Nome A–Z · Próxima entrega · Progresso · Acessado recentemente.
- Visualização: Cartões / Lista.
- Linha de estado: "N cursos · 2 filtros ativos · Limpar filtros".
- Estado vazio com explicação e botão "Limpar filtros".
- Filtros refletidos na URL (link compartilhável/recarregável).
- Card: cor/faixa do curso, área, título, professor, próxima entrega, barra de progresso, estrela favoritar (com `aria-pressed`), clique no card abre o curso.

### 6.4 Calendário geral
Mês com navegação (‹ Hoje ›), eventos coloridos pela cor do curso, filtro por curso (chips/legenda clicável), painel lateral "Agenda do dia" + "Neste mês". No celular, eventos viram pontos e a agenda fica abaixo.

### 6.5 Curso — aba Curso (modelo B aprovado)
Coluna principal:
- Breadcrumb "Meus cursos › Nome", título, abas (Curso · Participantes · Notas · Atividades).
- **Faixa de resumo**: "X de Y atividades entregues", "Próxima entrega dd/mm", "Média parcial".
- Seções colapsáveis: **Geral** primeiro, depois cada semana ("17 a 23/08/2026"). Semana corrente marcada com etiqueta "Esta semana" e aberta por padrão; semanas passadas e futuras recolhidas por padrão; "Expandir tudo / Contrair tudo".
- Subseções aninhadas (ex.: "EaD (2h)"), como no original.
- Cada item: ícone SVG colorido por tipo · título (sem o prefixo "[PDF]" — o tipo vira **etiqueta**) · linha secundária (referência bibliográfica, ou "Prazo: dom, 30/08 às 23:59") · etiqueta à direita: tipo (PDF, PPTX, Vídeo, Link, Kahoot, Fórum, Página) **ou** situação para atividades avaliativas (Entregue, Pendente, Atrasada, Não aberta).
- Blocos de texto/rótulo do original (ex.: Horários, Braindraw, "Apresentações do trabalho prático") aparecem como texto dentro da seção.
- Descrições longas de tarefas: recolhidas em "Ver instruções" (expansível).

Barra lateral direita (ordem fixa):
1. **Calendário do curso** — mês corrente, dias com entrega marcados, hoje destacado, ‹ › para trocar mês; clicar num dia lista as entregas daquele dia; abaixo, "Próximas entregas" (3).
2. **Avisos do professor** — 3 mais recentes (título, autor, tempo relativo) + "Ver todos os avisos" → `#/curso/:id/avisos`.
3. **Informações do curso** — professor(a), sala, horário das aulas, horário de atendimento, carga horária/créditos + botão primário **Plano de ensino** → `#/curso/:id/plano`.

Responsivo: < 980 px a barra lateral desce para baixo do conteúdo (calendário primeiro).

### 6.6 Aba Participantes
Tabela/lista: avatar com iniciais, nome, papel (Professor(a) / Estudante), último acesso. Busca por nome e filtro por papel. ~20 nomes fictícios por curso (podem se repetir entre cursos).

### 6.7 Aba Notas
Tabela: item avaliativo, peso, nota (0–10), situação, feedback curto. Linha final com média parcial. Itens futuros com "—". Coerente com as situações da aba Curso.

### 6.8 Aba Atividades
Todas as atividades avaliativas do curso em lista única, com filtro por tipo (Tarefa, Fórum, Questionário) e por situação, ordenadas por prazo; agrupamento "Atrasadas / Próximas / Concluídas".

### 6.9 Elementos sem tela própria
Clicar em item de material/atividade, notificação individual, mensagem, "Meu perfil", "Preferências", busca global etc. mostra um **toast** não bloqueante: "Disponível apenas na versão completa do Moodle." Notificações, mensagens e avatar abrem **dropdowns** com 3–4 itens fictícios (menu do avatar inclui Calendário, Perfil, Notas, Sair → toast).

### 6.10 Plano de ensino / Todos os avisos
Páginas simples dentro do layout do curso: plano com ementa, objetivos, conteúdo programático, metodologia, avaliação (pesos), bibliografia; avisos em lista cronológica.

## 7. Design system

- **Escala de espaçamento**: 4, 8, 12, 16, 24, 32, 48 px (tokens `--s-1…--s-7`). Nenhum valor fora da escala.
- **Raios**: `--r-sm 8px` (chips internos, inputs, botões), `--r-md 12px` (cards, seções), `--r-full` (pílulas, avatares).
- **Botões**: um componente `.btn` com variantes `primary`, `secondary`, `ghost`, e tamanhos `md` (40 px, padding 0 16px) e `sm` (32 px, padding 0 12px). Todo botão do site usa isso. `sm` e chips têm área de toque estendida para ≥ 40 px (pseudo-elemento invisível ou padding), mantendo o visual de 32 px. *(Decisão do redator.)*
- **Cores**: verde Unipampa como primária (`#0b6b4b`, hover mais escuro); neutros para texto/bordas; semânticas: sucesso (verde), aviso (âmbar), perigo (vermelho), info (azul) — usadas **só** para situação. Cada curso tem uma cor de destaque usada apenas em faixa do card, pontos no calendário e ícone do curso — nunca em botões ou links.
- **Tipos de item** (ícone + cor fixa): Arquivo/PDF/PPTX (azul), Tarefa (rosa/vermelho), Fórum (roxo), Link/URL/Kahoot/Vídeo (verde-azulado), Página (cinza).
- **Tipografia**: uma família sans; escala 12/14/16/20/28 px.
- **Acessibilidade**: contraste AA, foco visível em tudo, navegação por teclado (seções colapsáveis com `<button aria-expanded>`, dropdowns fecham com Esc), `aria-current` no menu/aba ativa, alvos ≥ 40 px, `lang="pt-BR"`, títulos de página atualizados por rota (`document.title`).
- Sem estilos inline no markup gerado (exceto variáveis de cor por curso).

## 8. Conteúdo

### 8.1 Cursos

Ativos (2º semestre 2026):

| id | Nome | Fonte do conteúdo |
|---|---|---|
| `ihc` | Interação Humano-Computador | **Real** — transcrever `Curso_ CC INTERACAO HUMANO-COMPUTADOR _ Moodle.html` (todas as 16 seções, subseções EaD, itens, tipos, prazos, referências, textos). Sala A1-302, segundas 20:30–22:20. |
| `web` | Desenvolvimento Web Responsivo | Fictício, mesmo nível de detalhe |
| `bd` | Banco de Dados | Fictício |
| `ia` | Inteligência Artificial | Fictício |
| `pi` | Projeto Integrador | Fictício |

Concluídos (1º semestre 2026, 09/03 a 10/07/2026): 1–2 cursos fictícios (ex.: Algoritmos e Programação, Cálculo I). Usam **o mesmo modelo e as mesmas abas**, com conteúdo menor: Geral + 5–6 semanas, todas as atividades "Entregue", notas finais e média final, plano de ensino, 2 avisos antigos. O calendário lateral abre no mês da última entrega (julho/2026); a faixa de resumo mostra "Concluído · Média final X". *(Decisão do redator.)*

Cursos fictícios: mesmo calendário de semanas (17/08 a 07/12/2026), dias/horários/salas distintos e sem conflito com IHC, ~8–12 semanas com 2–5 itens cada, mix de tipos, prazos coerentes com "hoje" = 08/11 (algumas entregues, ≥1 pendente nos próximos 14 dias, no máximo 1 atrasada no total para mostrar o estado).

### 8.2 Privacidade
Manter o nome do aluno (Rafael da Silva Moral). **Substituir** nomes reais de docentes e colegas por fictícios. **Nenhum e-mail** aparece no protótipo (nem fictício): o trecho "Compartilhe seu portfólio com <e-mail>" vira "Compartilhe seu portfólio com a professora". O link do Google Docs do material de apoio é removido. Os arquivos salvos do Moodle ficam em `referencia/`, fora do git (decisão do aluno). Referências bibliográficas publicadas e links públicos (NN/g, Kahoot genérico) podem ficar como texto.

### 8.3 Situação das atividades de IHC em 08/11
**Datas, prazos e horários do arquivo de referência prevalecem** e são copiados exatamente (ex.: "Apresentação do grupo" vence seg 16/11 às 20:30; "Atualização do PRI" dom 22/11 23:59). Itens sem prazo no original não recebem situação — só etiqueta de tipo. Fóruns avaliativos sem data ("Avaliação Diagnóstica", "Modos e estilos de Interação") contam como Entregue. Atividades com prazo passado: Entregue (com nota na aba Notas). "Avaliação Cooperativa Planejamento" (prazo hoje 23:59): Pendente. "Apresentação do grupo" (16/11) e "Atualização do PRI" (22/11): Pendente. Pesos de avaliação de IHC: fictícios plausíveis.

## 9. Deixado ao builder

- Nomes exatos de tokens/classes, organização interna do JS.
- Copy dos avisos, notificações, mensagens, participantes e dos cursos fictícios.
- Usar `localStorage` para lembrar favoritos e seções abertas (opcional; deve funcionar sem).
- Pequena animação de abrir/fechar seção (respeitando `prefers-reduced-motion`).
- Forma exata do logo (texto + símbolo SVG simples; não usar imagem do logo oficial se não estiver no repositório).

## 10. Critérios de aceite

- Todas as rotas da §6 navegáveis a partir da UI, sem erros no console; F5 em qualquer rota mantém a tela.
- `grep` por emojis no código retorna vazio.
- Todo botão usa `.btn`; nenhum valor de espaçamento/raio fora dos tokens.
- Layout correto em 360 px, 768 px e 1280 px.
- Curso de IHC reproduz todas as seções e itens do arquivo de referência.
