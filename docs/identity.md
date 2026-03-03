# IDENTIDADE VISUAL — MultiClínicas

## Stack Técnica
- Tailwind CSS para toda estilização (NUNCA criar arquivos .css separados).
- shadcn/ui como base de componentes, customizados via className.
- Todos os valores visuais definidos como TOKENS SEMÂNTICOS no tailwind.config.
- NUNCA usar valores hardcoded no código — sempre tokens semânticos.
- NUNCA usar cores/radius/sombras padrão do Tailwind — apenas tokens deste documento.
- A IA que implementa é RESPONSÁVEL por criar SVGs originais e composições visuais únicas baseadas nas descrições abaixo — NÃO use decoração genérica (blobs, dot grids, partículas) como substituto.
- A paleta usa UMA cor accent forte (Roxo Vibrante) e sua transição oficial de marca (para Ciano) + neutros baseados em Branco/Gelo. NÃO crie arco-íris de categorias. 

## Setup Necessário (instalar antes de buildar)

### Libs adicionais
| Lib | Pra quê | Instalação |
|---|---|---|
| `framer-motion` | Micro-interações de agendamento (ex: transição suave entre a escolha da data e hora) | `npm i framer-motion` |

---

## A Alma do App
A saúde encontra a fluidez. MultiClínicas transforma a ansiedade da burocracia médica na tranquilidade de um clique de Uber, oferecendo aos pacientes um caminho silencioso e sem atritos, e às clínicas, um centro de comando impecável, invisível e focado em conversão.

---

## Referências e Princípios
- **Calendly:** Extremo foco na rota de conversão (paciente focado apenas no binômio Data/Hora). → **Princípio:** Ocultar complexidade até que seja necessária. → **Aplicação:** A interface B2C do paciente não tem sidebars ou menus de hambúrguer complexos, é um funil linear focado em cards de ação.
- **Stripe / Notion:** Uso magistral de espaços em branco (Light mode), tipografia densa porém legível, e ausência de caixas pesadas. → **Princípio:** Estrutura invisível. → **Aplicação:** O dashboard B2B usa fundos "gelo" com cards brancos de bordas finíssimas (border-subtle) e sombras hiper-suaves, parecendo flutuar sobre a mesa de uma recepcionista organizada.

---

## Decisões de Identidade

### ESTRUTURA

#### Visão do Paciente (B2C)
**O que:** Layout focado em "Bottom Sheets" (gavetas inferiores) e "Cards Empilhados" em mobile.
**Por que:** O paciente está no celular, geralmente com pressa ou desconforto. Ele não quer navegar num "sistema", quer completar uma tarefa.
**Como:** Uso intensivo de `max-w-md mx-auto` para simular a proporção mobile mesmo no desktop. A navegação flui para frente e para trás, não pelos lados.
**Nunca:** Usar sidebars laterais pesadas ou barras de navegação com múltiplos links (Home, Sobre, Contato) na rota de agendamento.

#### Visão da Clínica (B2B)
**O que:** "Canvas Aberto". Uma sidebar lateral retrátil, com a área principal (agenda/métricas) ocupando 90% da tela.
**Por que:** Recepcionistas precisam de densidade de informação sem poluição visual. O espaço em branco reduz a fadiga ocular de quem passa 8 horas olhando para a tela.
**Como:** Fundo `surface-page` (gelo), cards de conteúdo em `surface-card` (branco puro). Tabelas sem divisórias verticais pesadas, apenas linhas horizontais sutis `border-subtle`.
**Nunca:** Paineis cinza-escuro (estilo software Windows 2000) ou botões 3D com sombras internas.

### LINGUAGEM

#### Tipografia
**O que:** Fontes sem serifa, geométricas e de alta legibilidade (ex: Plus Jakarta Sans ou Inter). Pesos distintos: Bold para números e horários, Regular para nomes.
**Por que:** Transmite precisão médica e modernidade tecnológica.
**Como:** `text-primary` para horários e nomes de médicos (peso 600/700). `text-muted` para especialidades e durações (peso 400).
**Nunca:** Fontes serifadas clássicas que remetam a hospitais antigos ou documentos jurídicos.

#### Cores como Sistema (A Regra da Cor Única adaptada)
**O que:** O fundo é Branco/Gelo absoluto. O texto é em tons de chumbo/grafite. A cor de ação (Accent) é o **Roxo Vibrante** da marca. O gradiente da marca (Roxo para Ciano) é tratado como uma "joia", usado **apenas** no botão principal de conversão ("Confirmar Agendamento") ou no ícone central da clínica. 
**Por que:** Mantém a interface clínica, higiênica e profissional (Light Mode), enquanto o roxo/ciano guia os olhos apenas para o que gera valor.
**Como:** Elementos interativos secundários usam o Roxo sólido (`accent-primary`). Apenas o botão de ouro (primário) recebe o `accent-gradient`.
**Nunca:** Usar verde, vermelho, amarelo ou azul para pintar cards de diferentes especialidades médicas. A interface não é um arco-íris.

### RIQUEZA VISUAL ← O CORAÇÃO DA IDENTIDADE

#### Textura Ambiente
**O que:** Padrão sutil de "Linhas Isométricas de Topografia / Pulso".
**Temática:** Uma mistura visual entre um eletrocardiograma altamente minimalista e curvas de nível arquitetônicas. Simboliza "vida em constante e suave movimento".
**Tratamento:** Linhas em SVG vetorial cruzando suavemente o background da página, com opacity de 2% a 3%. Cor: chumbo muito claro. Estático no dashboard, com uma levíssima animação (deslizamento horizontal infinito de 60s) na tela de login/boas-vindas. NUNCA usar gradientes coloridos no fundo.

#### Conceitos Visuais por Componente

##### 1. Card de "Seleção de Horário" (B2C - Paciente)
**Representa:** A busca pelo momento perfeito e tranquilo no dia agitado do paciente.
**Metáfora visual:** O arco do sol (a jornada do dia).
**Cena detalhada:** No topo do card, um arco (meio-círculo) traçado com uma linha fina e tracejada `border-subtle`. Este arco representa o dia (das 08h às 18h). Sobre este arco, um pequeno círculo sólido na cor `accent-primary` repousa na posição exata correspondente ao horário que o usuário selecionou na lista abaixo (ex: se selecionou 10h, o ponto está a ~25% do arco esquerdo). Abaixo do arco, a hora selecionada aparece em tipografia grande e limpa. A cena evoca "este é o seu momento do dia".
**Viabilidade:** CÓDIGO PURO (SVG simples composto por `<path d="M..." arc>` e um `<circle>`).

##### 2. Card de "Métrica de Absenteísmo / No-Show" (B2B - Gestão)
**Representa:** O fluxo de pacientes que efetivamente chegam à clínica vs. os que faltam (furos na agenda).
**Metáfora visual:** Uma rota de conexão onde algumas linhas chegam ao destino e outras se dissipam.
**Cena detalhada:** Uma linha principal reta horizontal saindo da esquerda e chegando a um ícone minimalista geométrico (um prédio/clínica) na direita. Pela linha principal viajam pequenos nós sólidos (`accent-primary`) representando os pacientes que compareceram. No meio do caminho, uma linha secundária curva e tracejada se bifurca para baixo em 45 graus, esmaecendo até 0% de opacidade. Pequenos nós ocos viajam por essa bifurcação fantasma, representando as faltas. É a visualização da perda, sem precisar de gráficos de pizza corporativos.
**Viabilidade:** CÓDIGO PURO (SVG com linhas, caminhos tracejados e animações CSS simples no `stroke-dashoffset`).

##### 3. Card de "Resumo Financeiro da Clínica" (B2B - Gestão)
**Representa:** A saúde financeira do negócio, o pulso vital da clínica.
**Metáfora visual:** Um eletrocardiograma que se transforma em uma rampa de crescimento.
**Cena detalhada:** Uma linha contínua em SVG. Ela começa na esquerda imitando o pico e vale rápido de um batimento cardíaco (fino, cor `text-muted`). Logo após o batimento, a linha se suaviza e começa a subir em uma curva de tendência positiva. A parte que sobe ganha a cor `accent-primary`, e a área abaixo dessa curva tem um levíssimo preenchimento que esmaece para transparente em direção à base do card.
**Viabilidade:** CÓDIGO PURO (SVG `<path>` com `fill="url(#gradiente-fantasma)"` na área).

##### 4. Card do "Médico / Especialista" (B2C e B2B)
**Representa:** A expertise, o ser humano no centro do cuidado, ao redor do qual orbitam as informações.
**Metáfora visual:** Uma órbita planetária de especialidades.
**Cena detalhada:** Um avatar redondo do médico no centro. Ao redor do avatar, dois anéis finíssimos e concêntricos de poeira geométrica (linhas circulares tracejadas com gap largo, 5% de opacidade). Nesses anéis, repousam 2 ou 3 micro-ícones geométricos (uma cruz mínima, uma cápsula, um coração) representando o que ele trata. Os ícones giram de forma imperceptível (360 graus a cada 40 segundos). Transmite que o profissional é o núcleo daquele universo de cuidado.
**Viabilidade:** CÓDIGO PURO (Avatar + círculos SVG com `animate-spin` muito lento).

##### 5. Empty State de "Agenda Vazia" (B2B - Recepção)
**Representa:** O dia ainda intocado, limpo, pronto para ser organizado, não um "erro" por falta de dados.
**Metáfora visual:** Uma mesa limpa com uma agenda aberta e luz da manhã.
**Cena detalhada:** Ilustração isométrica wireframe (apenas as arestas, sem preenchimento). Mostra o contorno de um livro aberto (a agenda) e ao lado, o contorno de uma xícara (rotina). Não há cores preenchendo as formas, exceto um pequeno "marcador de página" geométrico na agenda que brilha suavemente na cor `accent-primary`. Todo o resto é feito de linhas `text-muted` (cinza clarinho). O aspecto é arquitetônico e calmo.
**Viabilidade:** CÓDIGO PURO (SVG de paths desenhando formas isométricas básicas) ou ASSET EXTERNO se necessário (SVGMaker.io).
**Alternativa simplificada:** Um retângulo isométrico (a agenda) com 3 linhas retas indicando páginas, e um dot roxo flutuando.

---

## Tokens de Design

### Cores — Fundos (A Base "Gelo")
| Token | Valor | Uso |
|---|---|---|
| `surface-page` | `#F8FAFC` (Slate 50) | Fundo principal da tela, passa a sensação de hospitalidade limpa |
| `surface-card` | `#FFFFFF` (White) | Cards de conteúdo, inputs, modais |
| `surface-elevated` | `#FFFFFF` | Elementos que flutuam sobre cards, menus dropdown (com sombra extra) |

### Cores — Texto
| Token | Valor | Uso |
|---|---|---|
| `text-primary` | `#0F172A` (Slate 900) | Títulos, horas de agendamento, nomes de pacientes/médicos |
| `text-secondary` | `#475569` (Slate 600) | Apoio, legendas de UI, descrições de convênios |
| `text-muted` | `#94A3B8` (Slate 400) | Hints em inputs, placeholders, dados secundários |

### Cores — Accent (O DNA da Marca)
| Token | Valor | Uso |
|---|---|---|
| `accent-primary` | `#7C3AED` (Purple 600) | A COR base de interação — ícones ativos, foco em inputs, links, checkboxes, nós de gráficos |
| `accent-hover` | `#6D28D9` (Purple 700) | Hover state de botões secundários |
| `accent-subtle` | `rgba(124, 58, 237, 0.08)` | Fundos translúcidos para badges (ex: "Consulta Confirmada") |
| `accent-gradient`| `linear-gradient(to right, #7C3AED, #06B6D4)` | O "Ouro" do App. Usado ESTRITAMENTE no botão primário de conversão ("Confirmar Horário") e no logotipo. |

### Cores — Status (Apenas feedback)
| Token | Valor | Uso |
|---|---|---|
| `status-success` | `#10B981` (Emerald 500) | Checkout concluído, pagamento aprovado |
| `status-error` | `#EF4444` (Red 500) | Erro no agendamento, cancelamento |
| `status-warning` | `#F59E0B` (Amber 500) | Pagamento pendente, aguardando aprovação |

### Bordas
| Token | Valor | Uso |
|---|---|---|
| `border-default` | `#E2E8F0` (Slate 200) | Contornos padrão de inputs |
| `border-subtle` | `#F1F5F9` (Slate 100) | Divisórias levíssimas de tabelas, contorno invisível de cards |

### Geometria
| Token | Valor | Uso |
|---|---|---|
| `radius-card` | `16px` | Cards B2C (mais amigáveis, quase pill-shaped nos cantos) |
| `radius-panel`| `12px` | Dashboards B2B (mais eficientes para organizar dados na tela) |
| `radius-button` | `999px` (Full) | Botões de ação, evoca botões físicos convidativos |

### Sombras (Hiper limpas, estilo Stripe)
| Token | Valor | Uso |
|---|---|---|
| `shadow-card` | `0px 2px 8px rgba(15, 23, 42, 0.04)` | Cards base no dashboard |
| `shadow-float` | `0px 12px 32px rgba(15, 23, 42, 0.08)`| Modais, Bottom Sheets, Dropdowns |

---

## Componentes Shadcn — Overrides

| Componente | Override (usando tokens) |
|---|---|
| `<Card>` | `bg-surface-card border-border-subtle shadow-card rounded-card` |
| `<Button variant="default">` | `bg-accent-gradient text-white rounded-button shadow-float font-bold border-none` |
| `<Button variant="outline">` | `bg-transparent border-border-default text-text-primary rounded-button hover:bg-surface-page` |
| `<Badge>` | `bg-accent-subtle text-accent-primary rounded-full px-3 py-1 font-medium` |
| `<Input>` | `bg-surface-card border-border-default rounded-panel text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary` |

---

## Regra de Ouro

Ao criar qualquer tela ou componente:
1. Siga TODAS as decisões de identidade (estrutura clean + linguagem clínica moderna + riqueza visual conceitual).
2. Use shadcn/ui como base, customizado via className.
3. APENAS tokens semânticos — nunca escreva `bg-purple-600` ou `shadow-md`.
4. A base é Branca/Gelo. O roxo dita a ação. O gradiente coroa a conversão. Nenhuma outra cor decorativa.
5. Componentes importantes DEVEM ter CONCEITO VISUAL — uma ilustração/cena SVG original (como o arco do sol para horários ou a bifurcação de no-shows).
6. NÃO substitua conceito por decoração genérica — um blob atrás de um calendário é preguiça visual; um arco de tempo é conceito.
7. A IA implementadora é RESPONSÁVEL por criar os SVGs geométricos descritos.
8. **A alma do app em 1 linha:** O rigor de um centro cirúrgico com a suavidade de um aplicativo de mobilidade moderno.

## Teste Final
Coloque o MultiClínicas ao lado de um template SaaS médico padrão.
Se o outro template parece uma planilha decorada com ícones da saúde, e o seu parece uma **superfície de vidro com gráficos vetoriais que contam histórias de tempo, fluxo e saúde**... você acertou a identidade.