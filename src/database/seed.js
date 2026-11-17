'use strict';
/* Configuração inicial (perfil, treinos, cardápio e metas do plano de 12 semanas). Tudo é editável dentro do app. */
const GROUPS = ['Glúteos', 'Quadríceps', 'Posteriores', 'Panturrilhas', 'Costas', 'Ombros', 'Peitoral', 'Bíceps', 'Tríceps', 'Abdômen'];
const FOOD_GROUPS = ['Proteínas', 'Carboidratos', 'Gorduras', 'Vegetais', 'Outros'];
const PHASES = [
  { n: 1, name: 'Adaptação', weeks: [1, 4], items: ['Aprender a execução dos movimentos.', 'Ajustar máquinas e cargas.', 'Priorizar a técnica.', 'Trabalhar com aproximadamente 3 repetições em reserva.'] },
  { n: 2, name: 'Construção', weeks: [5, 8], items: ['Evoluir repetições e cargas gradualmente.', 'Trabalhar em geral com 1–3 repetições em reserva.', 'Consolidar a execução.'] },
  { n: 3, name: 'Progressão', weeks: [9, 12], items: ['Buscar evolução gradual.', 'Manter a execução correta.', 'Ajustar o volume conforme a recuperação.'] }
];
const ex = (id, name, group, sec, equip, rest, how, tips) => ({ id, name, group, sec, equip, rest, how, tips, video: DEFAULT_VIDEO[id] || '' });
const it = (exId, sets, repMin, repMax, rest, repNote = '') => ({ exId, sets, repMin, repMax, rest, repNote });
const fd = (id, name, group, unit, kcal, p, c, f, portion) => ({ id, name, group, unit, kcal, p, c, f, portion });

const SEED = {
  profile: { name: '', sex: 'Feminino', age: '25–30', height: 162, startWeight: 47, experience: 'Iniciante', freq: 4, place: 'Academia completa', goal: 'Hipertrofia e ganho gradual de massa muscular', priorities: 'Glúteos, pernas e desenvolvimento dos membros superiores', food: 'Pouco apetite e baixo consumo habitual de proteínas', milestone: 50, trainTime: '18:00' },
  goals: { kcalMin: 1800, kcalMax: 1900, pMin: 80, pMax: 90, fMin: 55, fMax: 65, cMin: 235, cMax: 260, showKcal: true },
  settings: { unitW: 'kg', unitL: 'cm', theme: 'light', sound: true, vibrate: true, rest: 90, simple: true },
  reminders: { treino: { on: false, time: '18:00' }, refeicoes: { on: false }, agua: { on: false, every: 120 }, peso: { on: false, time: '07:00' }, avaliacao: { on: false } },
  schedule: { 1: 'w-infA', 2: 'w-supA', 3: '', 4: 'w-infB', 5: '', 6: 'w-supB', 0: '' },
  exercises: [
    ex('smith', 'Agachamento no Smith', 'Quadríceps', ['Glúteos', 'Posteriores'], 'Smith (barra guiada)', 90, 'Posicione a barra sobre os trapézios, pés na largura dos ombros e um pouco à frente da barra. Desça flexionando joelhos e quadril até uma amplitude confortável e suba empurrando o chão.', 'Mantenha a coluna neutra e o abdômen firme. Joelhos acompanham a direção dos pés. Desça com controle, sem deixar os calcanhares saírem do chão.'),
    ex('leg45', 'Leg press 45°', 'Quadríceps', ['Glúteos', 'Posteriores'], 'Máquina leg press', 90, 'Sente-se com a lombar apoiada, pés na plataforma na largura dos ombros. Destrave, desça flexionando os joelhos e empurre a plataforma de volta sem travar os joelhos no final.', 'Não deixe o quadril descolar do encosto no fim da descida. Não estenda os joelhos por completo. Empurre com o pé inteiro.'),
    ex('extensora', 'Cadeira extensora', 'Quadríceps', [], 'Máquina', 60, 'Ajuste o encosto para alinhar o joelho ao eixo da máquina e o rolo sobre o tornozelo. Estenda os joelhos, segure um instante no alto e desça devagar.', 'Evite impulso com o tronco. Controle a descida. Mantenha as costas apoiadas.'),
    ex('pelvica', 'Elevação pélvica', 'Glúteos', ['Posteriores'], 'Banco e barra ou máquina', 90, 'Apoie a parte alta das costas no banco, barra sobre o quadril, pés firmes no chão. Suba o quadril até alinhar tronco e coxas, contraia os glúteos e desça com controle.', 'Queixo levemente recolhido e costelas "fechadas" para não arquear a lombar. Empurre pelos calcanhares. Pause um segundo no alto.'),
    ex('abdutora', 'Cadeira abdutora', 'Glúteos', [], 'Máquina', 60, 'Sentada, com as almofadas na lateral externa das coxas, afaste as pernas até a amplitude confortável e retorne devagar.', 'Não deixe os pesos baterem na volta. Mantenha o tronco estável; inclinar-se levemente à frente pode aumentar o trabalho de glúteos.'),
    ex('pant', 'Panturrilha sentada', 'Panturrilhas', [], 'Máquina', 60, 'Apoie a ponta dos pés na plataforma e a almofada sobre as coxas. Eleve os calcanhares o máximo possível, pause e desça alongando bem.', 'Use a amplitude completa. Evite "quicar" no fundo do movimento.'),
    ex('puxada', 'Puxada frontal', 'Costas', ['Bíceps', 'Ombros'], 'Polia alta', 90, 'Segure a barra um pouco além da largura dos ombros, tronco levemente inclinado para trás. Puxe a barra até a parte alta do peito levando os cotovelos para baixo e volte com controle.', 'Inicie o movimento abaixando os ombros. Não balance o tronco. Não puxe a barra atrás da nuca.'),
    ex('remadabaixa', 'Remada baixa', 'Costas', ['Bíceps', 'Ombros'], 'Polia baixa', 90, 'Sentada, joelhos levemente flexionados e coluna ereta. Puxe o puxador em direção ao abdômen aproximando as escápulas e retorne estendendo os braços.', 'Não arredonde a lombar. Evite balançar o tronco para ganhar impulso. Cotovelos próximos ao corpo.'),
    ex('desenv', 'Desenvolvimento com halteres', 'Ombros', ['Tríceps'], 'Halteres e banco', 90, 'Sentada com encosto, halteres na altura dos ombros. Empurre para cima até quase estender os cotovelos e desça com controle até a linha das orelhas.', 'Mantenha a lombar apoiada e o abdômen firme. Punhos alinhados aos cotovelos. Não bata os halteres no alto.'),
    ex('lateral', 'Elevação lateral', 'Ombros', [], 'Halteres', 60, 'Em pé, halteres ao lado do corpo e cotovelos levemente flexionados. Eleve os braços para os lados até a altura dos ombros e desça devagar.', 'Use carga leve e sem impulso. Não eleve os ombros em direção às orelhas. Cotovelos conduzem o movimento.'),
    ex('roscadireta', 'Rosca direta', 'Bíceps', [], 'Barra ou halteres', 60, 'Em pé, pegada com as palmas para cima na largura dos ombros. Flexione os cotovelos levando a barra em direção aos ombros e desça com controle.', 'Cotovelos fixos ao lado do tronco. Não balance o corpo. Estenda quase totalmente na descida.'),
    ex('martelo', 'Rosca martelo', 'Bíceps', [], 'Halteres', 60, 'Em pé, halteres com pegada neutra (palmas voltadas uma para a outra). Flexione os cotovelos e desça com controle.', 'Mantenha os punhos firmes e os cotovelos parados. Pode alternar os braços.'),
    ex('stiff', 'Stiff com halteres', 'Posteriores', ['Glúteos', 'Costas'], 'Halteres', 90, 'Em pé, joelhos levemente flexionados. Leve o quadril para trás descendo os halteres rente às pernas até sentir alongar a parte de trás das coxas. Suba contraindo glúteos.', 'Coluna neutra do início ao fim: o movimento é no quadril, não na lombar. Não desça além do ponto em que consegue manter a postura.'),
    ex('flexora', 'Mesa flexora', 'Posteriores', ['Panturrilhas'], 'Máquina', 90, 'Deitada de bruços, joelhos alinhados ao eixo da máquina e o rolo acima dos calcanhares. Flexione os joelhos trazendo o rolo em direção aos glúteos e retorne devagar.', 'Não eleve o quadril do apoio. Controle a volta. Evite hiperextender os joelhos no final.'),
    ex('afundo', 'Afundo com halteres', 'Glúteos', ['Quadríceps', 'Posteriores'], 'Halteres', 90, 'Dê um passo à frente e desça o corpo flexionando os dois joelhos até cerca de 90°. Suba empurrando o chão com a perna da frente. Faça todas as repetições de um lado e troque.', 'Comece sem carga ou com carga leve até dominar o movimento. Tronco ereto. Joelho da frente alinhado ao pé.'),
    ex('coice', 'Coice na polia', 'Glúteos', ['Posteriores'], 'Polia baixa com tornozeleira', 60, 'De frente para a polia, com a tornozeleira presa, incline levemente o tronco e leve a perna para trás estendendo o quadril. Retorne com controle.', 'Não arqueie a lombar para ganhar amplitude. Movimento lento, com contração do glúteo no final.'),
    ex('supino', 'Supino com halteres', 'Peitoral', ['Ombros', 'Tríceps'], 'Halteres e banco', 90, 'Deitada no banco, pés firmes no chão, halteres acima do peito. Desça abrindo os cotovelos até a linha do peito e empurre de volta.', 'Escápulas encaixadas no banco. Cotovelos a cerca de 45–70° do tronco. Desça com controle.'),
    ex('remadauni', 'Remada unilateral', 'Costas', ['Bíceps', 'Ombros'], 'Halter e banco', 90, 'Apoie joelho e mão do mesmo lado no banco, coluna paralela ao chão. Puxe o halter em direção ao quadril e desça alongando as costas.', 'Não gire o tronco. Cotovelo passa rente ao corpo. Pescoço alinhado com a coluna.'),
    ex('crucifixo', 'Crucifixo na máquina', 'Peitoral', ['Ombros'], 'Máquina (peck deck)', 60, 'Sentada com as costas apoiadas, cotovelos levemente flexionados. Aproxime os braços à frente do peito e retorne abrindo até a amplitude confortável.', 'Ombros para baixo e para trás. Não deixe os pesos baterem. Evite abrir além do confortável para os ombros.'),
    ex('triceps', 'Tríceps na polia', 'Tríceps', [], 'Polia alta', 60, 'Em pé, cotovelos junto ao corpo. Empurre a barra ou corda para baixo até estender os cotovelos e retorne até cerca de 90°.', 'Cotovelos fixos. Não incline o tronco sobre a barra. Controle a subida.'),
    ex('facepull', 'Face pull', 'Ombros', ['Costas'], 'Polia com corda', 60, 'Com a polia na altura do rosto, puxe a corda em direção ao rosto afastando as mãos e levando os cotovelos para trás e para o alto.', 'Carga leve. Termine com as mãos ao lado das orelhas. Não projete a cabeça para a frente.')
  ],
  workouts: [
    { id: 'w-infA', name: 'Inferiores A', focus: 'Quadríceps e glúteos', items: [it('smith', 3, 10, 12, 90), it('leg45', 3, 10, 12, 90), it('extensora', 2, 12, 15, 60), it('pelvica', 3, 10, 12, 90), it('abdutora', 2, 15, 20, 60), it('pant', 2, 12, 15, 60)] },
    { id: 'w-supA', name: 'Superiores A', focus: 'Costas, ombros e bíceps', items: [it('puxada', 3, 10, 12, 90), it('remadabaixa', 3, 10, 12, 90), it('desenv', 2, 10, 12, 90), it('lateral', 3, 12, 15, 60), it('roscadireta', 2, 10, 12, 60), it('martelo', 2, 10, 12, 60)] },
    { id: 'w-infB', name: 'Inferiores B', focus: 'Posteriores e glúteos', items: [it('stiff', 3, 10, 12, 90), it('flexora', 3, 10, 12, 90), it('pelvica', 3, 10, 12, 90), it('afundo', 2, 10, 10, 90, 'por perna'), it('coice', 2, 12, 15, 60), it('abdutora', 2, 15, 20, 60)] },
    { id: 'w-supB', name: 'Superiores B', focus: 'Peito, costas, ombros e tríceps', items: [it('supino', 3, 10, 12, 90), it('remadauni', 3, 10, 12, 90), it('crucifixo', 2, 12, 15, 60), it('lateral', 2, 12, 15, 60), it('triceps', 3, 10, 12, 60), it('facepull', 2, 12, 15, 60)] }
  ],
  /* Valores aproximados por 100 g ou 100 ml (referência: tabelas de composição de alimentos). Variam conforme marca e preparo. */
  foods: [
    fd('ovo', 'Ovo inteiro cozido', 'Proteínas', 'g', 146, 13.3, 0.6, 9.5, 50),
    fd('frango', 'Frango grelhado (peito)', 'Proteínas', 'g', 159, 32, 0, 2.5, 70),
    fd('patinho', 'Patinho grelhado', 'Proteínas', 'g', 219, 35.9, 0, 7.3, 70),
    fd('peixe', 'Peixe grelhado (tilápia)', 'Proteínas', 'g', 128, 26, 0, 2.7, 80),
    fd('leite', 'Leite integral', 'Proteínas', 'ml', 61, 3.2, 4.7, 3.3, 200),
    fd('iogurte', 'Iogurte natural integral', 'Proteínas', 'g', 51, 4.1, 1.9, 3, 170),
    fd('iogurte-grego', 'Iogurte tipo grego natural', 'Proteínas', 'g', 97, 8, 4, 5, 170),
    fd('queijo-minas', 'Queijo minas frescal', 'Proteínas', 'g', 264, 17.4, 3.2, 20.2, 30),
    fd('mucarela', 'Queijo muçarela', 'Proteínas', 'g', 330, 22.6, 3, 25.2, 30),
    fd('feijao', 'Feijão cozido', 'Proteínas', 'g', 76, 4.8, 13.6, 0.5, 80),
    fd('lentilha', 'Lentilha cozida', 'Proteínas', 'g', 93, 6.3, 16.3, 0.5, 80),
    fd('grao-bico', 'Grão-de-bico cozido', 'Proteínas', 'g', 164, 8.9, 27.4, 2.6, 80),
    fd('whey', 'Whey protein (pó)', 'Proteínas', 'g', 400, 80, 8, 6, 30),
    fd('arroz', 'Arroz cozido', 'Carboidratos', 'g', 128, 2.5, 28.1, 0.2, 150),
    fd('macarrao', 'Macarrão cozido', 'Carboidratos', 'g', 102, 3.4, 19.9, 0.5, 150),
    fd('batata', 'Batata cozida', 'Carboidratos', 'g', 52, 1.2, 11.9, 0, 100),
    fd('mandioca', 'Mandioca cozida', 'Carboidratos', 'g', 125, 0.6, 30.1, 0.3, 100),
    fd('aveia', 'Aveia em flocos', 'Carboidratos', 'g', 394, 13.9, 66.6, 8.5, 20),
    fd('pao-int', 'Pão integral', 'Carboidratos', 'g', 253, 9.4, 49.9, 3.7, 60),
    fd('banana', 'Banana', 'Carboidratos', 'g', 98, 1.3, 26, 0.1, 90),
    fd('fruta', 'Fruta (maçã como referência)', 'Carboidratos', 'g', 56, 0.3, 15.2, 0, 130),
    fd('mel', 'Mel', 'Carboidratos', 'g', 309, 0, 84, 0, 10),
    fd('azeite', 'Azeite de oliva', 'Gorduras', 'g', 884, 0, 0, 100, 10),
    fd('abacate', 'Abacate', 'Gorduras', 'g', 96, 1.2, 6, 8.4, 50),
    fd('castanhas', 'Castanhas (mix)', 'Gorduras', 'g', 600, 16, 22, 52, 20),
    fd('pasta-amendoim', 'Pasta de amendoim', 'Gorduras', 'g', 590, 25, 20, 50, 10),
    fd('legumes', 'Legumes cozidos (mix)', 'Vegetais', 'g', 35, 1.5, 7, 0.2, 100)
  ],
  mealPlan: [
    { id: 'm1', name: 'Café da manhã', time: '07:30', items: [{ foodId: 'ovo', qty: 50 }, { foodId: 'pao-int', qty: 60 }, { foodId: 'leite', qty: 200 }, { foodId: 'banana', qty: 90 }] },
    { id: 'm2', name: 'Lanche', time: '10:30', items: [{ foodId: 'iogurte', qty: 170 }, { foodId: 'aveia', qty: 20 }, { foodId: 'mel', qty: 10 }, { foodId: 'fruta', qty: 130 }] },
    { id: 'm3', name: 'Almoço', time: '13:00', items: [{ foodId: 'arroz', qty: 150 }, { foodId: 'feijao', qty: 80 }, { foodId: 'frango', qty: 70 }, { foodId: 'legumes', qty: 100 }, { foodId: 'azeite', qty: 10 }] },
    { id: 'm4', name: 'Lanche / Pré-treino', time: '16:30', items: [{ foodId: 'leite', qty: 200 }, { foodId: 'banana', qty: 100 }, { foodId: 'aveia', qty: 20 }, { foodId: 'pasta-amendoim', qty: 10 }] },
    { id: 'm5', name: 'Jantar', time: '20:00', items: [{ foodId: 'peixe', qty: 80 }, { foodId: 'arroz', qty: 120 }, { foodId: 'batata', qty: 100 }, { foodId: 'legumes', qty: 100 }, { foodId: 'azeite', qty: 5 }] }
  ]
};

/* Grava a configuração inicial na primeira abertura e completa chaves novas em atualizações. */
async function seedIfNeeded() {
  if (!S.kv.seeded) {
    for (const k of ['profile', 'goals', 'settings', 'reminders', 'schedule', 'mealPlan']) await kvSet(k, clone(SEED[k]));
    for (const e of SEED.exercises) await save('exercises', clone(e));
    for (const w of SEED.workouts) await save('workouts', clone(w));
    for (const f of SEED.foods) await save('foods', clone(f));
    await kvSet('cycles', [{ id: uid(), start: mondayOf(today()) }]);
    await kvSet('seeded', DB_VERSION);
  }
  for (const k of ['profile', 'goals', 'settings', 'reminders']) S.kv[k] = { ...clone(SEED[k]), ...(S.kv[k] || {}) };
  if (!S.kv.schedule) S.kv.schedule = clone(SEED.schedule);
  if (!S.kv.mealPlan) S.kv.mealPlan = clone(SEED.mealPlan);
  if (!S.kv.cycles || !S.kv.cycles.length) S.kv.cycles = [{ id: uid(), start: mondayOf(today()) }];
}
