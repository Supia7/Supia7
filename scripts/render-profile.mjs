import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const colors = {
  forest: '#071C17', soil: '#102C25', edge: '#061611', moss: '#7A8755',
  leaf: '#79A85D', cyan: '#83EAD3', ivory: '#E9EFE0', mist: '#B4DCD0',
};

function frame(width, height, title, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">
<title id="title">${title}</title>
<defs>
  <radialGradient id="night"><stop stop-color="${colors.soil}"/><stop offset="1" stop-color="${colors.forest}"/></radialGradient>
  <linearGradient id="stone" x2=".7" y2="1"><stop stop-color="#467449"/><stop offset=".5" stop-color="#284D36"/><stop offset="1" stop-color="${colors.edge}"/></linearGradient>
  <linearGradient id="light" x2="0" y2="1"><stop stop-color="${colors.cyan}" stop-opacity=".22"/><stop offset="1" stop-color="${colors.cyan}" stop-opacity="0"/></linearGradient>
</defs>
<rect width="${width}" height="${height}" rx="12" fill="url(#night)"/>
${content}
</svg>\n`;
}

function fern(x, y, scale = 1, mirror = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale * mirror} ${scale})" fill="none" stroke="${colors.moss}" stroke-width="1.8" opacity=".7">
<path d="M0 0Q-5-24 17-52"/>
${[0, 1, 2, 3, 4].map(i => `<path d="M${i * 2} ${-i * 8 - 6}q-18-2-17-13m${17 + i * 2} ${13 - i * 8 - 6}q16-2 19-11"/>`).join('')}
</g>`;
}

function landmark(x, y, type, number) {
  const glyphs = {
    tools: '<path d="m-20-57-11 11 11 11m40-22 11 11-11 11m-12-27-12 32"/>',
    agents: '<path d="M0-61v14m-21 17 21-17 21 17"/><circle cy="-66" r="5"/><circle cx="-24" cy="-27" r="5"/><circle cx="24" cy="-27" r="5"/>',
    products: '<path d="m0-68 24 14v27L0-13-24-27v-27Zm-24 14L0-40l24-14M0-40v27"/>',
  };
  return `<g transform="translate(${x} ${y})">
<ellipse cy="12" rx="64" ry="16" fill="${colors.edge}" opacity=".7"/>
<path d="M-46 1-43-79-26-94 28-88 46-67 43 2 7 15Z" fill="url(#stone)"/>
<path d="M-43-79-26-94 28-88 46-67 4-75Z" fill="${colors.moss}" opacity=".45"/>
<path d="M-34-77-28-53m-4 20-3 22M32-64l-4 12 4 20" fill="none" stroke="${colors.moss}" opacity=".65"/>
<g fill="none" stroke="${colors.cyan}" stroke-width="2" stroke-linejoin="round">${glyphs[type]}</g>
<path d="M-39-4q20-17 32-2t44-4" fill="none" stroke="${colors.leaf}" stroke-width="5"/>
<text x="0" y="40" text-anchor="middle" fill="${colors.mist}" font-family="monospace" font-size="14">${number}</text>
</g>`;
}

function trail(mobile) {
  const w = mobile ? 400 : 1200;
  const h = mobile ? 480 : 300;
  const positions = mobile ? [[100, 125], [294, 270], [115, 407]] : [[204, 182], [586, 216], [992, 156]];
  let art = `<path d="${mobile ? 'M100 125C348 145 46 227 294 270S323 364 115 407' : 'M60 225C266 74 377 296 586 216S1008 76 1148 207'}" fill="none" stroke="${colors.moss}" stroke-width="26" opacity=".08"/>
<path d="${mobile ? 'M100 125C348 145 46 227 294 270S323 364 115 407' : 'M60 225C266 74 377 296 586 216S1008 76 1148 207'}" fill="none" stroke="${colors.mist}" stroke-width="1.5" stroke-dasharray="3 10" opacity=".55"/>`;
  const items = [['tools', '01', 'Useful tools'], ['agents', '02', 'Connected agents'], ['products', '03', 'Real products']];
  for (let i = 0; i < items.length; i++) {
    const [x, y] = positions[i];
    art += landmark(x, y, items[i][0], items[i][1]);
    const tx = mobile ? (i === 1 ? 36 : 190) : x;
    const ty = mobile ? y - 35 : y + 72;
    art += `<text x="${tx}" y="${ty}" ${mobile ? '' : 'text-anchor="middle"'} fill="${colors.ivory}" font-family="Georgia,serif" font-size="${mobile ? 20 : 28}">${items[i][2]}</text>`;
  }
  for (let i = 0; i < (mobile ? 8 : 16); i++) {
    const x = 32 + (i * 137) % (w - 60);
    const y = 42 + (i * 83) % (h - 70);
    art += `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 2 : 1}" fill="${colors.cyan}" opacity=".45"/>`;
  }
  art += fern(35, h - 18, 1.3) + fern(w - 32, h - 26, 1.6, -1);
  return frame(w, h, 'Three stone landmarks connected by a woodland trail: useful tools, connected agents, real products.', art);
}

function footer(mobile) {
  const w = mobile ? 400 : 1200;
  const h = mobile ? 220 : 200;
  let art = '';
  for (let i = 0; i < (mobile ? 9 : 25); i++) {
    const x = i * 51;
    const y = h - 24 - (i * 17) % 35;
    art += `<path d="M${x} ${h}v-${h - y + 60}m-24 44 24-44 25 43m-37-22 12-30 13 30" fill="none" stroke="${colors.moss}" stroke-width="${i % 3 + 1}" opacity=".17"/>`;
  }
  art += `<path d="M0 ${h - 26}Q${w / 4} ${h - 55} ${w / 2} ${h - 26}T${w} ${h - 36}V${h}H0Z" fill="${colors.soil}"/>
<path d="M${w - 98} ${h - 29}l-2-59 17-16 22 4 13 17-3 54Z" fill="url(#stone)"/>
<path d="m${w - 82} ${h - 84} 14 18-14 18-10-18Z" fill="none" stroke="${colors.cyan}" stroke-width="1.5"/>
<text x="${mobile ? 24 : 48}" y="${mobile ? 72 : 84}" fill="${colors.ivory}" font-family="Georgia,serif" font-size="${mobile ? 28 : 44}">Keep it grounded.</text>
<text x="${mobile ? 24 : 48}" y="${mobile ? 104 : 120}" fill="${colors.mist}" font-family="Arial,sans-serif" font-size="${mobile ? 16 : 20}">Small steps. Useful things.</text>
${fern(24, h - 12, 1.1)}${fern(w - 28, h - 10, 1.4, -1)}`;
  return frame(w, h, 'A woodland horizon and a glowing rune stone. Keep it grounded. Small steps. Useful things.', art);
}

await mkdir(`${root}assets`, { recursive: true });
for (const mobile of [false, true]) {
  const suffix = mobile ? '-mobile' : '';
  await writeFile(`${root}assets/workbench-trail${suffix}.svg`, trail(mobile));
  await writeFile(`${root}assets/forest-footer${suffix}.svg`, footer(mobile));
}
console.log('프로필의 숲길과 하단 SVG 4개 생성 완료');
