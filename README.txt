MRE PWA + Gemini (Netlify Functions)

✅ Isto FAZ leitura real (Gemini) — não é mock.

COMO PUBLICAR (Netlify):
1) Sobe este projeto para o GitHub (recomendado).
2) Netlify: New site from Git -> escolhe o repo.
3) Em Environment variables, cria:
   GEMINI_API_KEY = a tua key
4) Deploy.

NOTA:
- Upload manual (drag & drop) NÃO instala dependências nem functions.
- Para functions funcionarem, usa deploy via Git (ou Netlify CLI).

Endpoint:
- Frontend chama /api/analyze (redirect para /.netlify/functions/analyze)

