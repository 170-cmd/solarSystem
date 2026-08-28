export interface Body {
  id: string;
  name: string;
  latin: string;
  kind: "star" | "rocky" | "gas" | "ice";
  kindLabel: string;
  /** основной (тёмный) цвет сферы */
  color: string;
  /** блик (светлый) для градиента */
  hi: string;
  /** радиус орбиты в единицах SVG (у Солнца 0) */
  orbitR: number;
  /** радиус сферы в единицах SVG */
  size: number;
  /** орбитальный период в земных сутках */
  periodDays: number;
  /** стартовый угол на орбите, градусы */
  startAngle: number;
  diameterKm: number;
  distanceMkm: number;
  distanceAU: number;
  rotationText: string;
  moons: number;
  tempText: string;
  fact: string;
  hasRing?: boolean;
}

export const BODIES: Body[] = [
  {
    id: "sun",
    name: "Солнце",
    latin: "Sol",
    kind: "star",
    kindLabel: "Жёлтый карлик · G2V",
    color: "#ff9d3c",
    hi: "#fff3c4",
    orbitR: 0,
    size: 32,
    periodDays: 0,
    startAngle: 0,
    diameterKm: 1392700,
    distanceMkm: 0,
    distanceAU: 0,
    rotationText: "25,4 суток (экватор)",
    moons: 0,
    tempText: "+5 505 °C (поверхность)",
    fact: "Солнце содержит 99,86 % всей массы Солнечной системы. Каждую секунду оно превращает около 4 миллионов тонн вещества в чистую энергию света.",
  },
  {
    id: "mercury",
    name: "Меркурий",
    latin: "Mercurius",
    kind: "rocky",
    kindLabel: "Планета земной группы",
    color: "#6e6259",
    hi: "#cdbba7",
    orbitR: 78,
    size: 5,
    periodDays: 87.97,
    startAngle: 40,
    diameterKm: 4879,
    distanceMkm: 57.9,
    distanceAU: 0.39,
    rotationText: "58,6 земных суток",
    moons: 0,
    tempText: "−173… +427 °C",
    fact: "Солнечные сутки на Меркурии длятся 176 земных суток — в два раза дольше его года. Планета успевает сделать два оборота вокруг Солнца, пока там проходит один «день».",
  },
  {
    id: "venus",
    name: "Венера",
    latin: "Venus",
    kind: "rocky",
    kindLabel: "Планета земной группы",
    color: "#b8894a",
    hi: "#f5dca6",
    orbitR: 106,
    size: 8,
    periodDays: 224.7,
    startAngle: 165,
    diameterKm: 12104,
    distanceMkm: 108.2,
    distanceAU: 0.72,
    rotationText: "243 суток (в обратную сторону)",
    moons: 0,
    tempText: "+464 °C",
    fact: "Венера вращается в обратную сторону — Солнце там восходит на западе. Из-за чудовищного парникового эффекта это самая горячая планета, хотя Меркурий ближе к Солнцу.",
  },
  {
    id: "earth",
    name: "Земля",
    latin: "Terra",
    kind: "rocky",
    kindLabel: "Планета земной группы",
    color: "#1e5c9e",
    hi: "#8ecbff",
    orbitR: 136,
    size: 8.5,
    periodDays: 365.25,
    startAngle: 275,
    diameterKm: 12742,
    distanceMkm: 149.6,
    distanceAU: 1.0,
    rotationText: "23 часа 56 минут",
    moons: 1,
    tempText: "+15 °C (средняя)",
    fact: "71 % поверхности Земли покрыт океанами. Луна постепенно удаляется от нас на 3,8 см в год, а миллиард лет назад сутки длились всего 18 часов.",
  },
  {
    id: "mars",
    name: "Марс",
    latin: "Mars",
    kind: "rocky",
    kindLabel: "Планета земной группы",
    color: "#a13a22",
    hi: "#ea8a5e",
    orbitR: 166,
    size: 6.5,
    periodDays: 686.98,
    startAngle: 95,
    diameterKm: 6779,
    distanceMkm: 227.9,
    distanceAU: 1.52,
    rotationText: "24 часа 37 минут",
    moons: 2,
    tempText: "−63 °C (средняя)",
    fact: "На Марсе находится вулкан Олимп — самая высокая гора Солнечной системы: 21,9 км, почти втрое выше Эвереста. А сутки на Марсе почти земные — 24 ч 37 мин.",
  },
  {
    id: "jupiter",
    name: "Юпитер",
    latin: "Iuppiter",
    kind: "gas",
    kindLabel: "Газовый гигант",
    color: "#a5683a",
    hi: "#f0c794",
    orbitR: 216,
    size: 20,
    periodDays: 4332.59,
    startAngle: 205,
    diameterKm: 139820,
    distanceMkm: 778.5,
    distanceAU: 5.2,
    rotationText: "9 часов 56 минут",
    moons: 95,
    tempText: "−108 °C",
    fact: "Большое Красное Пятно — ураган размером с Землю, бушующий уже более 350 лет. Юпитер вращается быстрее всех планет: его сутки короче 10 часов.",
  },
  {
    id: "saturn",
    name: "Сатурн",
    latin: "Saturnus",
    kind: "gas",
    kindLabel: "Газовый гигант",
    color: "#b08a4e",
    hi: "#f0dcae",
    orbitR: 262,
    size: 17,
    periodDays: 10759.22,
    startAngle: 330,
    diameterKm: 116460,
    distanceMkm: 1433.5,
    distanceAU: 9.58,
    rotationText: "10 часов 42 минуты",
    moons: 146,
    tempText: "−139 °C",
    fact: "Средняя плотность Сатурна меньше плотности воды: в гигантском океане он бы не утонул, а плавал. Его кольца шириной 280 000 км состоят изо льда и камней.",
    hasRing: true,
  },
  {
    id: "uranus",
    name: "Уран",
    latin: "Uranus",
    kind: "ice",
    kindLabel: "Ледяной гигант",
    color: "#3f97a1",
    hi: "#c2eef2",
    orbitR: 306,
    size: 12,
    periodDays: 30688.5,
    startAngle: 130,
    diameterKm: 50724,
    distanceMkm: 2872.5,
    distanceAU: 19.19,
    rotationText: "17 часов 14 минут",
    moons: 28,
    tempText: "−197 °C",
    fact: "Уран «лежит на боку»: ось вращения наклонена на 98°, поэтому каждый полюс 42 земных года непрерывно освещён Солнцем, а затем столько же лет царит ночь.",
  },
  {
    id: "neptune",
    name: "Нептун",
    latin: "Neptunus",
    kind: "ice",
    kindLabel: "Ледяной гигант",
    color: "#2b44ad",
    hi: "#839cf5",
    orbitR: 346,
    size: 11.5,
    periodDays: 60182,
    startAngle: 15,
    diameterKm: 49244,
    distanceMkm: 4495.1,
    distanceAU: 30.07,
    rotationText: "16 часов 6 минут",
    moons: 16,
    tempText: "−201 °C",
    fact: "На Нептуне дуют самые быстрые ветры Солнечной системы — до 2 100 км/ч. С момента открытия в 1846 году он совершил лишь один полный оборот вокруг Солнца.",
  },
];

export const EARTH = BODIES[3];
export const MAX_DIAMETER = 139820; // Юпитер
export const MAX_PERIOD = 60182; // Нептун
export const MAX_AU = 30.07;

export const SPEED_OPTIONS = [1, 2, 5, 10, 50] as const;
/** земных суток симуляции за одну реальную секунду при скорости ×1 */
export const BASE_DAYS_PER_SECOND = 10;
