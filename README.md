# Moodle Unipampa — protótipo navegável (visão do aluno)

Redesenho da interface do Moodle institucional da Unipampa, feito para o trabalho prático da disciplina de **Interação Humano-Computador**. É um site estático de alta fidelidade: tudo é navegável, mas nada é enviado ou salvo. Os dados são fictícios.

## O que dá para explorar

| Tela | Endereço |
|---|---|
| Página inicial | `#/` |
| Painel (linha do tempo, acessados recentemente, calendário) | `#/painel` |
| Meus cursos (busca, situação, favoritos, área, ordenação, cartões/lista) | `#/cursos` |
| Calendário geral (filtro por curso, agenda do dia) | `#/calendario` |
| Curso, aba Curso (semanas, atividades, barra lateral com calendário, avisos e informações) | `#/curso/ihc` |
| Abas Participantes, Notas e Atividades | `#/curso/ihc/participantes`, `/notas`, `/atividades` |
| Plano de ensino e todos os avisos | `#/curso/ihc/plano`, `#/curso/ihc/avisos` |

Cursos disponíveis: `ihc`, `web`, `bd`, `ia`, `pi` (em andamento) e `alg`, `calc` (concluídos). Qualquer outro endereço mostra a página "Página não encontrada" do próprio site. Itens sem tela própria (abrir PDF, enviar tarefa, perfil…) mostram o aviso "Disponível apenas na versão completa do Moodle".

O "hoje" do protótipo é fixo em **domingo, 08/11/2026**, para que prazos e situações fiquem coerentes.

## Como abrir

Abra `index.html` direto no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Testes de padronização

```bash
npm test
```

Os testes (Node 20+, sem dependências) verificam:

- **Padronização visual:** nenhum emoji ou símbolo usado como ícone (só SVG), todo botão usa o componente `.btn`, e espaçamentos e raios só usam os tokens `--s-*` e `--r-*`.
- **Privacidade:** nenhum e-mail ou nome real de terceiros.
- **Coerência dos dados:** datas válidas, pesos e situações.
- **Telas:** conteúdo de cada tela e de cada rota.

## Estrutura

```
index.html, 404.html        página única e redirecionamento do GitHub Pages
css/styles.css              tokens de design e componentes
js/icons.js                 ícones SVG
js/data/*.js                cursos e dados fictícios
js/logic.js                 rotas, datas, situações, filtros, calendário
js/ui.js, js/views/*.js     componentes e telas
js/app.js                   estado, roteamento e eventos
tests/                      testes automatizados
docs/superpowers/           especificação e plano de implementação
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie o projeto (`git push`).
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. O site fica em `https://<usuario>.github.io/<repositorio>/`.

## Observações

- Professores, colegas, notas e avisos são fictícios. O conteúdo das semanas de IHC segue a estrutura do Moodle real da disciplina.
- Ícones baseados no conjunto [Lucide](https://lucide.dev) (licença ISC).
