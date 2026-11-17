'use strict';
/* Estrutura do banco local (IndexedDB). Ao mudar a estrutura, aumente DB_VERSION e adicione a migração em migrations.js. */
const DB_NAME = 'projeto-evolucao', DB_VERSION = 2;
/* Dados da usuária (entram nos backups exportados) */
const USER_STORES = ['kv', 'exercises', 'workouts', 'sessions', 'foods', 'days', 'body', 'diary', 'photos'];
/* Todas as tabelas; "backups" guarda as cópias de segurança internas */
const STORES = [...USER_STORES, 'backups'];
const keyOf = s => s === 'kv' ? 'k' : (s === 'days' || s === 'diary') ? 'date' : 'id';
/* Associação padrão entre exercício e arquivo de vídeo local: public/videos/exercises/<nome>.mp4 */
const DEFAULT_VIDEO = {
  smith: 'agachamento-smith', leg45: 'leg-press', extensora: 'cadeira-extensora', pelvica: 'elevacao-pelvica', abdutora: 'cadeira-abdutora', pant: 'panturrilha-sentada',
  puxada: 'puxada-frontal', remadabaixa: 'remada-baixa', desenv: 'desenvolvimento-halteres', lateral: 'elevacao-lateral', roscadireta: 'rosca-direta', martelo: 'rosca-martelo',
  stiff: 'stiff-halteres', flexora: 'mesa-flexora', afundo: 'afundo-halteres', coice: 'coice-polia', supino: 'supino-halteres', remadauni: 'remada-unilateral',
  crucifixo: 'crucifixo-maquina', triceps: 'triceps-polia', facepull: 'face-pull'
};
