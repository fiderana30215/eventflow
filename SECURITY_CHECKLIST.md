# Checklist Sécurité — EventFlow

## Déjà en place
- [x] Mots de passe hashés avec bcrypt (jamais en clair)
- [x] JWT signé avec secret en .env
- [x] Requêtes SQL paramétrées ($1, $2...) partout — pas de concaténation de strings (protection injection SQL)
- [x] helmet() actif — en-têtes de sécurité HTTP
- [x] express-rate-limit — 100 requêtes / 15 min par IP
- [x] Rôles vérifiés via middleware authorize() sur les routes sensibles
- [x] .env jamais commité (vérifier .gitignore)
- [x] Webhook Stripe vérifié par signature (stripe.webhooks.constructEvent)

## À vérifier avant la soutenance
- [ ] Confirmer qu'aucun .env n'est dans l'historique Git :
      git log --all --full-history -- "**/.env"
- [ ] Vérifier .gitignore à la racine ET dans backend/ et frontend/
- [ ] Valider les inputs côté backend (email format, longueur password) —
      actuellement basique, à renforcer avec une lib comme zod ou express-validator si le temps permet
- [ ] CORS restreint à l'origine du frontend en production (actuellement cors() ouvert à tous — acceptable en dev, à restreindre si déployé)
- [ ] Ne jamais exposer les stack traces d'erreur en production (actuellement console.error côté serveur seulement — bon)

## Commande de vérification .gitignore
cat .gitignore
cat backend/.gitignore 2>/dev/null || echo "manquant"
cat frontend/.gitignore 2>/dev/null || echo "existe déjà (généré par Vite)"