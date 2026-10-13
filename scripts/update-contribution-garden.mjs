import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readmeBlock, renderGarden, renderSummary, snapshotFromGraphQL, validateSnapshot } from './contribution-garden.mjs';

const exec = promisify(execFile);
const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const QUERY = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    login
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date weekday contributionCount contributionLevel } }
      }
    }
  }
}`;

export async function fetchCalendar({ now = new Date(), token = process.env.GH_TOKEN, fetchImpl = fetch, gh = exec } = {}) {
  const fetchedAt = now.toISOString();
  const start = new Date(`${fetchedAt.slice(0, 10)}T00:00:00Z`);
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  start.setUTCDate(start.getUTCDate() + 1);
  const variables = { login: 'Supia7', from: start.toISOString(), to: fetchedAt };
  let payload;
  if (token) {
    let response;
    try {
      response = await fetchImpl('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'Supia7-contribution-garden' },
        body: JSON.stringify({ query: QUERY, variables }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error('HTTP failure');
      payload = await response.json();
    } catch {
      throw new Error('GitHub calendar request failed; no artifacts changed');
    }
  } else {
    try {
      const { stdout } = await gh('gh', ['api', 'graphql', '-f', `query=${QUERY}`, '-f', 'login=Supia7', '-f', `from=${variables.from}`, '-f', `to=${variables.to}`], { timeout: 30_000, maxBuffer: 2_000_000 });
      payload = JSON.parse(stdout);
    } catch {
      throw new Error('Authenticated gh calendar request failed; no artifacts changed');
    }
  }
  const snapshot = snapshotFromGraphQL(payload, fetchedAt);
  if (snapshot.startDate !== variables.from.slice(0, 10) || snapshot.endDate !== fetchedAt.slice(0, 10)) throw new Error('GitHub returned an incomplete requested period');
  return snapshot;
}

export function replaceReadmeGarden(readme, snapshot) {
  const start = '<!-- garden:start -->';
  const end = '<!-- garden:end -->';
  if (readme.split(start).length !== 2 || readme.split(end).length !== 2 || readme.indexOf(start) >= readme.indexOf(end)) throw new Error('README requires one ordered garden marker pair');
  return readme.slice(0, readme.indexOf(start) + start.length) + '\n\n' + readmeBlock(snapshot) + '\n' + readme.slice(readme.indexOf(end));
}

// 수집, 검증, 렌더링과 README 계약 확인이 모두 성공한 뒤에만 파일을 쓴다.
export async function updateGarden({ root = ROOT, getSnapshot = fetchCalendar, updateReadme = false } = {}) {
  const snapshot = validateSnapshot(await getSnapshot());
  const artifacts = new Map([
    ['data/contribution-calendar.json', JSON.stringify(snapshot, null, 2) + '\n'],
    ['assets/contribution-garden.svg', renderGarden(snapshot)],
    ['assets/contribution-garden-mobile.svg', renderGarden(snapshot, { mobile: true })],
    ['data/garden-summary.md', renderSummary(snapshot)],
  ]);
  if (updateReadme) artifacts.set('README.md', replaceReadmeGarden(await readFile(resolve(root, 'README.md'), 'utf8'), snapshot));
  const staged = [];
  try {
    for (const [name, content] of artifacts) {
      const target = resolve(root, name);
      await mkdir(dirname(target), { recursive: true });
      const temporary = `${target}.${process.pid}.tmp`;
      staged.push([temporary, target]);
      await writeFile(temporary, content, { flag: 'wx' });
    }
    for (const [temporary, target] of staged) await rename(temporary, target);
  } finally {
    await Promise.all(staged.map(([temporary]) => rm(temporary, { force: true })));
  }
  return snapshot;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => !['--update-readme', '--from-snapshot'].includes(arg) && args[args.indexOf(arg) - 1] !== '--from-snapshot')) throw new Error('Usage: node scripts/update-contribution-garden.mjs [--update-readme] [--from-snapshot path]');
    const inputIndex = args.indexOf('--from-snapshot');
    if (inputIndex !== -1 && !args[inputIndex + 1]) throw new Error('--from-snapshot requires a path');
    const getSnapshot = inputIndex === -1 ? fetchCalendar : async () => JSON.parse(await readFile(resolve(args[inputIndex + 1]), 'utf8'));
    const data = await updateGarden({ getSnapshot, updateReadme: args.includes('--update-readme') });
    console.log(`${data.login}: ${data.totalContributions} contributions; ${data.days.length} days; ${data.startDate} through ${data.endDate}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
