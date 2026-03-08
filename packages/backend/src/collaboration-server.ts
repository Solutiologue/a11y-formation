import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { prisma } from "./config/prisma";

const server = new Server({
  port: 1234,
  name: "a11y-collaboration",
  
  extensions: [
    new Logger(),
    new Database({
      // Récupération des données depuis MySQL (Prisma)
      fetch: async ({ documentName }) => {
        const doc = await prisma.collaborationDocument.findUnique({
          where: { name: documentName },
        });
        return doc ? doc.data : null;
      },
      // Sauvegarde des données dans MySQL (Prisma)
      store: async ({ documentName, state }) => {
        await prisma.collaborationDocument.upsert({
          where: { name: documentName },
          update: { data: state },
          create: { name: documentName, data: state },
        });
      },
    }),
  ],

  async onAuthenticate(data) {
    // Logique d'authentification simple (à étendre si besoin)
    console.log(`Authenticating connection for document: ${data.documentName}`);
    return true;
  },

  async onDestroy() {
    console.log("Server shutting down...");
  }
});

server.listen();
console.log("Hocuspocus Collaborative Server (MySQL/Prisma) running on port 1234");
