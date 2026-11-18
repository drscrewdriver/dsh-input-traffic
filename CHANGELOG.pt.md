# Histórico de alterações

Registradas aqui todas as mudanças importantes e correções de bugs. As versões seguem o versionamento semântico (instalado com `dsh plugin --profile web add dsh-input-traffic`).

- [Changelog em inglês](./CHANGELOG.md)
- [Changelog em japonês](./CHANGELOG.ja.md)
- [Changelog em coreano](./CHANGELOG.ko.md)
- [Changelog em português](./CHANGELOG.pt.md)

## 0.7.16 (2026-11-18)

Dos três defeitos secundários da issue #5, dois se confirmam no código-fonte e foram corrigidos; o terceiro (estado preso sem porta de recuperação) é uma quebra na cadeia de despacho do host e não foi tocado nesta rodada — veja a explicação abaixo.

### Correção: esvaziar a fila congelada deixava um falso estado congelado

Os quatro mutators do `freeze-store` (`updatePendingAt` / `setTierAt` / `removePendingAt` / `movePending`) gravavam o estado fixo como `{ frozen: true, pending: next }`. Depois de apagar a última pendência sobrava `{ frozen: true, pending: [] }` — o selo nunca desaparecia, enquanto novas mensagens continuavam sendo enviadas: puro resíduo de exibição.

Agora o estado é derivado por `writePending()`: `frozen = cur.frozen && pending.length > 0`. Fila vazia descongela; com fila não vazia os mutators não podem alterar o estado de congelamento definido explicitamente pelo usuário. Como `freezeStore.set` já removia a sessão quando "não congelada e lista vazia", bastava calcular corretamente o sinalizador.

**Correção espelhada incluída de brinde** (não consta no relatório): o bloco do composer só era abaixado por `resume()`. Depois de a fila ser esvaziada pelo dock, o store passava a não-congelado e o banner sumia, mas **a caixa de entrada continuava inerte** — o congelamento visível tinha ido embora, o cadeado invisível ficara. Agora o `FreezeButton` lembra em `raisedBlock` "o bloco erguido por este controle" e o abaixa sozinho quando o store reporta não-congelado; limpa apenas o bloco que ele mesmo ergueu, sem disputar com outros raisers.

### Correção: a regra de ocultação da fila oficial ficava vazia no 0.2.2-rc.3

`HIDE_OFFICIAL_QUEUE_CSS` tinha originalmente uma única regra `[class*="_7yHdaG_dock"]` — hash de css-module. Medido na compilação atual do host, `_7yHdaG` aparece **0 vezes** (o mesmo módulo foi re-hashed para `F07MqG`), ou seja, a regra ficou vazia: quando o dock do plugin caía no fallback de falha, o `QueueDock` oficial deixava de ser ocultado e seu botão de aparte por linha duplicava o nosso nível amarelo.

O host traz no nó raiz do dock um atributo estável próprio, `data-queue-dock=""` (`QueueDock.tsx`: `jsx('div', { className: css.dock, 'data-queue-dock': '' })`), independente de hash e de locale. Agora `[data-queue-dock]` é a regra principal e a de hash fica como reserva para hosts antigos. Não usamos fallback por aria-label — o botão de aparte oficial renderiza o mesmo rótulo do nosso nível amarelo, e a regra por atributo acabaria atingindo a nós mesmos (a "segunda rede" prometida pelo comentário antigo na verdade não era utilizável).

### Correção: a virada de estado congelado ficava presa nas idas-e-voltas de remoção da fila

O `freeze()` antigo primeiro executava `await Promise.all(updateQueue(...))` e só depois gravava no store. Cada `updateQueue` é uma ida e volta remota, e durante todo esse período o texto do botão e o selo não mudavam — o usuário achava que não funcionara e clicava de novo, o que é metade do "dois cliques às cegas" do #5. Agora o store é gravado primeiro (o `pending` já fora calculado antes, então adiantar a gravação não perde a fila) e a remoção da fila vem depois.

### Não corrigido: fila presa depois de cancelar um steer (lado do host)

A causa raiz do bug principal do #5 está no host: o ramo de abort de `turn()` lança direto e não chega ao retorno de continuação do `hasPending` no fim; a condição de rearmamento no fechamento do `kick()`, `wakeRequested`, nunca é armada quando o enfileiramento ocorre durante a execução normal. Do lado do plugin não há como resolver isso sem alterar a cadeia de despacho do host.

As duas rotas de mitigação validadas no relatório (auto-congelamento após o travamento / re-envio automático após o travamento) funcionam, mas ambas precisam decidir "ocioso + fila não vazia = presa", e esse critério **também é verdadeiro no instante de dreno normal do host** (`running` é dirigido pela projeção e existe uma janela de quadros vazios). O custo de um falso positivo é interromper uma continuação normal — pior do que o problema que pretende resolver. Por isso não foi implementado nesta rodada; registramos no README a ação de recuperação para esse estado.

- i18n: adicionado o locale português (pt-BR) — dicionário em tempo de execução, metadados do pacote e espelhos de README/INSTALL/CHANGELOG.

## 0.7.15 (2026-11-17)

### Correção: os intervalos peer do 0.7.14 faziam o instalador não resolver rc, e o plugin não instalava

O 0.7.14 escreveu os seis peers `@deepseek-ai/dsh-client-*` / `dsh-session` como intervalos limitados `>=0.1.0-rc.2 <0.3.0-0`. **Esse intervalo não casa com nenhuma versão de pré-lançamento**: o node-semver só aceita um prerelease quando os tuplos de fronteira são compartilhados, e a fronteira de `<0.3.0-0` é `0.3.0` enquanto a versão a casar é `0.2.x-rc.*` — tuplos diferentes, veredito "não satisfaz". Medido:

```js
semver.satisfies('0.2.1-rc.5', '>=0.1.0-rc.2 <0.3.0-0')  // false
semver.satisfies('0.2.2-rc.3', '>=0.1.0-rc.2 <0.3.0-0')  // false
```

Todas as versões utilizáveis do host hoje são da linha rc, então o pnpm/npm falhava já na fase de install (`ETARGET` / `ERR_PNPM_OUTDATED_LOCKFILE`). A enumeração de peers do 0.7.13 estava correta; o 0.7.14 foi um retrocesso.

### Maneira de corrigir

- Os seis peers voltaram a ser **enumeração exata** (idêntica ao 0.7.13, incluindo `0.2.1-rc.5` / `0.2.2-rc.1`). A tabela de enumeração só lista linhas de host já verificadas: é melhor escrever mais itens explicitamente do que deixar o interpretador adivinhar por nós.
- `engines.dsh` **mantém o intervalo limitado** `>=0.1.0-rc.2 <0.3.0-0` — quando o host o lê, usa `includePrerelease`; só os interpretadores do npm precisam da enumeração. As duas semânticas são diferentes e não se podem unificar.
- Correção de metadados puros, com diff zero no código em tempo de execução.

## Não lançado

### Correção: contexto injetado não ocupa mais a área de espera

A faixa `next-step` mistura dois tipos de linha: inserções reais de gente (`source.kind === 'user'`, que o controlador web marca com `rpcId`) e contexto que serviços/plugins empurram para o modelo (notificações `user-approval` / `policy` / `time-context` do próprio host e pareceres de plugins de terceiros). A implementação antiga desenhava todo o `next-step` como "aparte em curso", e assim avisos de sistema como "The approval policy changed from "ask" to "never"" apareciam na área de espera do usuário — com botões de editar / reordenar / reenviar, operações abertas sobre algo que não foi escrito por gente. Agora existe a função pura `isHumanSteer(row)` e a faixa amarela só desenha apartes humanos; linhas antigas sem `source` (fixtures locais, hosts antigos) continuam visíveis, sem atingir a fila verdadeira. O contexto em si segue entrando normalmente no modelo.

## 0.7.7 (2026-10-27)

Correções de duas issues externas (feidky); sem mudança na face de compatibilidade do host, e a enumeração `engines.dsh` e os peers permanecem os do 0.7.6.

### Correção: auto-recolhimento com várias mensagens na fila disputava o abrir/fechar com o usuário (issue #4)

- Com várias mensagens na fila a lista fica **expandida por padrão** (`listVisible` mantém a exibição direta de linha única): o valor de uma informação enfileirada é exatamente ser visível.
- Removido o effect de recolhimento automático "fila esvaziou → `setCollapsed(true)`"; o estado recolhido passa a ser decisão somente manual do usuário.
- A chave de persistência subiu para v2 (`dsh-input-traffic:collapsed:v2`): o valor v1 continha escritos do recolhimento automático, que não eram escolha do usuário e não podiam se sobrepor ao novo padrão.
- Latch `collapseTouched`: enquanto o cabeçalho não for clicado manualmente, **nada é escrito no storage**, para a primeira moldura não materializar o padrão como decisão.

### Correção: o vermelho "interromper e enviar" despevava a linha do topo da fila quando havia várias pendências (issue #3)

- Causa raiz (determinística, não corrida): o despertar do host acontece apenas por `followup`, e o `followup` sempre acrescenta ao **fim** de `next-turn` (`agent.ts`, `inbox.splice(…, Infinity, …)`); após o despertar, o driver consome pela **frente** da fila em FIFO. A implementação antiga `cancel → remove(alvo) → send(alvo)` fazia o alvo cair no fim da fila, e o consumido era o topo. Além disso o mode de `conversation.send()` estava fixo em `queue`, sem relação com a configuração `busyEnter`.
- Fluxo novo: `cancel` (o host estaciona a fila e não reivindica durante a convergência) → extrai todas as demais linhas → `send(alvo)` (a essa altura é a única, ou seja, o topo) → reenvia as restantes na ordem original.
- Semântica: o vermelho lança somente a própria linha; as demais (incluindo as de aparte amarelo) são degradadas de volta ao nível verde de espera — na rodada interrompida não existe "próximo step" onde inserir.
- Ordem: `cancel` foi promovido para o início, e todas as extrações ocorrem depois do estacionamento, eliminando a janela de "ser consumido no meio da extração".
- Se o `send(alvo)` falhar, as demais linhas da fila são ainda assim restauradas (try/finally) — a fila não é engolida; `queue-item-not-found` é tratado como já reivindicado pelo host e essa linha não é reenviada (evita entrega duplicada).

### Limitação: linhas com anexo continuam travando o vermelho

- O reenvio só tem um canal, `send(text)`: o `receiptId` de blocos `file` é de uso único, sem resolução reversa; imagens exigiriam reler os bytes via `readAttachment` (não implementado).
- Por isso, quando alguma pendência contém conteúdo não textual o vermelho fica desabilitado para **a fila inteira** (não só aquela linha), e o texto da mensagem passou a ser redigido do ponto de vista da fila — nos 9 idiomas então existentes no dicionário.
- A solução de raiz exige que o host ofereça operações de posição na fila (`move` / `prepend`); então os cadeados de anexo do vermelho e da reordenação podem cair juntos.

0.7.6: adendo de enumeração de hosts para DSH 0.2.1-rc.3 (versão só de declaração; diff zero na face de contratos).

## 0.7.5 (2026-10-18)

- hosts: adicionada a enumeração declarativa de 0.2.1-rc.2 (34/34 peers de host `@deepseek-ai/*` verificados pacote por pacote no npm com rc.2 na versão; este plugin não toca o provedor `ctx.web` nem o slot `conversation.input.model.label`, código inalterado — versão de metadados puros; a célula rc.2 na fazenda de testes fica em espera).

## 0.7.3 — 2026-10-08

### Novo: ponte de dados de configurações (T20-b, forma generalizada do porte do perm-gate 5260fe6)

- Nas linhas antigas (≤0.1.5) o manipulador de configurações do cliente nunca resolve (beco sem saída do settingsScope), o cartão da família degradava para "serviço de configurações indisponível" e o valor fixado de busyEnter falhava em silêncio. A metade node deixou de ser no-op: o loader passou a declarar `inject=['webServer']` com a sub-injeção `settings` recebendo a referência viva, expondo `/api/ui-conversation/settings/{describe,mutate}`; na metade client, o `BridgeDocHandle` funciona em trilha dupla (manipulador nativo primeiro, ponte como reserva) e o valor fixado, quando o nativo falta, é reemitido uma vez após o primeiro pronto da ponte. Premissa comprovada: o host 0.1.0 já traz toda a face describe/mutate/redactSecrets do serviço de configurações, então a linha mais antiga não precisa de reserva. Cinco células de aceitação: dados reais nos cartões das quatro linhas de ponte, 0.1.7 nativo sem regressão, e escrita via ponte chegando ao disco.
- Corrigido de passagem o hook condicional do family-card (`useSyncExternalStore` chamado sem condição; o instantâneo degradado passou a usar uma constante de módulo).

### 0.7.1 / 0.7.2 não tiveram publicação própria (distribuição direta de tgz nas cinco células) e entraram no npm com esta versão

- 0.7.0: linha de versão única com enumeração de 15 rc (seis peers × 15 rc todos existentes), latest + quatro tags de linha convergidas (publicado).
- 0.7.1: registro de `dsh-family.tab` promovido ao topo + referência viva `scopeRef` (correção da ausência dos cartões de seção de família em ≤0.1.5).
- 0.7.2: a callback da cintura de configurações passou a ler os serviços por nome a partir do objeto de escopo, conforme o contrato cordis (chamada de serviço solta = TypeError a cada geração e fibra morta em silêncio; o valor fixado de busyEnter nunca havia entrado em vigor por essa razão).

## 0.5.5 — 2026-09-30

### Correção: linhas da fila passaram a ler da projeção do inbox (correção de renderização em host real, medido em 0.1.7-rc.2)

- Num host real as linhas enfileiradas não estão no instantâneo da sessão: o componente passou a ler de `useProjection('inbox')` (next-turn = fila/nível verde, next-step = aparte/nível amarelo), mesma fonte do QueueDock oficial. A leitura anterior de `s.queue` usava um campo inventado por espelhamento de tipos, cuja renderização sempre quebrava e retrocedia para a fila oficial.
- `queueMutable` alinhado ao julgamento oficial: contextos de subagente continuable também são operáveis (antes, o bloco inteiro de botões de ação desaparecia em sessões de subagente).
- Removido o botão "devolver à caixa de entrada", inoperante em máquina real (`setDraft` é face não documentada); o nível amarelo é a única porta de aparte.
- O texto da linha passou a ser derivado dos blocos de conteúdo (`textOf`, alinhado ao `textOf`/`previewOf` oficial), corrigindo a prévia de linha em branco.
- As bolinhas de cor dos três níveis voltaram a cores literais fixas: peles personalizadas (como ui-skin-maid-atelier) que redefinem o alias warn faziam o amarelo ficar invisível.
- CSS de supressão do container do QueueDock oficial (rede de visibilidade apenas no estado de fallback de falha); corrigida a asserção obsoleta do verify-assembly (settingsScope → configForms).

## 0.5.4 — 2026-09-29

### Correção: linha de base devDeps da linhagem 0.1.7 alinhada + quebra de renderização do ícone do dock

- Três pinos obsoletos de devDeps foram nivelados para a linha 0.1.7: `client-ui-primitives ^0.0.1-rc.1` (`^0.0.x` nunca alcança 0.1.x), `client-store` / `util-workspace-path ^0.1.2-alpha.2` (travados pelas regras de resolução de pré-lançamento) → todos em `^0.1.7-rc.1` (instalado rc.2).
- O código acompanhou a renomeação das exportações de ícones `*16`/`*14` do primitives (a partir de 0.1.7-rc.1 restou apenas a família `*Medium`/`*Regular`): 8 ocorrências passaram a `*Medium`.
- **Esta versão substitui o tarball quebrado publicado como 0.5.3**: o bundle do 0.5.3 referenciava externamente nomes de exportação de ícones inexistentes no primitives 0.1.7 e quebrava a renderização do dock num host 0.1.7 real — os pins obsoletos de devDeps escondiam isso como falso verde de compilação.
- Ambiente de testes endurecido: caminhos exclusivos do host viraram stub + devDep explícita da pilha micromark/mdast + `react-dom` fixado em 18 (5 suítes e 59 casos executados de verdade).

## 0.4.1 — 2026-09-20

### Correção: a alça de "ajustar a largura da conversa" roubava os cliques dos botões do fim da fila de espera

- **Sintoma**: os botões "cancelar e limpar" e os três níveis de planejamento (verde/amarelo/vermelho) do cartão da fila caíam dentro da alça de largura de toda a altura no lado direito da coluna de conversa (`div.wSkVaW_widthHandle[data-side="right"]`); o clique era interpretado pela alça como arrasto e os botões ficavam inoperáveis.
- **Causa raiz**: a alça está em `.body` (`position: absolute`, `z-index: 8`), enquanto o assento do composer `.composerSeat` é um contexto de empilhamento com `z-index: 7`; o `.dock` deste plugin era `width: 100%` (ocupava toda a pilha do composer), cerca de 32px mais largo que o cartão de entrada, e os controles do fim entravam na faixa de acerto da alça. Sendo descendente dentro de um contexto de empilhamento, o dock não consegue sair dessa camada por `z-index` — restava ceder geometricamente.
- **Correção**: o `.dock` foi estreitado para a mesma coluna de cartão do `QueueDock` oficial — descontando da largura da pilha as duas folgas e os dois recuos de dock, com teto igual à largura do cartão do composer menos os recuos internos, centralizado com `margin: 0 auto` e devolvendo os recuos via `padding`, de modo que o painel continue alinhado ao cartão de entrada; além disso um teto superior `--dsh-chat-content-width` é combinado com `min()`, garantindo à borda direita do painel uma faixa de segurança estável de 24px da borda interna da alça (em colunas estreitas a alça tem largura 0 e o `min()` recai sozinho na largura da coluna de cartão). Sonda geométrica em Chrome offline: no cenário alinhado, a folga alça→painel passou de 24,5px para 48,5px; num cenário deslocado 16px, de 8,5px para 32,5px, e os quatro botões são acertados por `elementFromPoint` em si mesmos.

## Não lançado

### Mudança: suporta apenas DSH 0.1.5+, linha compat/0.1.5 (0.2.12-beta.1)

- **`engines.dsh` estreitado para `>=0.1.5-alpha.1 <0.2.0-0`**: o 0.1.5 introduziu Session V3 (nós de superfície), a reescrita do Sidebar em dockkit e o composer Lexical. A apuração confirmou que as três âncoras de slot usadas por este plugin (`conversation.input.dock` / `conversation.input.right` / `settings.general.item`) permanecem no 0.1.5 e que os remotos `session.updateQueue` / `prompt` / `cancel` não têm quebra registrada — portanto **diff estrutural zero no código**; apenas o segmento compatível foi estreitado. Usuários de DSH 0.1.2/0.1.3 devem permanecer na linha main (0.2.11-beta.1).
- **Todos os intervalos peer `@deepseek-ai/*` estreitados em sincronia** para `>=0.1.5-alpha.1 <0.2.0-0` (`@deepseek-ai/cordis` permanece `^4.0.1`).
- **Âncoras de contrato de tipos**: as âncoras espelhadas de `src/types/contracts.d.ts` foram verificadas em 2026-09-11 contra `dsh-v0.1.5-rc.2`; esta versão apenas atualiza o segmento suportado no cabeçalho para a segmentação 0.1.5.
- **Comentários modernizados**: os comentários de histórico de dupla versão 0.1.1/0.1.2 em `src/client/index.ts` e `freeze-button.tsx` foram reescritos para a realidade 0.1.5 (incluindo os slots adjacentes novos do 0.1.5, `conversation.composer.dock` / `conversation.input.left`). Sem mudança de comportamento.
- **Nova seção no README "Regressões conhecidas do 0.1.5"** (lado do host, não bugs do plugin): herança de prompts enfileirados ao derivar sessão (#6314/#6197), composer Lexical sob IME (#6231/#6052), steer sem preempção durante espera bloqueante (#6030) e cache obsoleto do combo de cliente após atualização, exigindo recarga forçada (#5999/#6374).
- ⚠️ **Declaração de ausência de verificação em máquina real**: esta versão foi publicada sem ambiente DSH 0.1.5 real (lint/teste/compilação/montagem aprovados + conferência estática dos contratos documentais); as três faces não documentadas `input.for(actx)` / `blocks.set` / props de injeção do dock aguardam regressão em máquina real (lista em checklist.md no repositório).

### Quebra de compatibilidade: suporta apenas DSH 0.1.2+, conclusão da substituição do `dsh-client-runtime` (0.2.11-beta.1)

- **`engines.dsh` estreitado para `>=0.1.2-alpha.1 <0.2.0-0`**: `@deepseek-ai/dsh-client-runtime` foi integralmente removido em 0.1.2-alpha.1 (commit `be531688f3`), e essa versão é o ponto de corte rígido deste plugin. A linha anterior (≤0.2.10-beta.2) continua atendendo DSH 0.1.0/0.1.1.
- **`ClientContext` / `SessionId` passaram a vir dos pacotes proprietários reais**: `src/client/index.ts` agora faz `import type { Context as ClientContext } from '@deepseek-ai/cordis'` e `import type { SessionId } from '@deepseek-ai/dsh-session/types'`, igual aos plugins oficiais de cliente.
- **Contrato removeu o espelho `dsh-client-runtime`**: `src/types/contracts.d.ts` eliminou `declare module '@deepseek-ai/dsh-client-runtime/client'`; `QueuedMessage` / `SessionSnapshot` / `ISessions` voltaram para `@deepseek-ai/dsh-api-session-controller/client` e `SnapshotSelectorHook` voltou para `@deepseek-ai/dsh-client-store`.
- **Novo `src/types/cordis-augment.d.ts`**: declara `slots` / `sessions` / `locale` / `settingsScope` / `conversation` sobre o `Context` do cordis (a prática dos plugins oficiais de cliente), substituindo o `ClientContext` removido; `ctx.get<IConversation>('conversation')` passou a `ctx.get('conversation')`, porque o `get` verdadeiro do cordis decide o tipo de retorno por `Context[K]`.
- **`SettingsScopeSnapshot` completou `base` / `user` / `revision`**, e `SettingsScopeFace.bind` ganhou um `decode` opcional.
- **Novo peerDependency `@deepseek-ai/dsh-session`**; os demais peers `@deepseek-ai/dsh-client-*` foram estreitados em sincronia para `>=0.1.2-alpha.1 <0.2.0-0`.

### Mudança: texto do botão de congelamento e divisão de papéis com o session-guard

- **Texto dos botões**: `steer.freeze` passou a significar "congelar e acrescentar" (Freeze & append, com as variantes japonesa e coreana correspondentes) e `steer.resume` "retomar e acrescentar" (Resume & append) — apresentado ao lado dos botões novos do session-guard "pausar sessão / retomar sessão", evitando confundir os dois "retomar". Só texto; comportamento inalterado.
- **Fronteira de responsabilidade** (nova subseção no README): este plugin cuida apenas de "ordenar" — em qual fila (`next-step` ou `next-turn`) a entrada do usuário vai, em que nível e quando é consumida (`updateQueue(steer|remove|edit)` / `send` / `cancel`); o session-guard cuida apenas de "parar" — gate de passo `agent/pre-step`, pausa em nível de turno e hold em nível de requisição. O significado físico de `next-step` é "o próximo passo, no mesmo nível do retorno de uma ferramenta (ainda dentro do mesmo turno)"; `next-turn` é que é um turno novo.

### Novo: compatibilidade com duas versões do DSH (0.1.1-rc.2 / 0.1.2-rc.1)

- **Artefato único, adaptação em tempo de execução**: o mesmo `lib/client.js` carrega nas duas versões, sem ramificações por número de versão.
- **O botão de congelamento passou a ler a peça padrão da sessão**: `conversation.input.right` deixou de passar o `owner` `InputZone` a partir do 0.1.2 (`InputBar.tsx:466` passa `{}`), e a leitura antiga de `session.queue` simplesmente lançava erro nessa versão. Agora é `useSession(s => s.queue)` — `useSession` e `sessionId` existem em `SessionStandardProps` nas duas versões.
- **Contrato local estreitado à interseção das duas versões**: em `src/types/contracts.d.ts`, `conversation.input.right` perdeu `owner` e `InputZone` declara apenas o `input.draft` consumido; reintroduzir um owner exclusivo de uma versão gera erro direto no `tsc`.
- **Metadados**: `engines.dsh` estreitado para `>=0.1.0-rc.7 <0.2.0-0`; `peerDependencies` removeu `@deepseek-ai/dsh-client-runtime` (renomeado `dsh-client-store` no 0.1.2; a execução deste plugin não depende dele).

### Correção: a fila de espera era atravessada por outras entradas entre ela e o cartão de entrada

- **Sintoma**: a barra de aviso de aprovação do `dsh-perm-gate` aparecia entre a fila de espera e o cartão de entrada.
- **Causa raiz**: a posição de exibição de um slot de lista depende só de `order` (o `scoped-slots.tsx` ordena os vencedores do sombreamento por `order`); `priority` apenas decide o vencedor da célula de mesmo `id`. A barra da fila herdava o `order: 20` oficial e por isso ficava antes do `30` da barra de aviso.
- **Correção**: mantido `priority: -1` (vence a célula oficial `queue`) e `order` promovido a `QUEUE_DOCK_ORDER = 1000`, colocando-se depois de todas as entradas conhecidas da faixa `conversation.input.dock`, encostado no cartão de entrada. O DSH não tem semântica de "último": um terceiro que registre um `order` maior ainda pode se intrometer (premissa anotada no README).

## 0.2.8 — 2026-08-24

### Novo: adaptação automática a modo dia/noite

- As cores do quadro da fila (dock da área de espera) e do botão de congelamento deixaram de ser desenhadas em `--ds-color-*` (token que nem existe no dsh) e passaram a referenciar os tokens semânticos oficiais do dsh (`--dsw-alias-*`: bg-layer / border-l / label / interactive-bg-hover / state-success|warn|error-primary).
- Efeito: sob modo escuro do sistema ou tema escuro do dsh (`body[data-ds-dark-theme]`) alternam automaticamente para **fundo cinza-escuro + texto branco invertido**, com as cores dos três níveis nos valores oficiais adaptados ao escuro (contraste garantido pelo dsh); a aparência diurna ficou inalterada.
- Mapeamento puro de tokens em CSS, com diff zero em JS e nenhuma configuração nova.

## 0.2.6 — 2026-08-19

### Correção de bug: início de arrasto compatível (alguns navegadores não arrastavam)

- **Sintoma**: em alguns navegadores (cujo motor exige `setData` para iniciar o arrasto HTML5) as linhas da fila não podiam ser arrastadas para reordenar.
- **Causa**: o `dragStart` só definia `effectAllowed='move'` e não chamava `dataTransfer.setData()`.
- **Correção**: `setData('text/plain', index)` adicionado ao `dragStart` tanto das linhas normais quanto das congeladas.

## 0.2.5 — 2026-08-19

### Correção de bug: fila congelada não aceitava arrasto para reordenar

- **Sintoma**: com a sessão congelada, só os botões de mover para cima/baixo reordenavam; o arrasto não funcionava.
- **Causa**: os `li` da lista de congelados não tinham `draggable` nem os eventos de arrasto (a implementação cobria só as linhas normais).
- **Correção**: `draggable` + `dragStart/dragOver/drop/dragEnd` adicionados às linhas congeladas, com o drop chamando `movePending(from, to)` e um indicador de posição de destino.

## 0.2.4 — 2026-08-19

### Correção de bug: a fila ficava travada durante o congelamento (ordem, conteúdo e nível de inserção todos inertes)

- **Sintoma**: no estado congelado a fila "não deixava mexer" — mover para cima/baixo, editar, remover e os níveis de inserção vermelho/amarelo/verde todos inoperantes.
- **Causa**: a lista de congelados era renderizada somente leitura (sem botões); os botões das linhas normais remanescentes traziam `disabled={frozen}`.
- **Correção** (congelamento e fila totalmente desacoplados):
  - cada linha congelada ganhou edição (textarea em linha) / remoção / subir / descer, igual ao estado não congelado;
  - cada linha congelada ganhou os botões de **nível de inserção vermelho/amarelo/verde** (definem o nível planejado para a retomada, via `setTierAt`);
  - a edição de linhas congeladas usa o id `frozen:NUM`, evitando a limpeza stale das filas normais;
  - a retomada executa o nível planejado de cada item: o vermelho primeiro `cancel()` e depois envia (interrompe); amarelo/verde acordam na sequência.

## 0.2.3 — 2026-08-19

### Correção de bug: a fila de espera desaparecia durante o congelamento

- **Sintoma**: após congelar, a fila de espera sumia e o usuário não podia ver nem alterar as mensagens congeladas.
- **Causa**: a implementação do congelamento removia as mensagens uma a uma para o store do plugin (o driver parava sozinho por falta de pendência), e a condição de render do dock, `queue.length === 0 && !running`, disparava `return null`.
- **Correção**:
  - a condição de render ganhou `!frozen` (dock permanece montado quando congelado);
  - a lista de congelados é renderizada do `pending` do freeze-store (banner + marca "congelado" por linha);
  - o freeze-store ganhou mutações: `pushPending` / `updatePendingAt` / `removePendingAt` / `movePending`.

## 0.2.2 — 2026-08-19

### Novo: botão explícito de cancelar a confirmação de limpeza

- A fila congelada continua visível (banner); a confirmação em dois passos da limpeza ganhou um botão "cancelar a limpeza" (clique restaura, com restauração automática por tempo limite de 3s).

## 0.2.1 — 2026-08-18

### Novo: confirmação em dois passos para a limpeza

- O primeiro clique em "cancelar e limpar" mostra o vermelho "Confirmar a limpeza?"; um segundo clique executa — evita limpar a área de espera inteira por toque acidental.

## 0.2.0 — 2026-08-18

### Novos recursos (inspirados em dsh-queue-plus)

- **Reordenação por arrasto**: as linhas da fila são arrastadas diretamente para mudar de ordem (HTML5 DnD nativo, zero dependência de execução); ficou o fallback de teclado pelos botões de seta.
- **Proteção de concorrência na ordenação**: se durante a reconstrução alguma mensagem já tiver sido reivindicada pelo agente (`queue-item-not-found`) → aborta imediatamente e não reenvia nada, com o aviso "a fila mudou, esta reordenação foi cancelada" — nunca embaralha uma fila em mudança.
- **Memória de estado recolhido**: o recolher/expandir da área de espera é persistido em localStorage e se mantém entre sessões.
- **Confirmação em dois passos da limpeza** (ver 0.2.1).

### Engenharia

- **Descrição atualizada**: package.json / repositório GitHub / npm ganharam queue / drag-to-reorder / interject / batch clear.
- **TDD + Lint**: configuração flat do ESLint (`eslint.config.mjs`, typescript-eslint + react-hooks); `npm run tdd` (vitest watch); `npm run verify` como portão único (lint + teste + compilação + 12 asserções de montagem); seção bilíngue "Desenvolvimento (TDD + Lint)" no README.
- Testes: de 32 para 43.
