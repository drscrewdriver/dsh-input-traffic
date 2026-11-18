<p align="center">
  <strong>Controle de tráfego de entrada em três níveis para a interface web do DeepSeek Harness</strong>
</p>
<p align="center">
  <strong>English</strong> · <a href="README.md">中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <strong>Português</strong>
</p>
<p align="center">
  <a href="LICENSE"><img alt="Licença MIT" src="https://img.shields.io/badge/license-MIT-263146?style=flat-square"></a>
  <img alt="Beta público" src="https://img.shields.io/badge/status-public%20beta-7da1de?style=flat-square">
</p>

# dsh-input-traffic

- [English README](./README.en.md)
- [中文 README](./README.md)
- [日本語 README](./README.ja.md)
- [한국어 README](./README.ko.md)
- [Português README](./README.pt.md)
- [Installation guide](./INSTALL.md)
- [中文安装指南](./INSTALL.zh.md)
- [日本語インストールガイド](./INSTALL.ja.md)
- [한국어 설치 안내](./INSTALL.ko.md)
- [Português guia de instalação](./INSTALL.pt.md)
- [Changelog](./CHANGELOG.md)
- [日本語 changelog](./CHANGELOG.ja.md)
- [한국어 changelog](./CHANGELOG.ko.md)
- [Português changelog](./CHANGELOG.pt.md)

> **▼ Suporte a versões do DSH** (linha compat/0.1.5, desde 0.2.12-beta.1)
> | Versão do DSH | Estado | Observações |
> | --- | --- | --- |
> | ≥ 0.1.5-alpha.1 | ✅ Compatível | Verificado contra 0.1.5-rc.1 / rc.2 (contratos de tipos espelhados de dsh-v0.1.5-rc.2) |
> | < 0.1.5-alpha.1 | ⚠️ Não compatível | Permaneça na linha `main` (0.2.11-beta.1, DSH 0.1.2+) ou anterior |
>
> - **O limite é 0.1.5**: Session V3 (nós de superfície), a reescrita do Sidebar em dockkit e o composer Lexical são as mudanças estruturais do 0.1.5. As três âncoras de slot que este plugin sombreia (`conversation.input.dock` / `conversation.input.right` / `settings.general.item`) sobrevivem no 0.1.5, e a face de serviços (`send` / `cancel` / `updateQueue` / `blocks.set`) não tem quebra registrada — assim, o código não precisa de nenhuma mudança estrutural; apenas o segmento compatível foi estreitado.
> - **Posição da faixa de fila**: registrada com `order: 1000`, de modo que ela é ordenada depois de todos os contribuidores conhecidos da faixa `conversation.input.dock` (todo 0 / goal 10 / fila oficial 20 / aviso dsh-perm-gate 30) e fica exatamente sobre o cartão do composer. O DSH não tem semântica de slot "último", então isso é uma convenção, não uma garantia estrutural — um plugin de terceiros que registre um `order` maior ainda pode ficar abaixo dele.

> **▼ Regressões conhecidas do DSH 0.1.5 (lado do host, não bugs do plugin)**
>
> | Problema | Impacto neste plugin | Discussão |
> | --- | --- | --- |
> | Derivar uma sessão herda os prompts enfileirados e ainda não executados da sessão pai e os reexecuta | É exatamente a fila que este plugin gerencia: um filho derivado pode reproduzir a fila pendente do pai | [#6314](https://github.com/deepseek-ai/deepseek-harness/discussions/6314) / [#6197](https://github.com/deepseek-ai/deepseek-harness/discussions/6197) |
> | O composer Lexical quebra sob composição IME / tradução do navegador | Afeta o reabastecimento de rascunho e os caminhos de envio de "devolver à caixa de entrada" | [#6231](https://github.com/deepseek-ai/deepseek-harness/discussions/6231) / [#6052](https://github.com/deepseek-ai/deepseek-harness/discussions/6052) |
> | O steer não consegue interromper durante uma espera de ferramenta bloqueante (até ~10 min) | O nível amarelo "inserir no próximo turno" fica inerte durante essa janela — usuários podem atribuir isso ao plugin | [#6030](https://github.com/deepseek-ai/deepseek-harness/discussions/6030) |
> | Após atualizar um profile antigo, um combo de cliente desatualizado deixa toda a árvore de plugins inativa | Primeira etapa de diagnóstico: **recarregue o navegador forçadamente (limpe o cache)** | [#5999](https://github.com/deepseek-ai/deepseek-harness/discussions/5999) / [#6374](https://github.com/deepseek-ai/deepseek-harness/discussions/6374) |

> **Nota de compatibilidade:** a v0.2.9 inclui dicionários `ja` e `ko`, mas as versões oficiais atuais do DSH expõem apenas `zh` e `en` por meio do `LocaleRuntime`. Em um DSH padrão, selecionar `ja` ou `ko` falha com `locale "<id>" is not registered`. Esses idiomas funcionarão depois que o DSH oficial adicionar os identificadores de locale. Usuários avançados podem usar um fork do DSH que atualize `LOCALE_IDS` (locale-settings.ts) e os rótulos `LOCALES` (client/index.ts) e rebuildem. Alterar apenas este plugin não consegue ampliar a lista global de locales do DSH.

> Enquanto o agente está ocupado, "interromper" e "enfileirar" deixam de ser mutuamente exclusivos: o vermelho interrompe e envia agora, o amarelo insere no próximo turno, o verde enfileira até o fim — os três coexistem. Perto das horas de pico de cobrança do DeepSeek, um clique congela a sessão; retome depois na faixa de tarifa fora de ponta.

Um plugin de cliente cordis montado por meio do comando `dsh plugin` e de um patch de bundle — sem mudanças no código-fonte do dsh, sem PR necessário.

> 💡 **Por que "Congelar sessão" é recomendado**: o DeepSeek passou à cobrança **ponta/fora de ponta** em 2026-08-17 — a janela de ponta (horário de Pequim 09:00-12:00, 14:00-18:00) custa **2×** a tarifa fora de ponta (todas as demais horas, incluindo almoço, madrugada, fins de semana e feriados). Se uma sessão de longa execução atravessa a janela cara, congelar manualmente pausa o consumo de API e retomar fora de ponta pode economizar até **50%**.
>
> **Combinação sugerida por ora**: use-o junto com um plugin de **lembrete** (p. ex. [dsh-notify](https://github.com/zhengjy01/dsh-notify), notificações na área de trabalho quando for hora de congelar/retomar) e um plugin de **faturamento/uso** (p. ex. [dsh-deepseek-usage](https://github.com/yyb16yyb-hub/dsh-deepseek-usage), [dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker), [dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance), para verificar o gasto real ao redor de um congelamento) — um ciclo de economia "lembrar → congelar → retomar fora de ponta → verificar".

<!-- host-compat:begin — generated by scripts/sync-hosts.mjs from scripts/hosts.mjs; DO NOT EDIT -->
- **Hosts DSH compatíveis:** `0.1.0-rc.2` `0.1.0-rc.3` `0.1.0-rc.6` `0.1.0-rc.7` `0.1.0-rc.8` `0.1.1-rc.1` `0.1.1-rc.2` `0.1.2-rc.1` `0.1.5-rc.1` `0.1.5-rc.2` `0.1.5-rc.3` `0.1.7-rc.1` `0.1.7-rc.2` `0.2.0-rc.1` `0.2.0-rc.2` `0.2.1-rc.1` `0.2.1-rc.2` `0.2.1-rc.3` `0.2.1-rc.4` `0.2.1-rc.5` `0.2.2-rc.1` (21 versões rc ao longo das linhas 0.1.0 / 0.1.1 / 0.1.2 / 0.1.5 / 0.1.7 / 0.2.0 / 0.2.1 / 0.2.2)
- **Verificado em execução:** `0.1.0-rc.2`, `0.1.0-rc.3`, `0.1.0-rc.6`, `0.1.0-rc.7`, `0.1.0-rc.8`, `0.1.1-rc.1`, `0.1.1-rc.2`, `0.1.2-rc.1`, `0.1.5-rc.1`, `0.1.5-rc.2`, `0.1.5-rc.3`, `0.1.7-rc.1`, `0.1.7-rc.2`, `0.2.0-rc.1`, `0.2.0-rc.2` — evidências em `.compat-results/`
<!-- host-compat:end -->

## O que ele faz

- **Três níveis coexistem**: enquanto o agente está ocupado, toda entrada primeiro chega a uma área de espera e você escolhe quando ela entra na conversa — não mais um único "interromper" nem um único "enfileirar":
  - 🔴 **Vermelho (agora)**: interrompe o turno atual e envia imediatamente — a geração em execução para e a mensagem é processada e respondida na hora;
  - 🟡 **Amarelo (próximo)**: insere no próximo turno natural — a ação atual (chamada de ferramenta / geração em curso) termina primeiro, sem interrupção;
  - 🟢 **Verde (depois)**: enfileira até que toda a lógica tenha terminado — processado depois que todas as ações anteriormente enfileiradas concluírem (o padrão).
- **O amarelo é reversível**: pressionar verde em uma mensagem já desviada (amarela) cancela a inserção e a devolve para a fila.
- **O conteúdo enfileirado continua editável**: mensagens já na fila podem ser editadas no lugar — o editor multilinha cresce automaticamente com o conteúdo para que mensagens longas permaneçam totalmente visíveis (Enter salva / Shift+Enter quebra linha / Esc cancela); elas também podem ser **devolvidas à caixa de entrada para edição** (rascunho reabastecido e reenviado em seguida).
- **Gerenciamento da fila**: mensagens na área de espera podem ser **movidas para cima / para baixo** para reordenar, removidas, ou limpas com o "cancelar e limpar" no nível da fila.
- **Edições nunca são perdidas**: se salvar uma edição falhar (o agente já reivindicou a mensagem), o conteúdo editado volta automaticamente para a caixa de entrada; um rascunho existente nunca é sobrescrito.
- **Congelamento na hora de pico**: um botão "Congelar sessão" à direita do composer — perto das horas de pico do DeepSeek (09:00-12:00, 14:00-18:00) ele pausa o consumo de API: o turno atual termina naturalmente e a fila não enviada é congelada; "Retomar sessão" continua durante as horas fora de ponta.
- **Tomada de comportamento oficial**: enquanto o plugin está montado, a linha de configuração oficial "comportamento do Enter em ocupado" fica oculta (o Enter permanece em enfileirar-depois).
- **Adaptação automática dia/noite**: o dock e o botão de congelamento usam exclusivamente os tokens semânticos oficiais do dsh (`--dsw-alias-*`), então acompanham o modo escuro do sistema / tema escuro do dsh automaticamente — no modo escuro eles alternam para uma **superfície cinza-escuro com texto invertido (branco)**, sem configuração (veja "Modo dia/noite").

## Prévia da interface

Esboço de layout da área de espera e do botão de congelamento em uma página de sessão:

```text
┌─ Composer ───────────────────────────────────── Enviar ── [❄ Congelar] ─┐
└─────────────────────────────────────────────────────────────────────┘
┌─ Área de espera (dock de planejamento em três níveis) ───────────────────────────┐
│ ┌ 2 mensagens na fila                                 🗑 Cancelar e limpar ┐ │
│ │ 🟢 na fila   Prévia da primeira mensagem…       ↑ ↓ Devolver  Editar  Remover   │ │
│ │ 🟢 na fila   Prévia da segunda mensagem…      ↑ ↓ Pull  Edit  Remove   │ │
│ │   Edição: o editor multilinha cresce sozinho (até ~8 linhas)       │ │
│ │   Enter salva · Shift+Enter nova linha · Esc cancela                 │ │
│ └───────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

## Os três níveis

| Nível | Cor | Semântica | Mecanismo subjacente (RPCs dsh existentes) |
|---|---|---|---|
| **depois** (padrão) | Verde | Fila: processado depois que todas as ações anteriormente enfileiradas terminarem; verde em uma mensagem já desviada **cancela a inserção** | Padrão do Enter → `agent.followup()` (próximo turno); cancelar = `updateQueue(remove)` + `send(text)` |
| **próximo** | Amarelo | Insere no próximo turno natural: depois que a ação atual terminar | `updateQueue(id, { kind: 'steer' })` → `agent.steer()` (limite next-step) |
| **agora** | Vermelho | Interrompe e envia: para o turno atual, a mensagem é processada imediatamente | `cancel()` → `updateQueue(remove)` (evita a rejeição de inserção duplicada na inbox) → `send(text)` (reenvio, desperta o driver imediatamente) |

> Por que o vermelho é cancelar + remover + reenviar: a inbox do harness rejeita inserir uma mensagem que já está pendente; desviar a mensagem original após uma interrupção seria rejeitado e deixaria a mensagem presa (ver FAQ).

## Congelar / retomar sessão (pausa na hora de pico) ⭐ Recomendado

> **Papel na economia de custo**: este é o **recurso central recomendado** do plugin para a cobrança ponta/fora de ponta do DeepSeek (em vigor desde 2026-08-17) — a janela de ponta (09:00-12:00, 14:00-18:00) custa o dobro, fora de ponta custa metade. Congelar pausa o trabalho não urgente até as horas fora de ponta, evitando diretamente a janela cara; sessões de longa execução podem economizar até metade do custo.
>
> **Combinação sugerida**: um plugin de **lembrete** (p. ex. [dsh-notify](https://github.com/zhengjy01/dsh-notify)) avisa para congelar/retomar ao entrar ou sair da janela de ponta; um plugin de **faturamento/uso** (p. ex. [dsh-deepseek-usage](https://github.com/yyb16yyb-hub/dsh-deepseek-usage), [dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker), [dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance)) verifica o gasto real ao redor de um congelamento.

O botão "Congelar sessão / Retomar sessão" à direita do composer (ao lado do botão de enviar) pausa o consumo de API perto das horas de ponta do DeepSeek:

- **Congelar**: o turno atual **não é interrompido** — ele termina naturalmente e então o consumo pausa. A fila fica totalmente **desacoplada do congelamento**: congelar apenas impede o agente de consumir (executar / inserir / anexar), enquanto a área de espera permanece visível e **totalmente operável** — reordenar, editar, remover e definir o nível de inserção vermelho/amarelo/verde, exatamente como quando não está congelada;
- **Retomar**: a fila (possivelmente editada) é reenviada e **cada item executa com o nível planejado** (vermelho = interromper e processar imediatamente, amarelo = aparte, verde = enfileirar); o agente continua em ordem FIFO;
- **Isolamento por sessão**: o estado de congelamento e a fila desacoplada são indexados **por sessionId** (`Map<string, FreezeState>` em `src/client/freeze-store.ts`) — congelar a sessão A nunca afeta o banner/botão/fila da sessão B; editar re-renderiza apenas os consumidores da sessão dona;
- **Motor**: congelar = desacoplar cada linha enfileirada via `updateQueue(remove)` (cópias mantendo seus níveis no store do plugin, indexadas por sessão); o driver para naturalmente quando o turno atual termina sem trabalho pendente; edições feitas durante o congelamento (texto / ordem / nível) são gravadas de volta no store em tempo real; retomar = primeiro `await sessionGuard.resume(sessionId)` (para que o próximo passo natural do turno interrompido aconteça antes), depois reenviar via `send(text)`, despertando o driver (itens de nível vermelho são precedidos por `cancel()`);
- Nota: mensagens enfileiradas com conteúdo não textual (imagens) não podem ser reenviadas e são liberadas pelo congelamento (não voltam).

### Bloqueio em nível de sessão via dsh-session-guard

O botão de congelamento entrega a uma **ponte sessionGuard** (`src/client/session-guard-bridge.ts` → `POST /session-guard/rpc { action: stopNextTurn|resume, sessionId }`) o **bloqueio por sessão** no lado do servidor, enquanto ergue um bloco no composer (`conversation.blocks.set`) para que a caixa de entrada fique inerte e o Enter não possa mais vazar para a conversa:

- **Referências de componentes**:
  - `src/client/freeze-button.tsx` — controle de congelar/retomar (slot `conversation.input.right`);
  - `src/client/steer-queue-dock.tsx` — dock de planejamento em três níveis + banner/lista de congelados (slot `conversation.input.dock` id `queue`);
  - `src/client/freeze-store.ts` — estado de congelamento por sessão (`Map<sessionId, {frozen, pending}>`, compartilhado entre botão ↔ dock);
  - `src/client/session-guard-bridge.ts` — ponte RPC do session-guard (tolerante a falhas, silenciosamente ignorada quando o session-guard está ausente);
  - `src/client/index.ts` — registro de slots + injeção de bloco no composer (`conversation.blocks.set`).
- **Comparação de escopo**: o botão de congelamento deste plugin = **por sessão** (bloqueia aquela sessão pelo id); o **gate automático de ponta / gate de passo do session-guard = pausa global ou por sessão** (segura na entrada da ponta, libera fora de ponta). Eles se complementam — este plugin é dono da fila e do congelamento, o session-guard é dono de quando o progresso pode acontecer.

**Divisão de trabalho (importante): este plugin apenas "ordena", o session-guard apenas "para"**

| | Este plugin (input-traffic) | session-guard |
|---|---|---|
| Função | **em qual fila** a entrada do usuário vai, em que nível, e quando é consumida | **quando o progresso pode acontecer** (passo / turno / requisição) |
| Primitivas DSH | as filas pendentes `next-step` / `next-turn` + `updateQueue(steer\|remove\|edit)` / `send` / `cancel` | `agent/pre-step` (gate de passo), `agent.cancel({keepInbox:true})` + `goals.pause`, hold de `agent/request` |
| Congelar | desacopla as linhas `queued` + `steering` (**níveis preservados**) + bloqueio do composer | `stopNextTurn`: **libera o gate de passo primeiro**, depois pausa em nível de turno (caso contrário um espera pelo outro) |
| Retomar | reenvia por nível (vermelho cancelar+enviar / amarelo steer / verde enviar) | `resume`: continua a partir do ponto de pausa |

As duas filas significam: `next-step` = "o próximo passo, **no mesmo nível do resultado de uma ferramenta**, ainda dentro do mesmo turno"; `next-turn` = "um novo turno". É por isso que o nível amarelo insere no turno atual e o nível verde espera o turno fechar.

## Gerenciamento da fila

Cada mensagem na área de espera (enquanto não congelada) oferece:

| Ação | Descrição |
|---|---|
| Mover para cima / baixo | Reordena a fila FIFO (toda a fila é reconstruída na nova ordem; desabilitado enquanto houver mensagem com imagem na fila) |
| **Arrastar para reordenar** | Arraste uma linha até a posição de destino (HTML5 DnD nativo, sem dependência extra); mesma reconstrução no servidor dos botões de seta |
| Editar na caixa de entrada | Reabastece a mensagem no rascunho do composer e a remove da fila para edição |
| Editar / remover | Edita o conteúdo enfileirado em um editor multilinha / cancela a mensagem |
| Planejamento vermelho / amarelo / verde | Veja "Os três níveis" |
| Cancelar e limpar | Confirmação em dois passos, então para a execução atual e remove todas as mensagens da fila (o primeiro clique mostra "Confirmar a limpeza?") |

**Proteção de concorrência** na reordenação: se uma mensagem já tiver sido reivindicada pelo agente durante a reconstrução (`queue-item-not-found`), a reordenação para imediatamente e nada é reenviado — a fila alterada nunca é embaralhada.

O estado de **recolhimento da área de espera é lembrado** entre sessões.

Ao editar uma mensagem enfileirada (em linha):

- **Crescimento automático**: o editor cresce com o conteúdo em tempo real; mensagens longas se expandem totalmente até cerca de 8 linhas e depois rolam internamente;
- **Atalhos**: `Enter` salva, `Shift+Enter` insere nova linha, `Esc` cancela (a composição de IME é protegida contra salvamentos acidentais);
- **Fallback de falha**: se o salvamento falhar porque o agente já reivindicou a mensagem (p. ex. "começou a enviar"), o conteúdo editado volta automaticamente para a caixa de entrada com um aviso — **nada é perdido**; o reabastecimento só acontece quando a caixa de entrada está vazia, então um rascunho existente nunca é sobrescrito.

## Modo dia/noite (adaptação escura automática)

O dock e o botão de congelamento **não usam mais cores desenhadas à mão** — eles referenciam os tokens semânticos oficiais do dsh (`--dsw-alias-*`: `bg-layer-*` / `border-l*` / `label-*` / `interactive-bg-hover` / `state-success|warn|error-primary`) mantidos pelo sistema de temas do dsh:

- **Acompanhamento automático**: a preferência de tema padrão do dsh é "sistema" — quando o SO muda para modo escuro (ou você escolhe um tema escuro nas configurações do dsh), `body[data-ds-dark-theme]` entra em vigor e os tokens alternam para a paleta escura, então o dock vira uma **superfície cinza-escuro com texto invertido (branco)** e as cores dos níveis usam os valores oficiais adaptados para escuro (o contraste é garantido pelo dsh);
- **Sem configuração**: o plugin não observa o sistema nem adiciona configurações — claro/escuro é totalmente delegado ao tema do dsh; a aparência diurna permanece igual;
- **Escopo**: o dock da área de espera (incluindo banner / lista de congelados) e o botão "Congelar sessão" à direita do composer.

## Instalação

```sh
# Opção 1: instalar do npm (recomendado, versão estável)
#   (o profile é a raiz de um workspace pnpm, então -w é obrigatório)
dsh plugin --profile web add dsh-input-traffic -w

# Opção 2: instalar direto do GitHub (fork drscrewdriver — experimente novidades primeiro)
#   (lib/ não é versionado; após instalar, construa no profile:
#    cd ~/.dsh/profiles/web/node_modules/dsh-input-traffic && npm install --legacy-peer-deps && npm run build)
dsh plugin --profile web add github:drscrewdriver/dsh-input-traffic#main

# Opção 3: montar a partir de um caminho local
# dsh plugin --profile web add /caminho/absoluto/para/dsh-input-traffic -w

# Confirme que a árvore composta contém a nova linha
dsh web --dump-config | grep -B1 -A2 'input-traffic'

# Reinicie o dsh web — obrigatório! Uma instância em execução não carrega a camada de bundle a quente
dsh web
```

> ⚠️ **Acessibilidade do GitHub**: instalar via github: requer acesso a github.com; se sua rede for restrita, configure primeiro um proxy ou espelho funcional, caso contrário o add pode travar durante o download.

Compilação e testes locais:

```sh
npm install --legacy-peer-deps   # a cadeia de pacotes @deepseek-ai cliente é incompleta no npm; apenas a cadeia de ferramentas
npm run build                    # tsc (lib/types) + tsdown (lib/index.js + lib/client.js)
node examples/verify-assembly.mjs  # 12 asserções de montagem
npm test                         # 36 testes de componente vitest
npm run lint                     # ESLint (src + tests, flat config)
npm run verify                   # portão único: lint + test + build + verify-assembly
```

## Desenvolvimento (TDD + Lint)

Este projeto é mantido com **TDD** (desenvolvimento orientado a testes): escreva primeiro o teste que falha, depois implemente até ficar verde.

```sh
npm run tdd        # vitest watch: re-executa a cada mudança, ciclo vermelho-para-verde
```

Fluxo:

1. Adicione/atualize um caso em `tests/` (vermelho: confirme que o novo comportamento ainda não está implementado);
2. `npm run tdd` e veja falhar;
3. Implemente a mudança mínima em `src/` (verde);
4. `npm run verify` tudo verde antes de versionar (lint + 36 testes + build + 12 asserções de montagem).

Lint:

```sh
npm run lint       # ESLint flat config (eslint.config.mjs)
npm run lint:fix   # corrige automaticamente o que puder
```

- Escopo: `src/` e `tests/` (TypeScript + React); a saída de compilação `lib/` é ignorada;
- Regras: `@typescript-eslint/recommended` + boas práticas `react-hooks`; variáveis não usadas são erros (prefixo de sublinhado `_` isenta).

## Uso

1. Enquanto o agente está ocupado, digite e envie — a mensagem entra na **área de espera** (fila verde por padrão);
2. Pressione um botão de nível na mensagem:
   - 🟡 Amarelo = aparte — insere depois que a ação atual terminar;
   - 🔴 Vermelho = interromper — para a ação atual, a mensagem é processada na hora;
   - 🟢 Verde = manter na fila (o padrão); em uma mensagem já desviada, verde a cancela de volta para a fila;
3. Reordene / reedite: use mover para cima/baixo, "Editar na caixa de entrada" ou o editor multilinha embutido (Enter salva, Shift+Enter nova linha);
4. **Chave de economia de custo (recomendado)**: perto da janela de ponta (09:00-12:00, 14:00-18:00), pressione "Congelar sessão" à direita do composer; a sessão pausa depois do turno atual, evitando a janela cara; pressione "Retomar sessão" fora de ponta para continuar. Combine com plugins de lembrete / faturamento (veja "Recomendado" acima).

## FAQ

### Depois de uma interrupção a mensagem não recebe resposta / a conversa trava

Corrigido (problema histórico). Causa raiz: a inbox do harness rejeita inserir uma mensagem que já está pendente — desviar a mensagem original logo após uma interrupção era rejeitado com `"message is already pending"`, prendendo a mensagem e parando o driver. A implementação atual é `cancelar → remover → reenviar` (o texto é reenviado como mensagem nova), então a mensagem interrompida é processada e respondida imediatamente. Se ainda acontecer, reconstrua o plugin e reinicie o dsh web.

### Para onde vai o conteúdo depois de um salvamento de edição malsucedido?

Ele não é perdido. Quando o salvamento falha (o agente já reivindicou a mensagem), o conteúdo editado volta automaticamente para a caixa de entrada com o aviso "Falha ao editar; o conteúdo voltou para a caixa de entrada"; se a caixa de entrada já tem um rascunho, nada é reabastecido e apenas a falha é reportada.

### A linha de configuração "comportamento do Enter em ocupado" está sumida

Esperado — o plugin a oculta e fixa o Enter em fila verde; uma preferência desatualizada não pode vazar por trás da linha oculta.

### As mensagens enfileiradas sumiram depois de congelar

Esperado — o congelamento desacopla a fila para o store do plugin (indexado por sessão, removida da área de espera); elas voltam na retomada. Recarregar a página perde a fila congelada; evite recarregar enquanto congelado.

### Mover para cima/baixo está desabilitado

A reordenação fica desabilitada enquanto qualquer mensagem na fila contém conteúdo não textual (imagens não podem ser reenviadas). O mesmo vale para "Editar na caixa de entrada".

### Os botões de interromper / aparte estão desabilitados

Vermelho e amarelo ficam desabilitados enquanto o agente está ocioso — um agente ocioso processaria a mensagem imediatamente de qualquer forma, então o planejamento não é necessário.

## Desinstalação

```sh
dsh plugin --profile web remove dsh-input-traffic
```

Reinicie o dsh web em seguida para restaurar o dock de fila oficial e a linha de configuração "comportamento do Enter em ocupado".

## Compatibilidade e privacidade

- Requer DeepSeek Harness com o profile web; verificado em dsh web para Windows/macOS/Linux.
- Apenas um plugin do lado do navegador (cliente) — toda operação passa pelas RPCs dsh existentes (`session.prompt` / `session.updateQueue` / `session.cancel`); **sem mudanças na fonte oficial**.
- O plugin não lê dados além do estado da sessão nem faz upload de nada; a fila congelada vive apenas na memória do navegador.
- Os tipos de contrato são declarados localmente em `src/types/contracts.d.ts` (a cadeia npm de clientes dsh é incompleta) e espelham as fontes do harness no momento da verificação de compilação.

## Arquitetura

```
src/
├── index.ts                  # metade node (entrada do loader, apply vazio)
├── invariant.ts              # invariantes da tomada de controle
├── types/contracts.d.ts      # declarações locais de contratos @deepseek-ai/*
└── client/
    ├── index.ts              # apply da metade navegador: Enter ocupado fixado em fila + registros dos três slots
    ├── steer-queue-dock.tsx  # dock de planejamento em três níveis (sombreia conversation.input.dock id queue)
    ├── freeze-button.tsx     # botão congelar/retomar (conversation.input.right)
    ├── freeze-store.ts       # estado de congelamento por sessão (Map<sessionId, {frozen, pending}>)
    ├── hide-enter-row.tsx    # ocultação da linha de configurações (sombreia settings.general.item id composer-enter)
    ├── locales.ts            # dicionários steer (zh/en/ja/ko/fr/de/it/ru/es/pt)
    └── *.module.css
```

- **Sombreamento de slots**: slots de lista renderizam a menor prioridade por célula — o mesmo id com prioridade -1 substitui as entradas oficiais (QueueDock, EnterBehaviorRow).
- **Cadeia de compilação**: o tsdown espelha a semântica do harness `packages/client/tsdown.client.ts` (banner `__ModuleLoader__.load`, CSS Modules embutidos via lightningcss, tabela de externos de plataforma, portão de pureza do bundle).
- **Contrato do consumidor**: `conversation.updateQueue / cancel / send / input.for(actx).notify / actions.setDraft` (serviço oficial ui-conversation, verificado contra api-proxy.ts).
- **Editor de crescimento automático**: `resizeEditor` (uma exportação pura de steer-queue-dock.tsx) redefine a altura da textarea e cresce pelo `scrollHeight`; um `max-height` em CSS limita o crescimento e o editor rola internamente.

## Verificação em ambiente real (Windows, 2026-08-17)

Verificação de ponta a ponta no navegador em um `dsh web` ao vivo, zero erros de console da aplicação:

| Item | Resultado |
|---|---|
| Montagem | A árvore composta contém a linha `input-traffic`; a aba do plugin mostra montado/ativado; `/plugins/dsh-input-traffic/client.js` 200 |
| Ocultação da linha de configurações | A linha "comportamento do Enter em ocupado" está ausente (zero correspondências no DOM) |
| Vermelho agora | A mensagem interrompida é processada imediatamente: o agente responde a ela explicitamente e continua; sem estado intermediário preso |
| Amarelo próximo + cancelar verde | Após o aparte, verde devolve a mensagem para a fila |
| Congelar / retomar | O turno atual termina naturalmente sem interrupção, fila congelada com banner; a retomada drena tudo em ordem FIFO |
| Edição da fila (multilinha / fallback / arrastar / confirmação) | Coberto pelos testes de componente (36/36 verdes); re-verificação em ambiente real pendente |

## Referências

- [dsh-plugin-creation-convention.md](../dsh-plugin-creation-convention.md) (raiz do workspace) — a convenção de criação de plugins dsh que este plugin segue
- Referência de semântica: [dsh-traffic-light](https://github.com/yimeng-dev/dsh-traffic-light) (semáforo de estado de sessão na área de trabalho)
- Âncoras do harness: `packages/client/AGENTS.md`, `packages/client/tsdown.client.ts`, `packages/client/web/src/platform.ts`, `packages/bundle/web-app/cordis.patch.yml`, `packages/client/ui-conversation/src/client/queue/QueueDock.tsx`, `packages/host/apiproxy/src/api-proxy.ts`

## Família de plugins DSH drscrewdriver

Este projeto é um dos plugins DSH mantidos por [drscrewdriver](https://github.com/drscrewdriver). Se este ajuda você, os outros provavelmente também ajudarão:

| Plugin | Uma linha |
|---|---|
| **[dsh-input-traffic](https://github.com/drscrewdriver/dsh-input-traffic)** | Fila de entrada em momentos de ocupação: controle de tráfego em três níveis, arrastar para reordenar, congelar sessão |
| **[dsh-session-guard](https://github.com/drscrewdriver/dsh-session-guard)** | Gate automático de sessão na ponta: modo fim de semana + pausa automática na ponta + bloqueio por sessão + nova tentativa automática no back-end (combina com o botão deste plugin) |
| [dsh-thinking-levels](https://github.com/drscrewdriver/dsh-thinking-levels) | Controle de reasoning_effort por rodada: agendamento Auto ou nível manual de conexão |
| [dsh-seatbelt-sandbox](https://github.com/drscrewdriver/dsh-seatbelt-sandbox) | Adaptador de sandbox Seatbelt do macOS: carregador nativo libsandbox substituindo o sandbox-exec obsoleto |
| [dsh-switch-search](https://github.com/drscrewdriver/dsh-switch-search) | Busca de conteúdo de sessões na barra lateral: alternância título/conteúdo, filtro por usuário/resposta/ferramenta |

## Licença

MIT

