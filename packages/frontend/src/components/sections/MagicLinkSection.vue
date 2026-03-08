<template>
  <div class="magic-link-section">
    <h2>🔐 Premier accès?</h2>
    <div class="header-text-container">
      <p class="main-description">
        Cliquez sur le lien magic que vous avez reçu par email pour configurer votre authentification FreeOTP.
      </p>
    </div>

    <div class="info-box">
      <div class="info-box-header">
        <h3>Mode d'emploi</h3>
      </div>
      <div class="info-box-content">
        <ol>
          <li>Cliquez sur le lien magic reçu par email</li>
          <li>Scannez le code QR avec <strong>FreeOTP</strong></li>
          <li>Entrez les 6 chiffres du code généré</li>
          <li>Vous serez automatiquement connecté</li>
        </ol>
      </div>
      <p class="note-footer">
        Si vous n'avez pas reçu de lien, contactez l'
        <a href="mailto:support@formation-a11y.fr" class="support-link">administrateur</a>.
      </p>
    </div>
  </div>
</template>

<style scoped>
.magic-link-section {
  background: #1a1a2e;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem 1.5rem;
  height: 100%; /* S'adapte au parent grid */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.magic-link-section h2 {
  color: #f8fafc;
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-size: 1.6rem;
}

.header-text-container {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.main-description {
  color: #cbd5e1;
  text-align: center;
  margin: 0;
  line-height: 1.5;
  font-size: 1.05rem;
}

.info-box {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 10px;
  border: 1px solid #475569;
  display: flex;
  flex-direction: column;
  flex: 1; /* Remplace flex-grow: 1 */
  overflow: visible; /* Remplace overflow: hidden pour voir la note */
  width: 100%;
}

.info-box-header {
  padding: 1rem 1.5rem;
  background: rgba(102, 126, 234, 0.1);
  border-bottom: 1px solid #334155;
}

.info-box-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #818cf8;
  text-align: left;
}

.info-box-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Changé de center à flex-start */
}

.info-box ol {
  margin: 0;
  padding-left: 1.2rem;
  color: #94a3b8;
}

.info-box li {
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #cbd5e1;
}

.note-footer {
  margin: 0;
  padding: 0.75rem 1.25rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 1px solid #334155;
  font-size: 0.85rem;
  font-style: italic;
  color: #94a3b8;
  min-height: 50px;
  display: flex;
  align-items: center;
  text-align: left;
}

.support-link {
  color: #818cf8;
  text-decoration: underline;
  margin-left: 0.3rem;
  transition: color 0.2s;
}

.support-link:hover {
  color: #a5b4fc;
}

.support-link:focus {
  outline: 2px solid #ef4444;
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
