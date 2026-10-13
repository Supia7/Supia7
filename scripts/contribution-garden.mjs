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

function text(x, y, content, size = 16, extra = '') {
  return `<text x="${x}" y="${y}" fill="#B4DCD0" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${xml(content)}</text>`;
}

export function renderGarden(input, { mobile = false } = {}) {
  const data = validateSnapshot(input);
  const width = mobile ? 400 : 1200;
  const height = mobile ? 140 : 230;
  const inset = mobile ? 16 : 24;
  const firstWeekday = data.days[0].weekday;
  const weekCount = Math.ceil((firstWeekday + data.days.length) / 7);
  const pitch = Math.min(mobile ? 8 : 22, (width - inset * 2) / weekCount);
  const size = pitch * .8;
  const originX = (width - pitch * weekCount) / 2;
  const originY = mobile ? 40 : 44;
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="garden-title garden-desc">
<title id="garden-title">Supia7 contribution lawn</title>
<desc id="garden-desc">${data.days.length} days, ${data.startDate} through ${data.endDate}; ${data.totalContributions} contributions from GitHub's API. One square per day; brighter green means a higher contribution level. Updated ${data.fetchedAt.slice(0, 10)}.</desc>
<rect width="${width}" height="${height}" rx="12" fill="#071C17"/>
<g data-plot="1">`];
  for (const [index, day] of data.days.entries()) {
    const week = Math.floor((index + firstWeekday) / 7);
    const x = originX + week * pitch;
    const y = originY + day.weekday * pitch;
    const level = LEVELS.indexOf(day.contributionLevel);
    if (day.date.endsWith('-01') || (!mobile && index === 0)) parts.push(text(x, originY - 12, new Date(`${day.date}T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), mobile ? 12 : 18));
    parts.push(`<g data-date="${day.date}" data-count="${day.contributionCount}" data-level="${day.contributionLevel}" data-weekday="${day.weekday}"><title>${xml(`${day.date}: ${day.contributionCount} contributions`)}</title><rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" rx="${(size * .18).toFixed(2)}" fill="${COLORS[level]}"/></g>`);
  }
  parts.push('</g>');
  const legendSize = mobile ? 8 : 12;
  const legendPitch = legendSize + 4;
  const legendX = width - inset - legendPitch * 5 - (mobile ? 34 : 48);
  const legendY = height - (mobile ? 30 : 24);
  parts.push(text(legendX - (mobile ? 32 : 48), legendY + legendSize, 'Less', mobile ? 12 : 16));
  for (const [level, color] of COLORS.entries()) {
    parts.push(`<g data-legend-level="${LEVELS[level]}"><title>${LEVELS[level]}</title><rect x="${legendX + level * legendPitch}" y="${legendY}" width="${legendSize}" height="${legendSize}" rx="2" fill="${color}"/></g>`);
  }
  parts.push(text(legendX + legendPitch * 5 + 4, legendY + legendSize, 'More', mobile ? 12 : 16));
  parts.push('</svg>');
  return parts.join('\n') + '\n';
}

export function renderSummary(input, { readme = false } = {}) {
  const data = validateSnapshot(input);
  if (readme) return `<sub>${data.totalContributions.toLocaleString('en-US')} contributions · ${data.startDate} – ${data.endDate} · Updated ${data.fetchedAt.slice(0, 10)} (UTC)</sub>\n`;
  return `**${data.totalContributions.toLocaleString('en-US')} contributions** across **${data.days.length} days**, ${data.startDate} through ${data.endDate}. Updated ${data.fetchedAt.slice(0, 10)} (UTC).\n\nEach square represents one day; five moss-green stages follow GitHub's contribution levels. Contributions are not commits or a productivity score. Private contributions may be excluded by the API or token scope. The API and native profile graph can group some activity on different dates.\n\n[Raw calendar](./contribution-calendar.json) · [Garden renderer](../scripts/contribution-garden.mjs)\n`;
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
