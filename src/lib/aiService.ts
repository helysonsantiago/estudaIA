import OpenAI from 'openai';
import { getApiConfig } from './apiConfig';

// Function to get OpenAI client based on configuration
function getOpenAIClient(overrideApiKey?: string) {
  const config = getApiConfig();
  
  if (overrideApiKey) {
    return new OpenAI({
      apiKey: overrideApiKey,
    });
  }
  
  if (config.openai?.apiKey) {
    return new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }
  
  // Fallback to environment variable if available
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return null;
}

export async function generateAnalysis(
  text: string,
  filename: string,
  opts?: { provider?: string; apiKey?: string; model?: string }
) {
  // If provider is explicitly Google Gemini, use Google API
  if (opts?.provider === 'google' && opts?.apiKey) {
    console.log('[IA] Chamando Gemini via REST', { model: opts.model || 'gemini-flash-latest', textLength: text.length, filename });
    return await generateWithGemini(text, filename, opts.apiKey, opts.model || 'gemini-flash-latest');
  }

  const openai = getOpenAIClient(opts?.apiKey);
  
  // Fallback only if no recognized provider or client available
  if (!openai) {
    // If demo flag is enabled and no provider/client, use sample
    if (process.env.NEXT_PUBLIC_USE_SAMPLE_DATA === 'true') {
      console.warn('[IA] Modo demonstração ativo, usando dados de exemplo');
      return generateSampleAnalysis(text, filename);
    }
    console.warn('[IA] Nenhum provedor configurado; interrompendo análise');
    throw new Error('Nenhum provedor de IA configurado');
  }

  const prompt = `Você é um assistente de estudos especializado em criar materiais educacionais. 
  Analise o seguinte texto extraído do arquivo "${filename}" e gere um conteúdo educacional completo em português brasileiro.
  
  Texto extraído:
  ${text}
  
  Gere a seguinte estrutura obrigatoriamente nesta ordem exata:
  
  1. **Resumo Geral do Material**: Um resumo completo e objetivo do conteúdo principal.
  
  2. **Mapa Conceitual**: Liste hierarquicamente os principais tópicos e subtópicos em formato markdown.
  
  3. **Conceitos Mais Importantes**: Máximo de 12 itens, cada um com explicação simplificada de 2-4 frases.
  
  4. **Palavras-chave e Termos Técnicos**: Entre 15 e 30 termos. Formato obrigatório para cada termo:
     **Palavra** - [Ver definição rápida](link_wikipedia_pt) | [Estudar mais](link_adicional)
     Use links do Wikipedia em português e um segundo link relevante (Khan Academy, Brasil Escola, YouTube, etc.)
  
  5. **Flashcards Automáticos**: Mínimo 15 flashcards no formato:
     Frente: [pergunta]
     Verso: [resposta]
  
  6. **Quiz de Fixação**: Exatamente 10 questões:
     - 6 múltipla escolha (4 alternativas, 1 correta)
     - 2 verdadeiro/falso
     - 2 dissertativas curtas
     Inclua gabarito completo com explicações.
  
  7. **Sugestões de Cronograma de Estudos**: 3 opções:
     - Revisão rápida (1 dia)
     - Padrão (3 dias)
     - Aprofundamento (7 dias)
  
  Formate o resultado em JSON válível com esta estrutura:
  {
    "summary": "string",
    "conceptMap": "string",
    "keyConcepts": [{"concept": "string", "explanation": "string"}],
    "keywords": [{"term": "string", "definitionLinks": {"wikipedia": "string", "additional": "string"}}],
    "flashcards": [{"front": "string", "back": "string"}],
    "quiz": [{"type": "string", "question": "string", "options": ["string"], "correctAnswer": "string", "explanation": "string"}],
    "studySchedules": [{"type": "string", "duration": "string", "description": "string", "activities": ["string"]}]
  }`;

  try {
    console.log('[IA] Chamando OpenAI Chat Completions', { model: opts?.model || 'gpt-4o-mini', textLength: text.length, filename });
    const completion = await openai.chat.completions.create({
      model: opts?.model || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente educacional especializado em criar materiais de estudo. Responda sempre em português brasileiro."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('[IA] Resposta recebida', { length: response?.length });
    
    if (!response) {
      throw new Error('Resposta vazia da IA');
    }

    // Try to parse JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('JSON parseado com sucesso');
      return parsedData;
    } else {
      console.error('Formato de resposta inválido. Resposta:', response.substring(0, 500));
      throw new Error('Formato de resposta inválido da IA');
    }
  } catch (error) {
    console.error('Erro na análise IA:', error);
    throw new Error('Erro ao gerar análise com IA: ' + (error as Error).message);
  }
}

// Função de fallback para quando a API key não está configurada
function generateSampleAnalysis(text: string, filename: string) {
  console.log('Gerando análise de exemplo para:', filename);
  
  return {
    summary: `Este material apresenta conceitos fundamentais sobre o tema abordado no arquivo "${filename}". O conteúdo é estruturado de forma progressiva, iniciando com conceitos básicos e evoluindo para aplicações mais complexas.`,
    conceptMap: `# Mapa Conceitual - ${filename}

## Conceitos Principais
- **Introdução**: Fundamentos básicos
- **Desenvolvimento**: Aprofundamento teórico  
- **Aplicações**: Casos práticos
- **Conclusões**: Síntese dos aprendizados

## Subtópicos Importantes
### 1. Fundamentos
- Definições básicas
- Contexto histórico
- Importância do tema

### 2. Aplicações Práticas
- Exemplos cotidianos
- Casos de estudo
- Exercícios práticos`,
    keyConcepts: [
      {
        concept: "Conceito Fundamental",
        explanation: "Este é o conceito base que serve como fundamento para todo o conteúdo apresentado no material."
      },
      {
        concept: "Aplicação Prática", 
        explanation: "Refere-se às formas como os conceitos teóricos são aplicados em situações reais e cotidianas."
      },
      {
        concept: "Análise Crítica",
        explanation: "Habilidade de avaliar e interpretar o conteúdo de forma crítica e construtiva."
      }
    ],
    keywords: [
      {
        term: "Aprendizado",
        definitionLinks: {
          wikipedia: "https://pt.wikipedia.org/wiki/Aprendizagem",
          additional: "https://www.khanacademy.org"
        }
      },
      {
        term: "Conhecimento",
        definitionLinks: {
          wikipedia: "https://pt.wikipedia.org/wiki/Conhecimento",
          additional: "https://www.brasilescola.com"
        }
      },
      {
        term: "Educação",
        definitionLinks: {
          wikipedia: "https://pt.wikipedia.org/wiki/Educa%C3%A7%C3%A3o",
          additional: "https://www.ted.com"
        }
      }
    ],
    flashcards: [
      {
        front: "Qual é o principal objetivo deste material?",
        back: "Proporcionar uma compreensão abrangente dos conceitos fundamentais através de uma abordagem estruturada e progressiva."
      },
      {
        front: "Como os conceitos são apresentados?",
        back: "De forma hierárquica, iniciando com fundamentos básicos e progredindo para aplicações mais complexas."
      },
      {
        front: "Qual a importância da prática no aprendizado?",
        back: "A prática permite consolidar os conceitos teóricos através da aplicação em situações reais."
      }
    ],
    quiz: [
      {
        type: "multiple_choice",
        question: "Qual é a estrutura recomendada para estudar este material?",
        options: ["Aleatória", "Progressiva", "Por tópicos isolados", "Apenas teórica"],
        correctAnswer: "Progressiva",
        explanation: "A estrutura progressiva permite construir conhecimento de forma sólida e consistente."
      },
      {
        type: "multiple_choice",
        question: "Quantos tipos de atividades práticas são sugeridas?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "3",
        explanation: "São sugeridas três abordagens: revisão rápida, padrão e aprofundamento."
      },
      {
        type: "true_false",
        question: "O material pode ser estudado em apenas um dia?",
        correctAnswer: true,
        explanation: "Sim, através da opção de revisão rápida, embora o aprofundamento leve mais tempo."
      },
      {
        type: "essay",
        question: "Descreva como você aplicaria os conceitos aprendidos em sua rotina.",
        correctAnswer: "Resposta pessoal - deve incluir exemplos concretos de aplicação dos conceitos."
      }
    ],
    studySchedules: [
      {
        type: "quick",
        duration: "1 dia",
        description: "Revisão rápida dos conceitos principais",
        activities: [
          "Ler o resumo geral (30 min)",
          "Revisar os conceitos-chave (45 min)",
          "Fazer o quiz de fixação (30 min)",
          "Revisar flashcards (45 min)"
        ]
      },
      {
        type: "standard",
        duration: "3 dias",
        description: "Estudo aprofundado com foco em aplicações práticas",
        activities: [
          "Dia 1: Resumo e mapa conceitual (2h)",
          "Dia 2: Conceitos e palavras-chave (2h)",
          "Dia 3: Flashcards, quiz e revisão (2h)"
        ]
      },
      {
        type: "deep",
        duration: "7 dias",
        description: "Imersão completa com pesquisa adicional",
        activities: [
          "Dia 1-2: Fundamentos e conceitos básicos",
          "Dia 3-4: Aplicações práticas e exemplos",
          "Dia 5-6: Aprofundamento e pesquisa complementar",
          "Dia 7: Revisão geral e autoavaliação"
        ]
      }
    ]
  };
}

async function generateWithGemini(text: string, filename: string, apiKey: string, model: string) {
  const systemText = `Você cria materiais de estudo completos e objetivos em português brasileiro, estritamente baseados no conteúdo fornecido e enriquecidos com referências confiáveis quando necessário. Use LaTeX para variáveis e unidades quando aparecerem em fórmulas ou explicações técnicas. Não invente fatos sem referência. Retorne JSON válido.`;
  const userText = `Arquivo: "${filename}"\n\nTexto extraído:\n${text}\n\nFormato obrigatório (JSON puro, sem texto fora do JSON):\n{
  "summary": string,
  "references": [{ "title": string, "url": string, "source"?: string }],
  "conceptMap": string,
  "keyConcepts": [{ "concept": string, "explanation": string, "details"?: string, "example"?: string, "imageUrl"?: string, "values"?: [{"label": string, "valueNumber"?: number, "unitPrefix"?: "m"|"k"|"M"|"G"|"" , "unitSymbol"?: "V"|"A"|"Ω"|"F"|"H"|"W"|"s", "formatted"?: string}], "formula"?: string }],
  "flashcards": [{ "front": string, "back": string }],
  "quiz": [{ "type": "multiple_choice" | "true_false" | "essay", "question": string, "options"?: string[], "correctAnswer": string | boolean, "explanation"?: string }],
  "studySchedules": [{ "type": "quick" | "standard" | "deep", "duration": string, "description": string, "activities": string[] }]
}
Instruções específicas para "keyConcepts":
- "formula": se houver, use LaTeX (display) com $$...$$ para a expressão geral do conceito.
- "example": inclua um exemplo resolvido: 1) apresente a fórmula em $$...$$, 2) mostre a substituição numérica com unidades e o resultado final, usando matemática inline $...$ quando apropriado.
- "values": liste os valores usados no exemplo (rótulo e valor com unidade).
Regras gerais:
- Baseie-se no texto extraído e complemente com referências confiáveis quando necessário.
- Nas strings de "explanation", "details" e "example", sempre use notação LaTeX para variáveis (ex: $V_{GS}$, $I_D$) e unidades (ex: $5\,V$, $10\,\Omega$). Não duplique valores (evitar padrões como "0V 0V").
- Retorne exclusivamente JSON válido.`;

  const candidates: string[] = [];
  candidates.push(model);
  if (!model.includes('-latest')) candidates.push(`${model}-latest`);
  candidates.push('gemini-flash-latest');

  let lastError: string | undefined;

  for (const m of candidates) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const body = {
        systemInstruction: {
          role: "system",
          parts: [{ text: systemText }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userText }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          response_mime_type: "application/json"
        }
      };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        let message = `Falha ao chamar Gemini (${res.status})`;
        try {
          const err = await res.json();
          message = err?.error?.message || message;
        } catch {}
        lastError = message;
        // Tentar próximo modelo
        continue;
      }

      const data = await res.json();
      let textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!textOutput && typeof data === 'object') {
        textOutput = JSON.stringify(data);
      }
      if (!textOutput) {
        lastError = 'Resposta vazia do Gemini';
        continue;
      }
      const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const raw = jsonMatch[0];
        try {
          return JSON.parse(raw);
        } catch (e) {
          const repaired = repairJsonBackslashes(raw);
          return JSON.parse(repaired);
        }
      }
      lastError = 'Formato de resposta inválido do Gemini';
    } catch (error) {
      lastError = (error as Error).message;
      continue;
    }
  }

  throw new Error(lastError || 'Não foi possível gerar com Gemini');
}

export async function extractTextWithGeminiFromPDF(buffer: Buffer, apiKey: string, model: string = 'gemini-flash-latest'): Promise<string> {
  console.log('[IA] Extraindo texto do PDF via Gemini', { model, size: buffer.length });
  const dataBase64 = buffer.toString('base64');
  const systemText = 'Você extrai texto puro de documentos PDF. Retorne apenas o texto contínuo, sem metadados, sem comentários.';
  const userText = 'Extraia todo o texto legível do PDF fornecido. Retorne somente texto puro.';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { role: 'system', parts: [{ text: systemText }] },
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: dataBase64 } },
          { text: userText }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192
    }
  };
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      let message = `Falha ao extrair texto com Gemini (${res.status})`;
      try { const err = await res.json(); message = err?.error?.message || message; } catch {}
      throw new Error(message);
    }
    const json = await res.json();
    const textOutput = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') || '';
    console.log('[IA] Texto extraído via Gemini, chars:', textOutput.length);
    return (textOutput || '').trim();
  } catch (err) {
    console.error('[IA] Erro ao extrair texto com Gemini', err);
    throw err instanceof Error ? err : new Error('Erro desconhecido ao extrair texto com Gemini');
  }
}

export async function generateExplanation(term: string, opts?: { provider?: string; apiKey?: string; model?: string }) {
  if (opts?.provider === 'google' && opts?.apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model || 'gemini-flash-latest'}:generateContent?key=${opts.apiKey}`
    const body = {
      systemInstruction: { role: 'system', parts: [{ text: 'Explique termos técnicos de forma objetiva em português. Use LaTeX para variáveis e unidades. Inclua um exemplo numérico (com substituição e resultado) quando aplicável. Sugira imagem via URL pública.' }] },
      contents: [
        { role: 'user', parts: [{ text: `Explique o termo: ${term}. Responda com JSON {"explanation": string, "imageUrl"?: string} e use $...$ / $$...$$ onde necessário.` }] }
      ],
      generationConfig: { temperature: 0.4, response_mime_type: 'application/json' }
    }
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) {
      let message = `Falha ao explicar termo (${res.status})`
      try { const err = await res.json(); message = err?.error?.message || message } catch {}
      throw new Error(message)
    }
    const json = await res.json()
    const textOutput = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const match = textOutput.match(/\{[\s\S]*\}/)
    if (match) {
      const raw = match[0]
      try { return JSON.parse(raw) } catch (e) {
        const repaired = repairJsonBackslashes(raw)
        return JSON.parse(repaired)
      }
    }
    return { explanation: textOutput }
  }
  return { explanation: term }
}

function repairJsonBackslashes(input: string): string {
  let out = ''
  let inString = false
  let escape = false
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (!inString) {
      out += ch
      if (ch === '"') { inString = true; escape = false }
      continue
    }
    if (escape) {
      out += ch
      escape = false
      continue
    }
    if (ch === '\\') {
      const next = input[i + 1]
      const valid = next && '"/bfnrtu'.includes(next)
      if (valid) {
        out += ch
      } else {
        out += '\\\\'
      }
      continue
    }
    if (ch === '"') {
      out += ch
      inString = false
      continue
    }
    out += ch
  }
  return out
}

export async function normalizeConcept(concept: any, opts?: { provider?: string; apiKey?: string; model?: string }) {
  if (opts?.provider === 'google' && opts?.apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model || 'gemini-flash-latest'}:generateContent?key=${opts.apiKey}`
    const schema = `{
      "concept": string,
      "explanation": string,
      "details"?: string,
      "formula"?: string,
      "example"?: string,
      "values"?: [{"label": string, "valueNumber"?: number, "unitPrefix"?: "m"|"k"|"M"|"G"|"", "unitSymbol"?: "V"|"A"|"Ω"|"F"|"H"|"W"|"s", "formatted"?: string}]
    }`
    const body = {
      systemInstruction: { role: 'system', parts: [{ text: 'Normalize em português um conceito técnico. Use LaTeX para variáveis/unidades em fórmula e exemplo. Retorne JSON puro conforme schema.' }] },
      contents: [
        { role: 'user', parts: [{ text: `Schema: ${schema}\n\nEntrada:\n${JSON.stringify(concept)}\n\nSaída: JSON puro conforme schema, com $$...$$ na fórmula e substituições com unidades no exemplo.` }] }
      ],
      generationConfig: { temperature: 0.3, response_mime_type: 'application/json' }
    }
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) {
      let message = `Falha ao normalizar conceito (${res.status})`
      try { const err = await res.json(); message = err?.error?.message || message } catch {}
      throw new Error(message)
    }
    const json = await res.json()
    const textOutput = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const match = textOutput.match(/\{[\s\S]*\}/)
    if (match) {
      const raw = match[0]
      try { return JSON.parse(raw) } catch (e) {
        const repaired = repairJsonBackslashes(raw)
        return JSON.parse(repaired)
      }
    }
    throw new Error('Resposta inválida da IA')
  }
  return concept
}