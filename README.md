# EstudaIA - Seu Assistente de Estudos com IA

Uma aplicação web moderna e profissional que transforma materiais de estudo em conteúdo educacional inteligente usando inteligência artificial.

## 🎯 Funcionalidades

### 📁 Upload de Arquivos
- **Formatos suportados**: PDF, DOCX, PPTX
- **Limite de tamanho**: Máximo 25MB
- **Interface drag & drop**: Moderna e intuitiva
- **Barra de progresso**: Feedback visual durante upload

### 🤖 Análise com IA
Após o upload, a IA gera automaticamente:

1. **Resumo Geral do Material**: Visão geral completa e objetiva
2. **Mapa Conceitual**: Hierarquia de tópicos e subtópicos
3. **Conceitos Mais Importantes**: Até 12 conceitos com explicações simplificadas
4. **Palavras-chave e Termos Técnicos**: 15-30 termos com links para estudo adicional
5. **Flashcards Automáticos**: Mínimo 15 flashcards (formato frente/verso)
6. **Quiz de Fixação**: 10 questões (6 múltipla escolha, 2 V/F, 2 dissertativas)
7. **Sugestões de Cronograma**: 3 opções (1 dia, 3 dias, 7 dias)

### 🎨 Interface
- **Landing page atraente**: Design moderno com gradientes
- **100% responsivo**: Funciona em todos os dispositivos
- **Temas claro/escuro**: Suporte para preferências do usuário
- **Abas e acordeons**: Organização intuitiva do conteúdo

### 📤 Exportação
- **Copiar para Anki**: Exportação em formato compatível com Anki
- **Gerar PDF**: Funcionalidade de exportação para PDF (em desenvolvimento)

## 🛠️ Stack Técnica

### Frontend
- **Next.js 14+** com App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes UI
- **React Dropzone** para upload de arquivos

### Backend
- **Next.js API Routes** para processamento
- **OpenAI API** para análise com IA
- **Processamento de arquivos**: PDF, DOCX, PPTX

### Armazenamento
- **Vercel Blob** para uploads grandes diretamente do navegador (evita o limite de payload das funções)

### Bibliotecas de Processamento
- **pdf-parse** para extração de texto de PDFs
- **mammoth** para extração de texto de DOCX
- **pptx-parser** para extração de texto de PPTX

## 🚀 Como Começar

### Pré-requisitos
- Node.js 20+ 
- npm ou yarn
- Chave de API da OpenAI

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd estudaia
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite o arquivo `.env.local` e adicione sua chave de API da OpenAI:
   ```
   OPENAI_API_KEY=sua_chave_aqui
   ```

    Para uploads maiores que ~4.5MB em Vercel, configure também o Vercel Blob:
    ```
    BLOB_READ_WRITE_TOKEN=seu_token_blob
    # Opcional para testes locais com callback via túnel
    # VERCEL_BLOB_CALLBACK_URL=https://seu-dominio-publico.ngrok.io
    ```

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Abra no navegador**
   ```
   http://localhost:3000
   ```

## 📋 Estrutura do Projeto

```
estudaia/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/analyze/       # API route para análise
│   │   ├── results/           # Página de resultados
│   │   └── page.tsx           # Landing page
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes UI (shadcn/ui)
│   │   ├── FileUpload.tsx    # Componente de upload
│   │   └── ResultsDisplay.tsx # Exibição de resultados
│   ├── lib/                   # Utilitários
│   │   ├── aiService.ts      # Serviço de IA
│   │   ├── fileProcessing.ts # Processamento de arquivos
│   │   └── utils.ts          # Utilitários gerais
│   └── types/                # Tipos TypeScript
└── public/                   # Arquivos estáticos
```

## 🎨 Personalização

### Cores e Temas
As cores podem ser personalizadas no arquivo `src/app/globals.css`. O projeto usa:
- **Azul escuro/ciano** para o tema principal
- **Gradientes suaves** para elementos destacados
- **Tema claro/escuro** automático baseado nas preferências do sistema

### Componentes UI
Os componentes são baseados no design system do shadcn/ui e podem ser personalizados em `src/components/ui/`.

## 🔧 Configuração da IA

### Prompt Utilizado
O prompt para a IA está configurado em `src/lib/aiService.ts` e inclui:
- Instruções detalhadas para análise em português brasileiro
- Formatação específica para cada seção
- Links obrigatórios para palavras-chave (Wikipedia PT + fonte adicional)
- Estrutura JSON válida para processamento

### Modelo de IA
O projeto usa o modelo **GPT-4o-mini** da OpenAI, que oferece:
- Excelente custo-benefício
- Suporte para português brasileiro
- Capacidade de gerar conteúdo educacional estruturado

## 📝 Notas Importantes

### Limitações Atuais
- **Extração de texto**: Implementação simplificada para demonstração
- **Exportação PDF**: Funcionalidade básica (pode ser expandida)
- **Histórico**: Armazenamento em sessionStorage (pode ser migrado para banco de dados)

### Uploads grandes (Vercel Blob)
- Em ambientes Vercel, requisições para funções têm limite de payload (~4.5MB). Para arquivos maiores, o upload é feito diretamente do navegador para o Blob com token seguro.
- Passos para habilitar:
  - Crie um Blob Store no dashboard da Vercel (Storage → Blob) e conecte ao projeto.
  - Garanta a variável `BLOB_READ_WRITE_TOKEN` no projeto. Para desenvolvimento local, coloque o valor em `.env.local`.
- Fluxo implementado:
  - Cliente usa `upload` do SDK com multipart:
    - `src/app/page.tsx:111` chama `upload(file.name, file, { access: 'public', handleUploadUrl: '/api/blob/upload', multipart: true })`.
  - Rota para gerar token e receber eventos de upload:
    - `src/app/api/blob/upload/route.ts:1` usa `handleUpload` de `@vercel/blob/client` e restringe `allowedContentTypes`.
  - Análise consome `blobUrl`:
    - `src/app/api/analyze/route.ts:52` baixa o conteúdo do `blobUrl` e processa.
- Tipos suportados na análise: `pdf`, `docx`, `pptx`. O UI permite planilhas, mas serão rejeitadas pelo backend.
- Erros comuns:
  - `Vercel Blob: Failed to retrieve the client token`: configure `BLOB_READ_WRITE_TOKEN` no ambiente (e em `.env.local` para rodar localmente).
  - `413 FUNCTION_PAYLOAD_TOO_LARGE`: use o fluxo de upload via Blob (já implementado).

### Segurança
- Chaves de API são armazenadas apenas no servidor (variáveis de ambiente)
- Validação de arquivos no frontend e backend
- Limites de tamanho de arquivo para prevenir abuso

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique as [issues](link-para-issues) existentes
2. Crie uma nova issue com detalhes do problema
3. Entre em contato através dos canais disponíveis

---

**EstudaIA** - Transformando aprendizado em experiência inteligente 🚀
