# Guia de instalação (CLI DSH oficial)

Este guia usa somente o comando oficial `dsh plugin` do DSH. O comando instala a dependência em um profile e sincroniza `dsh.profile.bundles`. Não o substitua por `npm install` simples, `pnpm add` direto no profile ou edições manuais no manifesto do profile.

- [Guia de instalação](./INSTALL.pt.md)
- [English installation guide](./INSTALL.md)
- [中文安装指南](./INSTALL.zh.md)
- [日本語インストールガイド](./INSTALL.ja.md)
- [한국어 설치 안내](./INSTALL.ko.md)
- [Português README](./README.pt.md)
- [English README](./README.en.md)
- [中文 README](./README.md)
- [日本語 README](./README.ja.md)
- [한국어 README](./README.ko.md)
- [Changelog em português](./CHANGELOG.pt.md)
- [Changelog](./CHANGELOG.md)
- [日本語 changelog](./CHANGELOG.ja.md)
- [한국어 changelog](./CHANGELOG.ko.md)

Os espaços reservados deste guia são:

- `<profile>`: o profile DSH a modificar, normalmente `web`;
- `dsh-input-traffic`: o pacote npm e o ID de plugin em execução.

> **Requisito de versão — DSH v0.1.2 ou mais recente.**
>
> Verifique primeiro a versão em execução (`dsh --version`).
>
> | Versão do DSH | Ação |
> | --- | --- |
> | ≥ 0.1.2 | Instale esta versão. |
> | < 0.1.2 | Permaneça na linha anterior do plugin (0.2.10-beta.2 ou anterior). Não execute uma compilação antiga do plugin contra DSH v0.1.2+ — atualize o plugin. |
>
> O limite é `0.1.2-alpha.1`, em que o DSH removeu `@deepseek-ai/dsh-client-runtime`. Esta versão importa `Context` de `@deepseek-ai/cordis` e `SessionId` de `@deepseek-ai/dsh-session/types`, em conformidade com os plugins oficiais de cliente.

## 0. Pré-requisitos e descoberta do profile

```bash
echo "DSH_HOME=${DSH_HOME:-$HOME/.dsh}"
dsh --version
ls "${DSH_HOME:-$HOME/.dsh}/profiles"
```

Use o profile indicado pelo processo DSH em execução. `web` é comum, mas o argumento `--profile` ativo é a autoridade.

## 1. Instalação oficial

Instale a versão mais recente:

```bash
dsh plugin --profile <profile> add dsh-input-traffic -w
```

(O sinalizador `-w` é obrigatório quando o profile é a raiz de um workspace pnpm, como `web`.)

Instale explicitamente a versão atual:

```bash
dsh plugin --profile <profile> add dsh-input-traffic@0.2.9 -w
```

O CLI oficial atualiza automaticamente a dependência do profile, o lockfile e `dsh.profile.bundles`. Não adicione uma linha YAML manual.

### Período de resfriamento da cadeia de suprimentos

A execução dsh usa pnpm 11, cuja política `minimumReleaseAge` pode bloquear uma versão recém-publicada com `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`. Adicione a versão a `minimumReleaseAgeExclude` em `~/.dsh/profiles/web/pnpm-workspace.yaml`:

```yaml
minimumReleaseAgeExclude:
  - dsh-input-traffic@0.2.9
```

## 2. Atualização

Atualize para a versão mais recente do registry:

```bash
dsh plugin --profile <profile> update dsh-input-traffic -w
```

Reinicie o DSH para mudanças no host e recarregue a página web para mudanças no cliente.

## 3. Registro por caminho local / link: (alternativa)

Para instalações de desenvolvimento ou offline, registre o plugin a partir de um checkout local:

```bash
#    dependencies do ~/.dsh/profiles/web/package.json:
#      "dsh-input-traffic": "link:<absolute path to dsh-input-traffic>"
#    ~/.dsh/profiles/web/cordis.patch.yml:
#      - insert:
#          - id: input-traffic
#            name: dsh-input-traffic
cd ~/.dsh/profiles/web && pnpm install && dsh web
```

Ou use o CLI oficial com um caminho local (sem rede):

```bash
dsh plugin --profile <profile> add /absolute/path/to/dsh-input-traffic -w
```

## 4. Verifique a instalação

Confira a dependência e a versão instalada:

```bash
grep -n "dsh-input-traffic" \
  "${DSH_HOME:-$HOME/.dsh}/profiles/<profile>/package.json"
node -p "require('${DSH_HOME:-$HOME/.dsh}/profiles/<profile>/node_modules/dsh-input-traffic/package.json').version"
```

Confira a composição oficial:

```bash
dsh --profile <profile> --dump-default-config
```

Ela deve conter:

```yaml
- id: input-traffic
  name: dsh-input-traffic
```

## 5. Verifique o plugin

Reinicie o DSH e recarregue a página web. Em uma sessão, verifique:

1. O dock de planejamento em três níveis aparece na área de espera;
2. O botão "Congelar sessão" está visível à direita do composer;
3. A linha de configurações oficial "comportamento do Enter em ocupado" está oculta;
4. Enquanto o agente está ocupado, enviar uma mensagem a coloca na área de espera com botões de planejamento vermelho/amarelo/verde.

## Estado do suporte a japonês e coreano

O plugin inclui dicionários `ja` e `ko`, mas a versão oficial atual do DSH expõe apenas `zh` e `en` por meio do `LocaleRuntime`. Em um DSH padrão, selecionar japonês ou coreano falha com `locale "<id>" is not registered`.

Para usá-los antes do suporte oficial chegar, mantenha um fork do DSH e atualize:

- `packages/client/locale/src/locale-settings.ts`: adicione `ja` e `ko` a `LOCALE_IDS`.
- `packages/client/locale/src/client/index.ts`: adicione `{ id: 'ja', label: '日本語' }` e `{ id: 'ko', label: '한국어' }` a `LOCALES`.
- Adicione os dicionários e testes correspondentes no core, depois rebuild e execute o DSH fork.

Uma mudança apenas no plugin não consegue ampliar a lista global de locales do DSH.

## 6. Solução de problemas

| Sintoma | Ação |
| --- | --- |
| `dsh` não encontrado | Instale ou ative o CLI oficial do DSH. |
| `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` | Adicione a versão a `minimumReleaseAgeExclude` no `pnpm-workspace.yaml` do profile. |
| Plugin aparece como "desabilitado/não montado" sem erro | Confira a composição do profile. |
| Entrada de cliente ausente do `__DSH_BOOT__` | Confirme que `exports["./client"]` existe e que a fibra do host foi estabelecida. |
| Botões de congelar/retomar não funcionam | Garanta que o session-guard esteja instalado se usar bloqueio por sessão; o plugin opera fail-open quando o session-guard está ausente. |
| Bundle de cliente desatualizado | Recarregue o navegador forçadamente (Ctrl+Shift+R) após uma atualização. |

## 7. Remoção

Use o comando oficial:

```bash
dsh plugin --profile <profile> remove dsh-input-traffic
```

Reinicie o DSH em seguida para restaurar o dock de fila oficial e a linha de configurações "comportamento do Enter em ocupado".
