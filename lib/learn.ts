// Evergreen educational content for /learn. Static — no database, no API.

export type LearnLevel = "beginner" | "intermediate" | "advanced";

export interface LearnTopic {
  slug: string;
  title: string;
  level: LearnLevel;
  summary: string;
  body: string[]; // paragraphs
  keyPoints: string[];
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    slug: "what-is-ai",
    title: "What is AI?",
    level: "beginner",
    summary: "A plain-language introduction to artificial intelligence and what it can (and can't) do.",
    body: [
      "Artificial intelligence (AI) is a field of computer science focused on building systems that perform tasks normally requiring human intelligence: understanding language, recognizing images, making decisions, and learning from data.",
      "Most modern AI is machine learning: instead of hand-writing rules, engineers feed a model large amounts of data and let it discover patterns. The model is then tested on new data it has never seen to check whether it generalizes.",
      "Today's most visible AI systems are generative: they create new text, images, audio, and video. They are powerful but imperfect — they can be confidently wrong, reflect biases in their training data, and fail at tasks requiring genuine reasoning or up-to-date facts.",
    ],
    keyPoints: ["AI = systems that learn patterns from data", "Machine learning is the dominant approach", "Generative AI creates new content", "Models can be wrong — verification matters"],
  },
  {
    slug: "what-is-llm",
    title: "What is an LLM?",
    level: "beginner",
    summary: "Large language models explained: how they predict text and why scale matters.",
    body: [
      "A large language model (LLM) is an AI model trained on vast amounts of text to predict the next word (technically, the next token) in a sequence. Repeat that prediction thousands of times and you get fluent paragraphs, code, or conversation.",
      "The 'large' refers to both the training data (trillions of words) and the model's parameters — the adjustable numbers the model tunes during training. Modern frontier LLMs have hundreds of billions of parameters.",
      "LLMs don't 'understand' text the way people do; they model statistical patterns. But at sufficient scale, this produces surprisingly capable behavior: translation, summarization, coding, and step-by-step reasoning.",
    ],
    keyPoints: ["LLMs predict the next token, repeatedly", "Scale = data + parameters + compute", "Fluency emerges from pattern modeling", "Capable but not truly understanding"],
  },
  {
    slug: "what-is-transformer",
    title: "What is a Transformer?",
    level: "beginner",
    summary: "The neural network architecture behind nearly every modern AI model.",
    body: [
      "The Transformer is a neural network architecture introduced in the 2017 paper 'Attention Is All You Need.' It powers GPT, Claude, Gemini, Llama, and virtually every leading language model — plus many vision and audio models.",
      "Its key innovation is self-attention: when processing a word, the model weighs how relevant every other word in the input is. This lets it connect a pronoun to a noun ten paragraphs back, or relate distant parts of an image.",
      "Transformers process entire sequences in parallel during training, which is why they scaled so well on modern GPUs — and why AI progress accelerated after 2017.",
    ],
    keyPoints: ["Introduced in 2017, dominates modern AI", "Self-attention relates distant parts of input", "Parallel processing enabled massive scaling"],
  },
  {
    slug: "what-is-token",
    title: "What is a Token?",
    level: "beginner",
    summary: "The basic unit of text that language models actually read and write.",
    body: [
      "Models don't see words or characters directly — they see tokens, chunks of text produced by a tokenizer. A token might be a whole common word (' the'), part of a word (' un' + 'believ' + 'able'), or a single character for rare text.",
      "Roughly speaking, 1 token ≈ ¾ of a word in English, so 100 tokens ≈ 75 words. Tokenization affects cost (APIs charge per token), speed, and how well a model handles different languages.",
      "Token limits matter: a model's context window is measured in tokens, and everything you send plus everything it generates counts against that budget.",
    ],
    keyPoints: ["Tokens are text chunks, not words", "~¾ word per token in English", "APIs price by the token", "Context windows are measured in tokens"],
  },
  {
    slug: "what-is-context-length",
    title: "What is Context Length?",
    level: "beginner",
    summary: "How much a model can 'remember' at once — and why longer isn't always better.",
    body: [
      "Context length (or context window) is the maximum number of tokens a model can consider in a single request — your prompt plus its response. Modern models range from tens of thousands to over a million tokens.",
      "A larger window lets you paste in whole documents, codebases, or long conversations. But attention gets expensive as context grows, and models can lose track of details buried in the middle of very long inputs (the 'lost in the middle' effect).",
      "Techniques like RAG exist precisely because stuffing everything into context is costly and unreliable: retrieve only the relevant passages instead.",
    ],
    keyPoints: ["Max tokens per request (input + output)", "Longer context = more cost and compute", "Models can miss details in very long inputs", "RAG is often better than giant prompts"],
  },
  {
    slug: "what-is-rag",
    title: "What is RAG?",
    level: "intermediate",
    summary: "Retrieval-Augmented Generation: giving models access to your documents.",
    body: [
      "RAG connects a language model to external knowledge. When you ask a question, the system first searches a document store for relevant passages, then feeds those passages to the model along with your question.",
      "The documents are converted into embeddings (numerical vectors) and stored in a vector database, which finds passages by semantic similarity rather than keyword matching.",
      "RAG reduces hallucinations about facts the model wasn't trained on, keeps answers current without retraining, and lets models cite sources. It's the standard architecture for enterprise AI assistants and 'chat with your docs' products.",
    ],
    keyPoints: ["Retrieve relevant docs, then generate", "Embeddings enable semantic search", "Reduces hallucinations, adds citations", "Keeps knowledge current without retraining"],
  },
  {
    slug: "what-is-fine-tuning",
    title: "What is Fine-Tuning?",
    level: "intermediate",
    summary: "Teaching a pre-trained model new skills, styles, or domain knowledge.",
    body: [
      "Fine-tuning takes a pre-trained model and continues training it on a smaller, curated dataset to specialize it — for example, on medical Q&A, a company's support tone, or a new language.",
      "Full fine-tuning updates all parameters and is expensive. Parameter-efficient methods like LoRA update only a small set of adapter weights, making fine-tuning feasible on a single GPU.",
      "Fine-tuning changes behavior and style well, but it's a poor way to inject factual knowledge (use RAG for that), and it can degrade the model's general abilities if done carelessly.",
    ],
    keyPoints: ["Specializes pre-trained models on new data", "LoRA makes it cheap via adapter weights", "Good for style/behavior, bad for facts", "Use RAG for knowledge, fine-tuning for behavior"],
  },
  {
    slug: "what-is-inference",
    title: "What is Inference?",
    level: "intermediate",
    summary: "Running a trained model: the step that costs money at scale.",
    body: [
      "Inference is the process of running a trained model to get predictions — every ChatGPT answer is inference. Training happens once; inference happens billions of times.",
      "Inference cost depends on model size, hardware, and how many tokens are generated. This is why providers charge per token, and why smaller, optimized models matter for real products.",
      "Optimization techniques — quantization, distillation, speculative decoding, better serving software — all target making inference faster and cheaper without noticeably hurting quality.",
    ],
    keyPoints: ["Inference = running the model to get answers", "Happens far more often than training", "Cost scales with model size and tokens", "Optimization targets speed and cost per token"],
  },
  {
    slug: "what-is-quantization",
    title: "What is Quantization?",
    level: "intermediate",
    summary: "Shrinking models by using fewer bits per number — with minimal quality loss.",
    body: [
      "Model weights are numbers. Training typically uses 16-bit floats; quantization converts them to 8-bit, 4-bit, or even fewer bits, cutting memory use dramatically — a 70B model at 16-bit needs ~140 GB of VRAM, but ~40 GB at 4-bit.",
      "Lower precision introduces small rounding errors. Modern quantization methods (AWQ, GPTQ, GGUF quants) choose precision intelligently so quality loss is small for most uses.",
      "Quantization is what makes running capable models on consumer GPUs, laptops, and phones possible. It's the foundation of the local-AI ecosystem.",
    ],
    keyPoints: ["Fewer bits per weight = less memory", "70B model: ~140GB → ~40GB at 4-bit", "Smart methods keep quality loss small", "Enables local AI on consumer hardware"],
  },
  {
    slug: "what-is-gguf",
    title: "What is GGUF?",
    level: "intermediate",
    summary: "The file format that made running LLMs locally practical.",
    body: [
      "GGUF (GPT-Generated Unified Format) is a file format for storing quantized language models, designed for fast loading and efficient CPU/GPU inference. It's the standard format used by llama.cpp and its many frontends.",
      "A GGUF file bundles the model weights at a chosen quantization level (like Q4_K_M or Q8_0) plus metadata. You download one file and run it — no Python environment or complex setup required.",
      "When you see 'Llama 3 8B Q4_K_M GGUF' on Hugging Face, that's a 4-bit quantized Llama 3 8B packaged for local inference, typically needing ~5 GB of RAM.",
    ],
    keyPoints: ["Standard format for quantized local models", "Used by llama.cpp and many apps", "One file = runnable model", "Q4_K_M etc. denote quantization level"],
  },
  {
    slug: "what-is-moe",
    title: "What is Mixture of Experts?",
    level: "advanced",
    summary: "How models like Mixtral get big-model quality at small-model cost.",
    body: [
      "Mixture of Experts (MoE) is an architecture where a model contains many 'expert' sub-networks, but only a few are activated for each token. A router network decides which experts handle which input.",
      "A model might have 100B+ total parameters but only use 15B per token — getting near-big-model quality at a fraction of the inference cost. Mixtral, DeepSeek-V3, and GPT-4 (reportedly) use MoE.",
      "Trade-offs: MoE models need more total memory (all experts must be loaded) and can be trickier to fine-tune, but they're the dominant design for efficient frontier models.",
    ],
    keyPoints: ["Many experts, few active per token", "Big-model quality at lower inference cost", "Used by Mixtral, DeepSeek-V3", "More memory, cheaper compute per token"],
  },
  {
    slug: "what-are-ai-agents",
    title: "What are AI Agents?",
    level: "intermediate",
    summary: "AI systems that don't just answer — they act.",
    body: [
      "An AI agent is a system where a language model operates in a loop: it reasons about a goal, takes actions using tools (web browsing, code execution, APIs), observes the results, and continues until the task is done.",
      "Simple agents answer questions with tool help. Advanced agents can book travel, debug codebases, or run multi-step research — planning, recovering from errors, and asking for clarification.",
      "Key building blocks: tool/function calling, memory across steps, planning and reflection loops, and guardrails. Frameworks and protocols like MCP standardize how agents connect to tools.",
    ],
    keyPoints: ["Loop: reason → act → observe → repeat", "Tools turn chatbots into agents", "Planning and error recovery are key", "Guardrails matter as autonomy grows"],
  },
  {
    slug: "what-is-mcp",
    title: "What is MCP?",
    level: "intermediate",
    summary: "Model Context Protocol: a standard way to connect AI to tools and data.",
    body: [
      "MCP (Model Context Protocol), introduced by Anthropic, is an open standard for connecting AI assistants to external tools, databases, and services — like 'USB-C for AI apps.'",
      "Instead of every AI app building custom integrations, a tool exposes an MCP server describing its capabilities; any MCP-compatible client (Claude, IDEs, agents) can then use it.",
      "MCP servers exist for GitHub, databases, web search, file systems, and thousands of services. It's become the de facto standard for agent tooling.",
    ],
    keyPoints: ["Open standard for AI ↔ tool connections", "Created by Anthropic, widely adopted", "One integration works across many AI apps", "The backbone of the agent tooling ecosystem"],
  },
  {
    slug: "what-are-embeddings",
    title: "What are Embeddings?",
    level: "intermediate",
    summary: "Turning text into numbers so machines can measure meaning.",
    body: [
      "An embedding is a list of numbers (a vector) representing a piece of text, produced by an embedding model. Texts with similar meaning get similar vectors — 'king' and 'queen' sit close together in embedding space.",
      "Similarity is measured with math (usually cosine similarity), which lets systems find semantically related documents without keyword matching — the engine behind RAG and semantic search.",
      "Embedding models are small and fast compared to LLMs. Choosing a good one matters: domain-specific embeddings dramatically improve retrieval quality.",
    ],
    keyPoints: ["Text → vector of numbers", "Similar meaning = similar vectors", "Powers semantic search and RAG", "Small, fast models — choose well for your domain"],
  },
  {
    slug: "what-is-vector-database",
    title: "What is a Vector Database?",
    level: "advanced",
    summary: "Storage engineered for similarity search over embeddings.",
    body: [
      "A vector database stores embeddings and finds the nearest neighbors to a query vector in milliseconds — even across billions of items — using approximate nearest neighbor (ANN) indexes like HNSW or IVF.",
      "Popular options include pgvector (Postgres extension), Qdrant, Weaviate, Pinecone, and Milvus. Choice depends on scale, filtering needs, and whether you want managed or self-hosted.",
      "In a RAG pipeline, the vector DB is the retrieval layer: embed the user query, fetch the top-k similar chunks, and pass them to the LLM. Hybrid search (vectors + keywords) usually beats pure vector search.",
    ],
    keyPoints: ["ANN indexes enable millisecond similarity search", "Options: pgvector, Qdrant, Weaviate, Pinecone, Milvus", "The retrieval layer of RAG systems", "Hybrid (vector + keyword) search works best"],
  },
  {
    slug: "what-is-multimodal",
    title: "What is Multimodal AI?",
    level: "beginner",
    summary: "Models that see, hear, and read — not just text.",
    body: [
      "Multimodal AI handles multiple types of input and output: text, images, audio, and video. GPT-4o, Gemini, and Claude can all 'see' images and discuss them; newer systems generate video and speech too.",
      "Under the hood, different encoders convert each modality into a shared representation the model can reason over — an image becomes a sequence of visual tokens alongside text tokens.",
      "Multimodality unlocks use cases text-only models can't touch: analyzing charts, describing photos, transcribing meetings, narrating video, and controlling robots that perceive the world.",
    ],
    keyPoints: ["Handles text, images, audio, video", "Shared representation across modalities", "Enables vision, speech, and video use cases", "GPT-4o, Gemini, Claude are multimodal"],
  },
  {
    slug: "what-are-ai-benchmarks",
    title: "What are AI Benchmarks?",
    level: "intermediate",
    summary: "How the industry measures model capability — and why scores need context.",
    body: [
      "Benchmarks are standardized test sets used to compare models: MMLU (general knowledge), HumanEval and SWE-bench (coding), MATH (math reasoning), MMMU (multimodal), and many more.",
      "They're useful but gameable — models can be trained on benchmark-like data (contamination), and a high score on one test doesn't guarantee real-world usefulness. Newer evaluation favors agentic tasks and human preference (like LMArena).",
      "Read benchmark claims critically: check who ran the test, on what version, and whether independent evaluations agree. A single chart from a launch blog is marketing; replicated results are evidence.",
    ],
    keyPoints: ["Standardized tests: MMLU, SWE-bench, MATH, MMMU", "Useful but gameable and contamination-prone", "Human-preference evals complement static tests", "Treat launch charts as marketing until replicated"],
  },
  {
    slug: "open-vs-closed-models",
    title: "Open vs Closed Models",
    level: "beginner",
    summary: "The most important strategic choice in AI: open weights vs proprietary APIs.",
    body: [
      "Closed models (GPT-4, Claude, Gemini) are accessed via API: easy to use, always updated, but you can't inspect or self-host them, and your data leaves your infrastructure.",
      "Open-weight models (Llama, Mistral, Qwen, DeepSeek) publish their weights: you can download, fine-tune, and run them anywhere — including fully offline. 'Open' varies: weights may be open while training data and code stay closed.",
      "The trade-off: closed models usually lead on raw capability and convenience; open models win on cost at scale, privacy, customization, and independence from any single vendor.",
    ],
    keyPoints: ["Closed = API access, vendor-controlled", "Open-weight = downloadable, self-hostable", "'Open' is a spectrum, not a binary", "Choose by capability, cost, privacy, control"],
  },
  {
    slug: "running-ai-locally",
    title: "Running AI Locally",
    level: "advanced",
    summary: "A practical guide to running models on your own hardware.",
    body: [
      "Running models locally means no API costs, no data leaving your machine, and no rate limits. The recipe: pick a quantized GGUF model sized for your RAM/VRAM, and run it with llama.cpp, Ollama, LM Studio, or text-generation-webui.",
      "Rough sizing: 7–8B models run on 8–16 GB RAM; 70B models need ~40 GB at 4-bit quantization (high-end GPUs or Apple Silicon with unified memory). Speed is measured in tokens/second — 10+ t/s feels interactive.",
      "Beyond chat: local embeddings power private RAG, and local image models (Stable Diffusion, Flux) run well on consumer GPUs. Start small, verify quality on your tasks, then scale up.",
    ],
    keyPoints: ["No API costs, full data privacy", "Match model size to your RAM/VRAM", "llama.cpp, Ollama, LM Studio are easy starts", "Start small, scale after verifying quality"],
  },
  {
    slug: "what-is-attention",
    title: "What is Attention?",
    level: "advanced",
    summary: "The mechanism that lets models focus on what matters.",
    body: [
      "Attention is the core operation of the Transformer: for each token, the model computes how much 'attention' to pay to every other token, then blends their information accordingly. The famous formula — softmax(QK^T/√d)V — is just weighted averaging with learned weights.",
      "Multi-head attention runs this process many times in parallel with different learned projections, letting the model track grammar, coreference, and long-range dependencies simultaneously.",
      "Why it matters: attention is what gives Transformers their memory of context, but its cost grows quadratically with sequence length — the fundamental reason long context is expensive, and why efficient-attention research (FlashAttention, linear attention) is so active.",
    ],
    keyPoints: ["Weighted averaging over all tokens", "Multi-head = many relations in parallel", "Quadratic cost drives long-context expense", "FlashAttention made it far more efficient"],
  },
];

export function learnTopicBySlug(slug: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((t) => t.slug === slug);
}

export const LEARN_LEVELS: { slug: LearnLevel; label: string }[] = [
  { slug: "beginner", label: "Beginner" },
  { slug: "intermediate", label: "Intermediate" },
  { slug: "advanced", label: "Advanced" },
];
