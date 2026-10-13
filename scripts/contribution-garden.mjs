import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const LEVELS = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
const COLORS = ['#102C25', '#284D36', '#467449', '#79A85D', '#B8D985'];
const DAY = 86_400_000;
const xml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

export function dateValue(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid calendar date');
  const value = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(value) || new Date(value).toISOString().slice(0, 10) !== date) throw new Error('Invalid calendar date');
  return value;
}

// 직렬화 경계에서 순서, 날짜, 요일, 활동 수준과 합계를 모두 검증한다.
export function validateSnapshot(snapshot) {
  if (snapshot?.schemaVersion !== 1 || snapshot.login !== 'Supia7' || snapshot.source !== 'GitHub GraphQL contributionCalendar') throw new Error('Invalid snapshot identity');
  if (typeof snapshot.fetchedAt !== 'string' || !Number.isFinite(Date.parse(snapshot.fetchedAt)) || new Date(snapshot.fetchedAt).toISOString() !== snapshot.fetchedAt) throw new Error('Invalid update timestamp');
  if (!Array.isArray(snapshot.days) || snapshot.days.length === 0 || snapshot.days.length > 366) throw new Error('Invalid calendar period');
  let previous;
  let total = 0;
  for (const day of snapshot.days) {
    const value = dateValue(day.date);
    if (previous !== undefined && value !== previous + DAY) throw new Error('Calendar days must be unique and sequential');
    if (day.date > snapshot.fetchedAt.slice(0, 10)) throw new Error('Future calendar day');
    if (day.weekday !== new Date(value).getUTCDay()) throw new Error('Incorrect weekday');
    if (!Number.isSafeInteger(day.contributionCount) || day.contributionCount < 0) throw new Error('Invalid contribution count');
    if (!LEVELS.includes(day.contributionLevel) || ((day.contributionCount === 0) !== (day.contributionLevel === 'NONE'))) throw new Error('Invalid contribution level');
    total += day.contributionCount;
    if (!Number.isSafeInteger(total)) throw new Error('Invalid contribution total');
    previous = value;
  }
  if (snapshot.startDate !== snapshot.days[0].date || snapshot.endDate !== snapshot.days.at(-1).date) throw new Error('Incorrect date range');
  if (!Number.isSafeInteger(snapshot.totalContributions) || total !== snapshot.totalContributions) throw new Error('Incorrect contribution total');
  return snapshot;
}

export function snapshotFromGraphQL(response, fetchedAt) {
  if (response?.errors?.length) throw new Error('GitHub GraphQL returned errors');
  const user = response?.data?.user;
  const calendar = user?.contributionsCollection?.contributionCalendar;
  if (user?.login !== 'Supia7' || !Array.isArray(calendar?.weeks)) throw new Error('Missing GitHub contribution calendar');
  const days = calendar.weeks.flatMap(week => {
    if (!Array.isArray(week?.contributionDays) || week.contributionDays.length === 0 || week.contributionDays.length > 7) throw new Error('Invalid calendar week');
    return week.contributionDays.map(day => ({
      date: day.date, weekday: day.weekday,
      contributionCount: day.contributionCount, contributionLevel: day.contributionLevel,
    }));
  });
  return validateSnapshot({
    schemaVersion: 1, login: user.login, source: 'GitHub GraphQL contributionCalendar',
    fetchedAt, startDate: days[0]?.date, endDate: days.at(-1)?.date,
    totalContributions: calendar.totalContributions, days,
  });
}

function text(x, y, content, size = 16, color = '#B4DCD0', extra = '') {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${xml(content)}</text>`;
}

// 날짜만으로 장식 위치를 결정하므로 동일한 입력은 항상 같은 SVG를 만든다.
function tile(day, x, y, legend = false) {
  const level = LEVELS.indexOf(day.contributionLevel);
  const seed = dateValue(day.date) / DAY;
  const height = 4 + level * 1.4;
  const top = -height;
  let detail = '';
  if (level === 0) {
    detail = '<path d="M-4 -5L0 -7L4 -5L1 -3Z" fill="#43513A"/><path d="M-4 -5L0 -7L2 -6" fill="none" stroke="#B4DCD0" stroke-opacity=".35"/>';
  } else {
    detail = `<path d="M-9 ${top} Q-8 ${top - 4} -3 ${top - 4} Q0 ${top - 8} 4 ${top - 4} Q10 ${top - 4} 9 ${top} L3 ${top + 4} Q0 ${top + 6} -5 ${top + 2}Z" fill="${COLORS[level]}" stroke="#B8D985" stroke-opacity=".3" stroke-width=".5"/>`;
    detail += `<path d="M-6 ${top - 1}L-2 ${top - 3}M3 ${top}L6 ${top - 2}" stroke="#E9EFE0" stroke-opacity=".35" stroke-width=".7"/>`;
    if (level === 1) detail += `<ellipse cx="${seed % 3 - 1}" cy="${top - 2}" rx="2.2" ry="1.2" fill="#7A8755"/>`;
    if (level === 2) detail += `<path d="M0 ${top}v-9" stroke="#B8D985"/><path d="M0 ${top - 4}Q-8 ${top - 10} -5 ${top - 10}Q1 ${top - 10} 0 ${top - 4}M0 ${top - 5}Q7 ${top - 13} 6 ${top - 8}Q5 ${top - 4} 0 ${top - 5}" fill="#79A85D"/>`;
    if (level === 3) {
      for (const direction of [-1, 1]) {
        detail += `<path d="M0 ${top}Q${direction * 2} ${top - 10} ${direction * 7} ${top - 14}" fill="none" stroke="#B8D985" stroke-width="1"/>`;
        for (let leaf = 0; leaf < 3; leaf++) detail += `<path d="M${direction * (leaf + 1)} ${top - 3 - leaf * 3}q${direction * 7} -5 ${direction * 6} -1q-2 3 ${-direction * 6} 1" fill="${leaf % 2 ? '#B8D985' : '#79A85D'}"/>`;
      }
    }
    if (level === 4) detail += `<path d="M0 ${top + 1}v-16" stroke="#43513A" stroke-width="2.4"/><path d="M0 ${top - 29}L-7 ${top - 17}H-4L-10 ${top - 10}Q0 ${top - 6} 10 ${top - 10}L4 ${top - 17}H7Z" fill="#79A85D"/><path d="M0 ${top - 29}L0 ${top - 9}Q5 ${top - 8} 10 ${top - 10}L4 ${top - 17}H7Z" fill="#467449"/><path d="M0 ${top - 29}L-7 ${top - 17}H-4" fill="none" stroke="#B8D985" stroke-width="1"/><circle cx="-2" cy="${top - 17}" r=".9" fill="#83EAD3"/>`;
  }
  const title = legend ? `GitHub contribution level: ${day.contributionLevel}` : `${day.date}: ${day.contributionCount} contributions (${day.contributionLevel})`;
  return `<g transform="translate(${x} ${y})"${legend ? ` data-legend-level="${day.contributionLevel}"` : ` data-date="${day.date}" data-count="${day.contributionCount}" data-level="${day.contributionLevel}" data-weekday="${day.weekday}"`}><title>${xml(title)}</title><ellipse cx="1" cy="7" rx="12" ry="5" fill="#061611" opacity=".65"/><path d="M-10 ${top}L0 ${top + 5}V8L-10 3Z" fill="#102C25" stroke="#061611" stroke-width=".6"/><path d="M0 ${top + 5}L10 ${top}V3L0 8Z" fill="#061611" stroke="#284D36" stroke-width=".5"/><path d="M-10 ${top}L0 ${top - 5}L10 ${top}L0 ${top + 5}Z" fill="#284037"/><path d="M-9 2L-2 5M2 5L8 2" stroke="#43513A" stroke-width=".6"/>${detail}</g>`;
}

function golem(x, y, scale) {
  return `<g aria-hidden="true" transform="translate(${x} ${y}) scale(${scale})"><ellipse cy="29" rx="39" ry="9" fill="#061611"/><path d="M-34 15C-39 -2 -23 -35 -3 -37C23 -41 39 -4 34 16Q25 33 -25 27Z" fill="url(#stone)" stroke="#B8D985" stroke-opacity=".45"/><path d="M-28 -6Q-15 -29 4 -28M-24 15L-14 20M12 -22L18 -14" fill="none" stroke="#B8D985" stroke-opacity=".38" stroke-width="2"/><path d="M-22 -23Q-17 -35 -2 -34Q5 -35 9 -29L-1 -26L-10 -29Z" fill="#79A85D"/><ellipse cx="-12" cy="3" rx="3" ry="4" fill="#061611"/><ellipse cx="13" cy="5" rx="3" ry="4" fill="#061611"/><circle cx="-13" cy="2" r="1" fill="#E9EFE0"/><circle cx="12" cy="4" r="1" fill="#E9EFE0"/><path d="M-3 12l8 1" stroke="#061611" stroke-width="2" stroke-linecap="round"/><path d="M-27 5l3 -3M20 17l3 -2" stroke="#83EAD3" stroke-opacity=".4"/></g>`;
}

export function renderGarden(input, { mobile = false } = {}) {
  const data = validateSnapshot(input);
  const width = mobile ? 400 : 1200;
  const firstWeekday = data.days[0].weekday;
  const weekCount = Math.ceil((firstWeekday + data.days.length) / 7);
  const perPlot = mobile ? 14 : weekCount;
  const plots = Math.ceil(weekCount / perPlot);
  const height = mobile ? 270 + plots * 224 + 124 : 650;
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="garden-title garden-desc"><title id="garden-title">Supia7 contribution garden</title><desc id="garden-desc">${data.days.length} consecutive days, ${data.startDate} through ${data.endDate}; ${data.totalContributions} contributions. Every soil tile is one day; moss, sprouts, ferns and trees encode GitHub's five contribution levels. Updated ${data.fetchedAt.slice(0, 10)}. Contributions are not commits or a productivity score.</desc><defs><linearGradient id="night" x2="0" y2="1"><stop stop-color="#102C25"/><stop offset="1" stop-color="#071C17"/></linearGradient><linearGradient id="stone" x2=".8" y2="1"><stop stop-color="#B8D985"/><stop offset=".4" stop-color="#7A8755"/><stop offset="1" stop-color="#284D36"/></linearGradient><radialGradient id="mist"><stop stop-color="#83EAD3" stop-opacity=".13"/><stop offset="1" stop-color="#83EAD3" stop-opacity="0"/></radialGradient></defs><rect width="${width}" height="${height}" rx="24" fill="url(#night)"/><ellipse cx="${width * .55}" cy="${height * .5}" rx="${width * .6}" ry="${height * .4}" fill="url(#mist)"/>`];
  const inset = mobile ? 24 : 48;
  parts.push(text(inset, 42, 'SUPIA / THE LIVING WORKBENCH', mobile ? 12 : 14, '#83EAD3', 'letter-spacing="2"'));
  parts.push(`<text x="${inset}" y="${mobile ? 83 : 102}" font-family="Georgia,serif" font-size="${mobile ? 28 : 44}" fill="#E9EFE0">A year, quietly growing.</text>`);
  parts.push(text(inset, mobile ? 117 : 142, `${data.totalContributions.toLocaleString('en-US')} contributions`, mobile ? 20 : 28, '#E9EFE0'));
  parts.push(text(inset, mobile ? 145 : 174, `${data.startDate} — ${data.endDate}`, mobile ? 16 : 20));
  parts.push(text(inset, mobile ? 169 : 202, `Updated ${data.fetchedAt.slice(0, 10)} · ${data.days.length} days`, 16));
  parts.push(golem(mobile ? 336 : 1090, mobile ? 215 : 130, mobile ? .68 : 1.55));
  for (let plot = 0; plot < plots; plot++) {
    const plotDays = data.days.map((day, index) => ({ day, week: Math.floor((index + firstWeekday) / 7) })).filter(({ week }) => Math.floor(week / perPlot) === plot);
    const baseY = mobile ? 270 + plot * 224 : 280;
    parts.push(`<g data-plot="${plot + 1}">`);
    if (mobile) parts.push(text(24, baseY - 24, `${plotDays[0].day.date} — ${plotDays.at(-1).day.date}`, 14, '#E9EFE0'));
    else {
      // 실제 달력의 월 경계만 표시하며 빈 날짜 타일은 추가하지 않는다.
      for (const { day, week } of plotDays) if (day.date.endsWith('-01') || day === data.days[0]) parts.push(text(68 + week * 18.6, baseY - 32 + week * 2.7, new Date(`${day.date}T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), 14));
    }
    const originX = mobile ? 40 : 68;
    for (const { day, week } of plotDays) {
      const localWeek = week - plot * perPlot;
      const x = originX + localWeek * (mobile ? 19 : 18.6) + (6 - day.weekday) * 12;
      const y = baseY + localWeek * (mobile ? 3 : 2.7) + day.weekday * 14;
      parts.push(tile(day, Number(x.toFixed(2)), Number(y.toFixed(2))));
    }
    parts.push('</g>');
  }
  const footerY = mobile ? 270 + plots * 224 : 558;
  parts.push(text(inset, footerY, 'GITHUB CONTRIBUTION LEVELS', 14, '#83EAD3', 'letter-spacing="1"'));
  const names = ['Bare', 'Moss', 'Sprout', 'Fern', 'Tree'];
  for (let level = 0; level < 5; level++) {
    const x = inset + 18 + level * (mobile ? 70 : 128);
    parts.push(tile({ date: '2026-01-01', weekday: 4, contributionCount: level, contributionLevel: LEVELS[level] }, x, footerY + 46, true));
    parts.push(text(x + (mobile ? 0 : 19), footerY + (mobile ? 75 : 49), names[level], mobile ? 14 : 16, '#E9EFE0', mobile ? 'text-anchor="middle"' : ''));
  }
  parts.push(text(inset, height - 20, 'One tile, one day. Contributions ≠ productivity.', 14));
  parts.push('</svg>');
  return parts.join('\n') + '\n';
}

export function renderSummary(input, { readme = false } = {}) {
  const data = validateSnapshot(input);
  const rawPath = readme ? './data/contribution-calendar.json' : './contribution-calendar.json';
  const rendererPath = readme ? './scripts/contribution-garden.mjs' : '../scripts/contribution-garden.mjs';
  return `**${data.totalContributions.toLocaleString('en-US')} contributions** across **${data.days.length} days**, ${data.startDate} through ${data.endDate}. Updated ${data.fetchedAt.slice(0, 10)} (UTC).\n\nEach tile represents one day. Bare soil, moss, sprouts, ferns and trees encode GitHub's five contribution levels. Contributions are not commits or a productivity score. Private contributions may be excluded by the API or token scope.\n\n[Raw calendar](${rawPath}) · [Garden renderer](${rendererPath})\n`;
}

export function readmeBlock(data) {
  return renderSummary(data, { readme: true });
}

// 표준 출력 렌더링은 파일 쓰기를 하지 않아 파이프와 검토에 사용할 수 있다.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const snapshot = JSON.parse(await readFile(process.argv[2] ?? 'data/contribution-calendar.json', 'utf8'));
    process.stdout.write(renderGarden(snapshot, { mobile: process.argv.includes('--mobile') }));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
