import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSceneCount,
  formatTimecode,
  parseVisualStyleOption,
  validateDramaInput,
  buildProceduralDrama,
  composeMasterPrompt,
} from './microdrama-engine';

test('calculateSceneCount maps 1 to 10 minutes accurately', () => {
  assert.equal(calculateSceneCount(1), 4);
  assert.equal(calculateSceneCount(2), 6);
  assert.equal(calculateSceneCount(3), 9);
  assert.equal(calculateSceneCount(5), 13);
  assert.equal(calculateSceneCount(10), 24);
  // Clamping behavior
  assert.equal(calculateSceneCount(0), 4);
  assert.equal(calculateSceneCount(15), 24);
});

test('formatTimecode formats seconds as MM:SS', () => {
  assert.equal(formatTimecode(0), '00:00');
  assert.equal(formatTimecode(9), '00:09');
  assert.equal(formatTimecode(65), '01:05');
  assert.equal(formatTimecode(600), '10:00');
});

test('parseVisualStyleOption extracts aspect ratio and style description', () => {
  const vertical = parseVisualStyleOption(
    '9:16|Korean drama aesthetic, soft warm lighting'
  );
  assert.equal(vertical.ratio, '9:16');
  assert.equal(vertical.styleDesc, 'Korean drama aesthetic, soft warm lighting');

  const horizontal = parseVisualStyleOption('16:9|Cinematic widescreen');
  assert.equal(horizontal.ratio, '16:9');
  assert.equal(horizontal.styleDesc, 'Cinematic widescreen');
});

test('validateDramaInput rejects empty or too-short titles and invalid durations', () => {
  assert.equal(validateDramaInput('', 3).valid, false);
  assert.equal(validateDramaInput('   ', 3).valid, false);
  assert.equal(validateDramaInput('Abc', 3).valid, false);
  assert.equal(validateDramaInput('Judul Valid Microdrama', 0).valid, false);
  assert.equal(validateDramaInput('Judul Valid Microdrama', 11).valid, false);
  assert.equal(validateDramaInput('Judul Valid Microdrama', 3).valid, true);
});

test('buildProceduralDrama generates exact scene count and complete Master Prompts', () => {
  const prod = buildProceduralDrama(
    'Suamiku Ternyata CEO Miliarder yang Menyamar',
    'CEO Romance / Balas Dendam',
    3,
    '9:16',
    'Cinematic realistic Asian drama, 8k'
  );

  assert.equal(prod.totalScenes, 9);
  assert.equal(prod.scenes.length, 9);
  assert.equal(prod.characters.length, 3);
  assert.ok(prod.scenes[0].masterPrompt.includes('[SCENE 1 |'));
  assert.ok(prod.scenes[0].masterPrompt.includes('GOLDEN 3-SECOND HOOK'));
  assert.ok(prod.scenes[0].masterPrompt.includes('CHARACTER LOCK:'));
  assert.ok(prod.scenes[0].masterPrompt.includes('DIALOGUE & LIP-SYNC:'));
  assert.ok(prod.scenes[8].timecode.endsWith('03:00'));
});

test('composeMasterPrompt updates dynamically when scene action or dialogue changes', () => {
  const prompt = composeMasterPrompt({
    sceneNumber: 2,
    timecode: '00:20 - 00:40',
    phase: 'INCITING INCIDENT',
    styleDesc: 'Moody thriller',
    setting: 'Executive boardroom',
    camera: 'Low Angle Push-In',
    mood: 'Tense',
    action: 'Membuka brankas rahasia',
    title: 'Misteri Brankas',
    characters: [
      {
        id: '1',
        name: 'Arka (28)',
        role: 'Protagonis',
        visual: 'Tall man in black coat',
      },
      {
        id: '2',
        name: 'Nadia (26)',
        role: 'Antagonis',
        visual: 'Woman in red blazer',
      },
    ],
    dialogues: [{ speaker: 'Arka (28)', line: '"Ini buktinya!"' }],
    sfx: 'Suara pintu besi',
  });

  assert.ok(prompt.includes('Membuka brankas rahasia'));
  assert.ok(prompt.includes('"Ini buktinya!"'));
});
