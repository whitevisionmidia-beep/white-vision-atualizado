# Auditoria técnica — CRM Visão Branca

## Resultado

- Imports locais verificados: **0 caminhos inexistentes**.
- Verificação case-sensitive dos imports locais: **OK**.
- Pacotes externos encontrados no código e comparados com `package.json`: **0 faltantes** após correção.
- Diagnóstico sintático TypeScript/TSX via parser do TypeScript: **0 erros de sintaxe**.
- Importação fantasma efetivamente encontrada: `pages/Propostas.tsx` usava `<Spinner />` sem importar `../components/ui/Spinner`.
- Arquivo referenciado e inexistente: `/index.css` — criado.
- Favicon `/vite.svg` era referenciado, mas não existia — referência removida.
- Configuração Tailwind via CDN/importmap do AI Studio foi substituída por Tailwind compilado localmente.
- Configuração Vite simplificada para produção.
- Tipos React adicionados ao `devDependencies`.
- Modo demo de autenticação passou a ser **opt-in** via `VITE_DEMO_MODE=true`; em produção, falha de Firebase não concede sessão.
- Bootstrap de SuperAdmin/Admin deixou de usar correspondência insegura por substring de e-mail; Admin de demonstração só é habilitado no modo demo e o SuperAdmin usa e-mail exato configurável por `VITE_SUPERADMIN_EMAIL`.
- Regras Firestore passaram a reconhecer `superadmin` como administrador.
- `api.filterByUser` e `getUsers` foram ajustados para tratar `SuperAdmin` de forma consistente.
- `vercel.json` adicionado para fixar build/output.
- `metadata.json` do Google AI Studio removido do pacote de produção.

## Limitação da validação

O ambiente de auditoria não conseguiu concluir `npm install`: o registry interno retornou 404 para `@types/node` e uma tentativa direta ao registry público excedeu o timeout. Portanto, **não seria honesto afirmar que `npm run build` foi executado com sucesso neste sandbox**.

O que foi validado localmente sem instalar dependências:
1. todos os imports relativos;
2. correspondência exata de nomes/case;
3. ausência de erros sintáticos em todos os `.ts/.tsx`;
4. cobertura de todas as bibliotecas externas no `package.json`.

A validação final de `npm run build` deve ser feita no seu ambiente/Vercel após o `npm install`.

## Arquivos novos

- `index.css`
- `tailwind.config.js`
- `postcss.config.cjs`
- `vite-env.d.ts`
- `vercel.json`

## Arquivos corrigidos

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `.env.example`
- `pages/Propostas.tsx`
- `context/AuthContext.tsx`
- `pages/Login.tsx`
- `services/api.ts`
- `firestore.rules`
- `components/layout/Layout.tsx`
- `pages/Financeiro.tsx`
- `pages/Configuracoes.tsx`
- `pages/ClienteDetalhe.tsx`
- `pages/SuperAdmin.tsx`

## Arquivo fantasma

Não foi necessário criar `Spinner.tsx`, `SuperAdmin.tsx`, `Modal.tsx` etc. porque esses arquivos **já existiam**. O problema real era principalmente a importação ausente de `Spinner` em `Propostas.tsx`, além da infraestrutura incompleta do projeto.

## Deploy

1. Copie o conteúdo deste pacote para o repositório.
2. Execute `npm install`.
3. Execute `npm run build`.
4. Configure as variáveis `VITE_FIREBASE_*` na Vercel.
5. Mantenha `VITE_DEMO_MODE=false` ou ausente em produção.
6. Configure `VITE_SUPERADMIN_EMAIL` com o e-mail real do SuperAdmin.
7. Faça commit/push para GitHub.
8. Na Vercel, importe o repositório e deixe o build command como `npm run build` e output `dist` (o `vercel.json` já fixa isso).
9. As regras de `firestore.rules` precisam ser publicadas no Firebase separadamente; a Vercel não publica regras do Firestore.

## Observação importante de segurança

A chave `VITE_FIREBASE_API_KEY` pode aparecer no bundle de uma aplicação Firebase Web; ela não deve ser tratada como um segredo. O controle real de acesso deve continuar nas Firebase Security Rules. Nunca coloque service-account JSON, private keys ou credenciais administrativas em `VITE_*`.
