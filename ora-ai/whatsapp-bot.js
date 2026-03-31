require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Anthropic = require('@anthropic-ai/sdk').default;

// ─── Config Anthropic ────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Config entreprise (depuis .env) ─────────────────────────────────────────
const BUSINESS_NAME     = process.env.BUSINESS_NAME     || 'notre entreprise';
const BUSINESS_TYPE     = process.env.BUSINESS_TYPE     || 'entreprise polynesienne';
const BUSINESS_HOURS    = process.env.BUSINESS_HOURS    || 'Lun-Ven 8h-17h, Sam 8h-12h';
const BUSINESS_PHONE    = process.env.BUSINESS_PHONE    || '';
const BUSINESS_ADDRESS  = process.env.BUSINESS_ADDRESS  || '';
const BUSINESS_SERVICES = process.env.BUSINESS_SERVICES || 'nos services';

// ─── Memoire des conversations (par numero) ───────────────────────────────────
const conversations = new Map();

// ─── Prompt systeme Hina ─────────────────────────────────────────────────────
function buildSystemPrompt() {
  return `Tu es Hina, l'assistante virtuelle IA de ${BUSINESS_NAME}.
  Tu reponds aux messages clients de maniere professionnelle et chaleureuse.
  Tu parles francais par defaut, anglais si le client ecrit en anglais.
  Horaires : ${BUSINESS_HOURS}
  ${BUSINESS_PHONE ? 'Tel : ' + BUSINESS_PHONE : ''}
  ${BUSINESS_ADDRESS ? 'Adresse : ' + BUSINESS_ADDRESS : ''}
  Services : ${BUSINESS_SERVICES}
  Regles : Reponds en max 3-4 phrases. Si tu ne sais pas, propose de transmettre a l'equipe.
  ${BUSINESS_PHONE ? 'Si urgent, dis d\'appeler le ' + BUSINESS_PHONE : ''}
  Style : Chaleureux, court, direct. C'est WhatsApp, pas un email.`;
  }

  // ─── Appel Claude Haiku (Hina) ────────────────────────────────────────────────
  async function askHina(userMessage, history = []) {
    const messages = [
        ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage },
              ];

                const response = await anthropic.messages.create({
                    model: 'claude-haiku-4-5',
                        max_tokens: 512,
                            system: buildSystemPrompt(),
                                messages,
                                  });

                                    return response.content.find(b => b.type === 'text')?.text || '';
                                    }

                                    // ─── Client WhatsApp (whatsapp-web.js) ───────────────────────────────────────
                                    const client = new Client({
                                      authStrategy: new LocalAuth({ clientId: 'hina-bot' }),
                                        puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
                                        });

                                        client.on('qr', (qr) => {
                                          console.log('\n Scanne ce QR code avec ton WhatsApp :\n');
                                            qrcode.generate(qr, { small: true });
                                            });

                                            client.on('ready', () => {
                                              console.log('Hina est connectee a WhatsApp !');
                                                console.log('Entreprise : ' + BUSINESS_NAME);
                                                });

                                                client.on('message', async (msg) => {
                                                  if (msg.fromMe || !msg.body) return;

                                                    const senderId = msg.from;
                                                      const history = conversations.get(senderId) || [];

                                                        console.log('[' + senderId + '] : ' + msg.body);

                                                          try {
                                                              const reply = await askHina(msg.body, history);

                                                                  // Historique glissant (max 10 echanges)
                                                                      history.push({ role: 'user', content: msg.body });
                                                                          history.push({ role: 'assistant', content: reply });
                                                                              if (history.length > 20) history.splice(0, 2);
                                                                                  conversations.set(senderId, history);

                                                                                      await msg.reply(reply);
                                                                                          console.log('Hina -> [' + senderId + '] : ' + reply);
                                                                                            } catch (err) {
                                                                                                console.error('Erreur Hina :', err.message);
                                                                                                    await msg.reply("Desole, probleme technique momentane. Reessayez dans quelques instants.");
                                                                                                      }
                                                                                                      });

                                                                                                      client.on('disconnected', (reason) => {
                                                                                                        console.log('WhatsApp deconnecte :', reason);
                                                                                                        });

                                                                                                        client.initialize();
                                                                                                        console.log('Demarrage de Hina WhatsApp Bot...');