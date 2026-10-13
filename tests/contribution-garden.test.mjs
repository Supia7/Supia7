import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LEVELS, validateSnapshot, snapshotFromGraphQL, renderGarden, renderSummary } from '../scripts/contribution-garden.mjs';
import { fetchCalendar, replaceReadmeGarden, updateGarden } from '../scripts/update-contribution-garden.mjs';

function fixture({ start = '2025-10-14', length = 365, empty = false } = {}) {
  const days = Array.from({ length }, (_, index) => {
    const date = new Date(Date.parse(`${start}T00:00:00Z`) + index * 86_400_000);
    const level = empty ? 0 : index % 5;
    return { date: date.toISOString().slice(0, 10), weekday: date.getUTCDay(), contributionCount: level, contributionLevel: LEVELS[level] };
  });
  return { schemaVersion: 1, login: 'Supia7', source: 'GitHub GraphQL contributionCalendar', fetchedAt: '2026-10-13T12:00:00.000Z', startDate: days[0].date, endDate: days.at(-1).date, totalContributions: days.reduce((sum, day) => sum + day.contributionCount, 0), days };
}

function api(data) {
  const weeks = [];
  for (const day of data.days) {
    if (!weeks.length || day.weekday === 0) weeks.push({ contributionDays: [] });
    weeks.at(-1).contributionDays.push(day);
  }
  return { data: { user: { login: 'Supia7', contributionsCollection: { contributionCalendar: { totalContributions: data.totalContributions, weeks } } } } };
}

test('every day is serialized exactly once and in order at both widths', () => {
  const data = fixture();
  for (const mobile of [false, true]) {
    const svg = renderGarden(data, { mobile });
    const dates = [...svg.matchAll(/data-date="([^"]+)"/g)].map(match => match[1]);
    const counts = [...svg.matchAll(/data-count="(\d+)"/g)].map(match => Number(match[1]));
    assert.deepEqual(dates, data.days.map(day => day.date));
    assert.equal(new Set(dates).size, data.days.length);
    assert.equal(counts.reduce((sum, value) => sum + value, 0), data.totalContributions);
    assert.equal(svg, renderGarden(data, { mobile }));
    assert.match(svg, mobile ? /width="400"/ : /width="1200"/);
    assert.equal([...svg.matchAll(/data-plot=/g)].length, mobile ? 4 : 1);
    assert.doesNotMatch(svg, /foreignObject|<script|<image|href=/);
    assert.match(svg, /aria-labelledby="garden-title garden-desc"/);
  }
});

test('partial weeks survive API normalization without padding', () => {
  const data = fixture({ start: '2026-10-08', length: 6 });
  assert.deepEqual(snapshotFromGraphQL(api(data), data.fetchedAt), data);
  const svg = renderGarden(data);
  assert.equal([...svg.matchAll(/data-date=/g)].length, 6);
  assert.doesNotMatch(svg, /data-date="2026-10-14"/);
});

test('empty activity still preserves the full period and five encodings', () => {
  const data = fixture({ empty: true });
  assert.equal(validateSnapshot(data).totalContributions, 0);
  assert.equal([...renderGarden(data).matchAll(/data-level="NONE"/g)].length, 365);
  assert.equal(Number(renderSummary(data).match(/\*\*([\d,]+)/)[1].replaceAll(',', '')), data.totalContributions);
  const varied = renderGarden(fixture());
  for (const level of LEVELS) assert.match(varied, new RegExp(`data-level="${level}"`));
  assert.deepEqual([...varied.matchAll(/data-legend-level="([^"]+)"/g)].map(match => match[1]), LEVELS);
  const shapes = [...varied.matchAll(/<g[^>]*data-legend-level="[^"]+"[^>]*>([\s\S]*?)<\/g>/g)]
    .map(match => match[1].replace(/<title>[\s\S]*?<\/title>/g, '').replace(/fill="[^"]+"|stroke="[^"]+"/g, ''));
  assert.equal(new Set(shapes).size, LEVELS.length);
});

test('serialization rejects wrong date, weekday, level, count, order and total', () => {
  const mutations = [
    data => { data.days[1].date = data.days[0].date; },
    data => { data.days.reverse(); },
    data => { data.days.splice(1, 1); },
    data => { data.days[0].date = '2025-02-30'; },
    data => { data.days[0].weekday = 6; },
    data => { data.days[0].contributionLevel = 'FOURTH_QUARTILE'; },
    data => { data.days[1].contributionLevel = 'MADE_UP'; },
    data => { data.days[1].contributionCount = -1; },
    data => { data.days[1].contributionCount = 1.5; },
    data => { data.totalContributions++; },
    data => { data.endDate = '2026-10-14'; },
    data => { data.fetchedAt = '2025-10-14T00:00:00.000Z'; },
  ];
  for (const mutate of mutations) {
    const data = fixture();
    mutate(data);
    assert.throws(() => validateSnapshot(data));
  }
  assert.throws(() => snapshotFromGraphQL({ errors: [{ message: 'secret' }] }, fixture().fetchedAt), /GraphQL returned errors/);
  assert.throws(() => snapshotFromGraphQL({ data: { user: null } }, fixture().fetchedAt), /Missing/);
});

test('token fetch sends query variables and validates public calendar', async () => {
  const data = fixture();
  let called = false;
  const result = await fetchCalendar({
    now: new Date(data.fetchedAt), token: 'test-only',
    fetchImpl: async (url, options) => {
      called = true;
      assert.equal(url, 'https://api.github.com/graphql');
      assert.equal(options.headers.Authorization, 'Bearer test-only');
      assert.deepEqual(JSON.parse(options.body).variables, { login: 'Supia7', from: '2025-10-14T00:00:00.000Z', to: data.fetchedAt });
      return { ok: true, json: async () => api(data) };
    },
  });
  assert.equal(called, true);
  assert.deepEqual(result, data);
  await assert.rejects(fetchCalendar({ token: 'secret', fetchImpl: async () => ({ ok: false }) }), /request failed/);
  await assert.rejects(fetchCalendar({ token: 'secret', fetchImpl: async () => ({ ok: true, json: async () => ({ errors: [{}] }) }) }), /GraphQL returned errors/);
  await assert.rejects(fetchCalendar({ now: new Date(data.fetchedAt), token: 'secret', fetchImpl: async () => ({ ok: true, json: async () => api(fixture({ length: 10 })) }) }), /incomplete/);
});

test('gh authenticated fallback and malformed responses do not leak errors', async () => {
  const data = fixture();
  assert.deepEqual(await fetchCalendar({
    now: new Date(data.fetchedAt), token: '',
    gh: async (command, args) => {
      assert.equal(command, 'gh');
      assert.deepEqual(args.slice(0, 2), ['api', 'graphql']);
      return { stdout: JSON.stringify(api(data)) };
    },
  }), data);
  await assert.rejects(fetchCalendar({ token: '', gh: async () => { throw new Error('credential'); } }), error => !error.message.includes('credential'));
  await assert.rejects(fetchCalendar({ token: '', gh: async () => ({ stdout: 'not json' }) }), /request failed/);
});

test('failed fetch, validation and marker contracts leave all old artifacts unchanged', async t => {
  const root = await mkdtemp(join(tmpdir(), 'garden-failure-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const paths = ['data/contribution-calendar.json', 'data/garden-summary.md', 'assets/contribution-garden.svg', 'assets/contribution-garden-mobile.svg', 'README.md'];
  for (const path of paths) {
    await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(join(root, path), 'previous good');
  }
  for (const getSnapshot of [async () => { throw new Error('fetch'); }, async () => ({})]) {
    await assert.rejects(updateGarden({ root, getSnapshot }));
    for (const path of paths) assert.equal(await readFile(join(root, path), 'utf8'), 'previous good');
  }
  await assert.rejects(updateGarden({ root, getSnapshot: async () => fixture(), updateReadme: true }), /marker pair/);
  for (const path of paths) assert.equal(await readFile(join(root, path), 'utf8'), 'previous good');
});

test('updater writes the same validated data and only owned README block', async t => {
  const root = await mkdtemp(join(tmpdir(), 'garden-success-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const before = 'Intro\n<!-- garden:start -->\nold\n<!-- garden:end -->\nFooter\n';
  await writeFile(join(root, 'README.md'), before);
  const data = fixture();
  await updateGarden({ root, getSnapshot: async () => data });
  assert.equal(await readFile(join(root, 'README.md'), 'utf8'), before);
  await updateGarden({ root, getSnapshot: async () => data, updateReadme: true });
  assert.deepEqual(JSON.parse(await readFile(join(root, 'data/contribution-calendar.json'), 'utf8')), data);
  assert.equal(await readFile(join(root, 'data/garden-summary.md'), 'utf8'), renderSummary(data));
  assert.deepEqual([...renderSummary(data).matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]), ['./contribution-calendar.json', '../scripts/contribution-garden.mjs']);
  assert.deepEqual([...replaceReadmeGarden(before, data).matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]), ['./data/contribution-calendar.json', './scripts/contribution-garden.mjs']);
  assert.equal(await readFile(join(root, 'README.md'), 'utf8'), replaceReadmeGarden(before, data));
  assert.throws(() => replaceReadmeGarden('<!-- garden:end --><!-- garden:start -->', data));
  assert.throws(() => replaceReadmeGarden('<!-- garden:start --><!-- garden:start --><!-- garden:end -->', data));
});
