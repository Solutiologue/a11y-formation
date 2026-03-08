const { PrismaClient } = require('@prisma/client');
async function main() {
  const prisma = new PrismaClient();
  console.log('Clearing existing data...');
  await prisma.slide.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.trainee.deleteMany();
  await prisma.session.deleteMany();
  await prisma.campus.deleteMany();
  console.log('Creating schools and campuses...');
  const schools = ['IPSSI', 'Ynov', 'EPSI'];
  const schoolMap = new Map();

  for (const name of schools) {
    const school = await prisma.school.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    schoolMap.set(name, school.id);
  }

  const campusData = [
    // IPSSI
    { name: 'Paris', schoolName: 'IPSSI' },
    { name: 'Marne-la-Vallée', schoolName: 'IPSSI' },
    { name: 'Lyon', schoolName: 'IPSSI' },
    { name: 'Nice', schoolName: 'IPSSI' },
    { name: 'Montpellier', schoolName: 'IPSSI' },
    { name: 'Toulouse', schoolName: 'IPSSI' },
    { name: 'Bordeaux', schoolName: 'IPSSI' },
    { name: 'Nantes', schoolName: 'IPSSI' },
    { name: 'Lille', schoolName: 'IPSSI' },
    // YNOV
    { name: 'Paris', schoolName: 'Ynov' },
    { name: 'Lyon', schoolName: 'Ynov' },
    { name: 'Bordeaux', schoolName: 'Ynov' },
    { name: 'Nantes', schoolName: 'Ynov' },
    { name: 'Toulouse', schoolName: 'Ynov' },
    { name: 'Montpellier', schoolName: 'Ynov' },
    { name: 'Aix-en-Provence', schoolName: 'Ynov' },
    { name: 'Nice', schoolName: 'Ynov' },
    { name: 'Rennes', schoolName: 'Ynov' },
    { name: 'Lille', schoolName: 'Ynov' },
    { name: 'Strasbourg', schoolName: 'Ynov' },
    // EPSI
    { name: 'Paris', schoolName: 'EPSI' },
    { name: 'Lyon', schoolName: 'EPSI' },
    { name: 'Bordeaux', schoolName: 'EPSI' },
    { name: 'Nantes', schoolName: 'EPSI' },
    { name: 'Toulouse', schoolName: 'EPSI' },
    { name: 'Lille', schoolName: 'EPSI' },
    { name: 'Montpellier', schoolName: 'EPSI' },
    { name: 'Brest', schoolName: 'EPSI' },
    { name: 'Grenoble', schoolName: 'EPSI' },
    { name: 'Reims', schoolName: 'EPSI' },
    { name: 'Rennes', schoolName: 'EPSI' }
  ];

  for (const c of campusData) { 
    await prisma.campus.create({ 
      data: { 
        name: c.name, 
        schoolId: schoolMap.get(c.schoolName) 
      } 
    }); 
  }

  console.log('Creating session...');
  const session = await prisma.session.create({ 
    data: { 
      code: 'A11Y2026', 
      schoolId: schoolMap.get('IPSSI'), 
      startDate: new Date('2026-03-01'), 
      endDate: new Date('2026-03-02'), 
      traineeCount: 0 
    } 
  });
  console.log('Creating detailed chapters and slides for 2-day Accessible Dev Training...');
  const trainingPlan = [
    // JOUR 1 - 5h45 total
    {
      title: 'J1-C1: Fondamentaux de l’Accessibilité (1h15)',
      description: 'Pourquoi et comment rendre le web accessible.',
      order: 0,
      slides: [
        { title: 'Qu’est-ce que l’accessibilité ?', content: '<div class="slide-content"><h3>Définition</h3><p>L’accessibilité numérique consiste à rendre les services en ligne accessibles à tous, quel que soit le matériel, le logiciel, l’infrastructure réseau, la langue maternelle, la culture, la localisation géographique ou les aptitudes physiques ou mentales.</p><div class="info-box"><ul><li>Handicaps visuels (Cécité, malvoyance, daltonisme).</li><li>Handicaps auditifs (Surdité, malentendance).</li><li>Handicaps moteurs (Tremblements, paralysie).</li><li>Handicaps cognitifs (Dyslexie, troubles de l’attention).</li></ul></div></div>', order: 0 },
        { title: 'Les 4 principes du WCAG (POUR)', content: '<div class="slide-content"><h3>L’acronyme POUR</h3><ol><li><strong>Perceptible :</strong> Les informations et les composants de l’interface utilisateur doivent être présentés de manière à ce que les utilisateurs puissent les percevoir.</li><li><strong>Utilisable :</strong> Les composants de l’interface utilisateur et la navigation doivent être utilisables.</li><li><strong>Compréhensible :</strong> Les informations et l’utilisation de l’interface utilisateur doivent être compréhensibles.</li><li><strong>Robuste :</strong> Le contenu doit être suffisamment robuste pour être interprété de manière fiable par une large variété d’agents utilisateurs, y compris les technologies d’assistance.</li></ol></div>', order: 1 },
        { title: 'Cadre légal et Normatif', content: '<div class="slide-content"><h3>RGAA & WCAG</h3><ul><li><strong>WCAG :</strong> Standard international (W3C) avec 3 niveaux (A, AA, AAA).</li><li><strong>RGAA :</strong> Référentiel Général d’Amélioration de l’Accessibilité.</li><li><strong>Loi 2005 :</strong> Article 47 sur l’accessibilité des services de communication publique en ligne.</li><li><strong>Sanctions :</strong> Jusqu’à 25 000 € d’amende par an et par service.</li></ul></div>', order: 2 },
        { title: 'Comment naviguent les utilisateurs ?', content: '<div class="slide-content"><h3>Technologies d’assistance</h3><div class="code-block"><p>Les outils les plus fréquents :</p><ul><li>Lecteurs d’écran (NVDA sur Windows, VoiceOver sur Mac/iOS).</li><li>Plages braille (pour les personnes sourdes-aveugles).</li><li>Navigation au clavier (sans souris).</li><li>Contacteurs (pour les handicaps moteurs lourds).</li></ul></div></div>', order: 3 },
        { title: 'Le handicap situationnel', content: '<div class="slide-content"><h3>Tout le monde est concerné</h3><p>L’accessibilité aide aussi :</p><ul><li>Une maman avec une poussette devant un trottoir (moteur).</li><li>Un utilisateur en plein soleil qui ne voit pas son écran (visuel).</li><li>Une personne dans les transports sans écouteurs (auditif).</li><li>Un utilisateur fatigué qui a du mal à se concentrer (cognitif).</li></ul></div>', order: 4 }
      ]
    },
    {
      title: 'J1-C2: Structure et Sémantique HTML (1h30)',
      description: 'Le rôle crucial du balisage natif.',
      order: 1,
      slides: [
        { title: 'Le rôle de la sémantique', content: '<div class="slide-content"><h3>Pourquoi HTML Sémantique ?</h3><p>Le navigateur utilise les balises pour construire l’<strong>Accessibility Tree</strong> (l’arbre d’accessibilité). Une &lt;div&gt; n’a aucun sens, un &lt;button&gt; est un élément interactif natif.</p><div class="warning">N’utilisez pas de div clickable ! Utilisez des boutons.</div></div>', order: 0 },
        { title: 'Les balises de structure (Landmarks)', content: '<div class="slide-content"><h3>Organiser sa page</h3><pre class="html-snippet">&lt;header&gt;...&lt;/header&gt;\n&lt;nav aria-label="Menu principal"&gt;...&lt;/nav&gt;\n&lt;main&gt;\n  &lt;section&gt;...&lt;/section&gt;\n  &lt;aside&gt;...&lt;/aside&gt;\n&lt;/main&gt;\n&lt;footer&gt;...&lt;/footer&gt;</pre></div>', order: 1 },
        { title: 'La hiérarchie des titres (Hn)', content: '<div class="slide-content"><h3>Structure logique</h3><ul><li>Le &lt;h1&gt; est le titre du contenu principal.</li><li>Pas de saut de niveau : h2 -> h3 -> h4 (OK).</li><li>Erreur classique : h2 -> h4 (Pas de h3 !).</li></ul><p>Les lecteurs d’écran offrent un menu pour naviguer de titre en titre.</p></div>', order: 2 },
        { title: 'Listes et regroupements', content: '<div class="slide-content"><h3>Annoncer le nombre d’éléments</h3><p>En utilisant &lt;ul&gt; ou &lt;ol&gt;, le lecteur d’écran annonce : "Liste de 5 éléments". C’est essentiel pour la navigation.</p><pre>&lt;ul&gt;\n  &lt;li&gt;Élément 1&lt;/li&gt;\n  &lt;li&gt;Élément 2&lt;/li&gt;\n&lt;/ul&gt;</pre></div>', order: 3 },
        { title: 'Intitulés de liens', content: '<div class="slide-content"><h3>Être explicite</h3><p>Le lien doit être compréhensible hors contexte.</p>❌ "Cliquez ici"<br>✅ "Lire le rapport annuel 2023 (PDF, 2Mo)"</div>', order: 4 }
      ]
    },
    {
      title: 'J1-C3: Images et Médias (1h)',
      description: 'Gérer les alternatives textuelles.',
      order: 2,
      slides: [
        { title: 'L’attribut alt', content: '<div class="slide-content"><h3>L’alternative textuelle</h3><pre>&lt;img src="..." alt="Description ici"&gt;</pre><ul><li>Si l’image est <strong>informative</strong> : Décrire le contenu.</li><li>Si l’image est <strong>décorative</strong> : alt="" (vide).</li><li>Si l’image est <strong>fonctionnelle</strong> : Décrire l’action (ex: "Valider la recherche").</li></ul></div>', order: 0 },
        { title: 'Cas particuliers : Images complexes', content: '<div class="slide-content"><h3>Graphiques et schémas</h3><p>Pour un graphique complexe, le "alt" ne suffit pas. Il faut :</p><ol><li>Une description courte dans le alt.</li><li>Une transcription complète dans le texte de la page ou via un lien.</li></ol></div>', order: 1 },
        { title: 'Captchas et Alternatives', content: '<div class="slide-content"><h3>Le cauchemar des captchas</h3><p>Un captcha visuel (image) doit TOUJOURS avoir une alternative (audio, ou validation par mail/SMS).</p></div>', order: 2 },
        { title: 'Médias temporels (Vidéo)', content: '<div class="slide-content"><h3>Accessibilité vidéo</h3><ul><li>Sous-titres (pour les sourds).</li><li>Audiodescription (pour les aveugles).</li><li>Transcription (pour tous).</li></ul></div>', order: 3 }
      ]
    },
    {
      title: 'J1-C4: Méthodologie d’Audit (1h30)',
      description: 'Apprendre à tester son code.',
      order: 3,
      slides: [
        { title: 'Audit Manuel vs Auto', content: '<div class="slide-content"><h3>Les limites des outils</h3><p>L’automatisme (Lighthouse, Axe) ne détecte que 30% à 40% des erreurs. L’audit humain est indispensable.</p></div>', order: 0 },
        { title: 'Test n°1 : Le clavier', content: '<div class="slide-content"><h3>Un test simple et puissant</h3><ul><li>Utiliser la touche <strong>Tab</strong> pour avancer.</li><li><strong>Maj+Tab</strong> pour reculer.</li><li><strong>Entrée/Espace</strong> pour activer.</li><li>Le focus est-il toujours visible ?</li></ul></div>', order: 1 },
        { title: 'Test n°2 : Les lecteurs d’écran', content: '<div class="slide-content"><h3>Vérifier le rendu vocal</h3><p>Est-ce que l’ordre de lecture est logique ? Est-ce que les éléments interactifs sont bien annoncés ?</p></div>', order: 2 },
        { title: 'Outils recommandés', content: '<div class="slide-content"><ul><li><strong>WAVE :</strong> Extension navigateur.</li><li><strong>Axe DevTools :</strong> Pour un audit technique.</li><li><strong>Contrast Checker :</strong> Pour les couleurs.</li><li><strong>Lighthouse :</strong> Score global.</li></ul></div>', order: 3 },
        { title: 'Démonstration d’audit', content: '<div class="slide-content"><h3>Étude de cas</h3><p>Audit rapide d’un site de e-commerce classique : identification des pièges à clavier dans le menu.</p></div>', order: 4 }
      ]
    },
    {
      title: 'Quiz Jour 1 (30min)',
      description: 'Validation des fondamentaux.',
      order: 4,
      slides: [
        { title: 'Consignes du Quiz', content: '<div class="slide-content"><h3>Instructions</h3><ul><li>10 questions à choix multiples.</li><li>Une seule bonne réponse par question.</li><li>30 minutes maximum.</li></ul><p>Thèmes : Sémantique, Loi, Images, Audit de base.</p></div>', order: 0 },
        { title: 'Prêt pour le Quiz ?', content: '<div class="slide-content"><button class="btn-primary">Démarrer le Quiz J1</button></div>', order: 1 }
      ]
    },
    // JOUR 2
    {
      title: 'J2-C1: Couleurs et Contrastes (1h)',
      description: 'Design accessible et lisibilité.',
      order: 5,
      slides: [
        { title: 'Les ratios de contraste', content: '<div class="slide-content"><h3>Règles WCAG AA</h3><ul><li>Texte standard (&lt; 24px) : <strong>4.5:1</strong>.</li><li>Gros texte (> 24px) : <strong>3:1</strong>.</li><li>Composants d’interface (bordures, icônes) : <strong>3:1</strong>.</li></ul></div>', order: 0 },
        { title: 'Validation des couleurs', content: '<div class="slide-content"><h3>Au-delà du contraste</h3><p>Ne pas utiliser la couleur comme UNIQUE moyen d’information.</p>❌ "Les champs en rouge sont obligatoires"<br>✅ "Les champs en rouge avec un astérisque (*) sont obligatoires"</div>', order: 1 },
        { title: 'Daltonisme et Vision', content: '<div class="slide-content"><h3>Simulateurs</h3><p>Tester son interface avec des filtres pour le daltonisme (Protanopie, Deutéranopie).</p></div>', order: 2 },
        { title: 'Mode Sombre et High Contrast', content: '<div class="slide-content"><h3>Préférences systèmes</h3><p>Utiliser les media-queries <code>prefers-color-scheme</code> et supporter le mode contraste élevé de Windows.</p></div>', order: 3 }
      ]
    },
    {
      title: 'J2-C2: Formulaires Accessibles (1h30)',
      description: 'Accompagner l’utilisateur dans la saisie.',
      order: 6,
      slides: [
        { title: 'Liaison Label / Input', content: '<div class="slide-content"><h3>Le duo inséparable</h3><pre>&lt;label for="email"&gt;Email&lt;/label&gt;\n&lt;input id="email" type="email"&gt;</pre><p>Cliquer sur le label doit mettre le focus dans l’input.</p></div>', order: 0 },
        { title: 'Groupements : Fieldset & Legend', content: '<div class="slide-content"><h3>Contextualiser les choix</h3><p>Sert à regrouper des boutons radio ou des checkboxes.</p><pre>&lt;fieldset&gt;\n  &lt;legend&gt;Mode de livraison&lt;/legend&gt;\n  &lt;input type="radio" id="relais" name="m"&gt;&lt;label for="relais"&gt;Point relais&lt;/label&gt;\n&lt;/fieldset&gt;</pre></div>', order: 1 },
        { title: 'Aide à la saisie', content: '<div class="slide-content"><h3>aria-describedby</h3><p>Lier un texte d’aide ou une erreur à un champ de saisie pour qu’il soit lu automatiquement.</p><pre>&lt;input aria-describedby="help-text"&gt;\n&lt;p id="help-text"&gt;8 caractères minimum&lt;/p&gt;</pre></div>', order: 2 },
        { title: 'Validation et Alertes', content: '<div class="slide-content"><h3>Informer l’utilisateur</h3><ul><li><code>aria-invalid="true"</code> si erreur.</li><li><code>required</code> natif ou <code>aria-required="true"</code>.</li><li>Messages d’erreurs clairs et explicites.</li></ul></div>', order: 3 },
        { title: 'Autocomplete', content: '<div class="slide-content"><h3>L’attribut autocomplete</h3><p>Faciliter la saisie en suggérant les bonnes données (nom, adresse, tel).</p></div>', order: 4 }
      ]
    },
    {
      title: 'J2-C3: Introduction à l’API ARIA (1h15)',
      description: 'Corriger les limitations du HTML natif.',
      order: 7,
      slides: [
        { title: 'La règle d’or n°1 d’ARIA', content: '<div class="slide-content"><h3>Don’t use ARIA</h3><p>Si vous pouvez utiliser un élément HTML natif (&lt;button&gt;, &lt;details&gt;), ne rajoutez pas d’ARIA.</p></div>', order: 0 },
        { title: 'Rôles, États et Propriétés', content: '<div class="slide-content"><ul><li><strong>Rôles :</strong> Que suis-je ? (tab, alert, dialog).</li><li><strong>États :</strong> Dans quel état suis-je ? (aria-expanded, aria-checked).</li><li><strong>Propriétés :</strong> Quelles sont mes caractéristiques ? (aria-label).</li></ul></div>', order: 1 },
        { title: 'aria-label vs aria-labelledby', content: '<div class="slide-content"><h3>Nommer les composants</h3><ul><li><code>aria-label</code> : Le nom est écrit dans l’attribut.</li><li><code>aria-labelledby</code> : Le nom est l’ID d’un autre élément existant.</li></ul></div>', order: 2 },
        { title: 'Aria-live : Les régions dynamiques', content: '<div class="slide-content"><h3>Annoncer sans recharger</h3><pre>&lt;div aria-live="polite"&gt;Message de succès&lt;/div&gt;</pre><ul><li><strong>polite :</strong> Attend la fin de la lecture en cours.</li><li><strong>assertive :</strong> Interrompt tout de suite.</li></ul></div>', order: 3 },
        { title: 'Hidden et Focus', content: '<div class="slide-content"><h3>aria-hidden="true"</h3><p>Masquer un élément COMPLETEMENT (visuel + lecteur d’écran) sans utiliser display:none.</p></div>', order: 4 }
      ]
    },
    {
      title: 'J2-C4: Composants Complexes (1h30)',
      description: 'JavaScript et focus management.',
      order: 8,
      slides: [
        { title: 'La Modale (Fenêtre de dialogue)', content: '<div class="slide-content"><h3>Checklist d’accessibilité</h3><ul><li>Rôle <code>dialog</code> ou <code>alertdialog</code>.</li><li>Piéger le focus (Focus Trap).</li><li>Fermeture avec la touche <strong>Echap</strong>.</li><li>Restaurer le focus sur le bouton d’ouverture à la fermeture.</li></ul></div>', order: 0 },
        { title: 'Les Accordéons', content: '<div class="slide-content"><h3>Pattern standard</h3><pre>&lt;button aria-expanded="false" aria-controls="content-id"&gt;...&lt;/button&gt;\n&lt;div id="content-id" hidden&gt;...&lt;/div&gt;</pre></div>', order: 1 },
        { title: 'Système d’onglets (Tabs)', content: '<div class="slide-content"><h3>ARIA complexe</h3><ul><li>Role <code>tablist</code>, <code>tab</code>, <code>tabpanel</code>.</li><li>Flèches clavier pour naviguer entre onglets.</li></ul></div>', order: 2 },
        { title: 'Focus Management JS', content: '<div class="slide-content"><h3>La méthode .focus()</h3><p>Savoir quand et où déplacer le focus programmeur-ment lors des interactions dynamiques.</p></div>', order: 3 },
        { title: 'Tests de régression a11y', content: '<div class="slide-content"><h3>CI/CD</h3><p>Intégrer des outils comme <code>pa11y</code> ou <code>playwright-axe</code> dans la pipeline de déploiement.</p></div>', order: 4 }
      ]
    },
    {
      title: 'Quiz Jour 2 (30min)',
      description: 'Validation technique finale.',
      order: 9,
      slides: [
        { title: 'Consignes de l’Examen Final', content: '<div class="slide-content"><h3>Bilan de la formation</h3><ul><li>15 questions techniques (ARIA, JS, Gestion du focus).</li><li>Une étude de cas sur un formulaire.</li><li>30 minutes.</li></ul></div>', order: 0 },
        { title: 'Prêt pour l’Examen ?', content: '<div class="slide-content"><button class="btn-primary">Lancer l’Examen Final</button></div>', order: 1 }
      ]
    }
  ];


  for (const chapData of trainingPlan) {
    await prisma.chapter.create({
      data: {
        title: chapData.title,
        description: chapData.description,
        order: chapData.order,
        isLocked: true, // Tout verrouillé par défaut
        session: { connect: { id: session.id } },
        slides: {
          create: chapData.slides.map(s => ({
            title: s.title,
            content: s.content,
            order: s.order
          }))
        }
      }
    });
  }

  console.log('Creating trainer...');
  await prisma.trainer.create({ data: { firstname: 'Thierry', lastname: 'Mallet', email: 'thierry@formation-a11y.fr', sessionId: session.id, resetTotp: false, totpSecret: 'HY3WY435IZMWM2CB' } });
  console.log('Seed OK');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
