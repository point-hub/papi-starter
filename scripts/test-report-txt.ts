import fs from 'fs';
import { parseStringPromise } from 'xml2js';

/* ---------- Types ---------- */

type TestCase = {
  file: string;
  name: string;
  failed: boolean;
};

type XmlAttributes = {
  name?: string;
};

type XmlFailure = {
  _: string;
};

type XmlTestCase = {
  $: XmlAttributes;
  failure?: XmlFailure[];
};

type XmlTestSuite = {
  $?: XmlAttributes;
  testcase?: XmlTestCase[];
  testsuite?: XmlTestSuite[];
};

type XmlTestSuitesRoot = {
  testsuites: {
    testsuite: XmlTestSuite[];
  };
};

/* ---------- Constants ---------- */

const REPORT_DIR = 'test-reports';

/* ---------- Helpers ---------- */

const formatTimestamp = (date: Date, isFormattingFilename = false): string => {
  const pad = (n: number): string => n.toString().padStart(2, '0');

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const sec = pad(date.getSeconds());

  return isFormattingFilename
    ? `${yyyy}${mm}${dd}-${hh}${min}${sec}`
    : `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
};

/* ---------- Read & Parse XML ---------- */

const xml = fs.readFileSync(`${REPORT_DIR}/test-report.xml`, 'utf8');
const parsed = (await parseStringPromise(xml)) as XmlTestSuitesRoot;

/* ---------- Collect Test Cases ---------- */

const cases: TestCase[] = [];

const walk = (suite: XmlTestSuite, file = ''): void => {
  const suiteName = suite.$?.name;
  const currentFile =
    suiteName && suiteName.endsWith('.spec.ts') ? suiteName : file;

  if (suite.testcase) {
    for (const t of suite.testcase) {
      cases.push({
        file: currentFile || 'unknown',
        name: t.$.name ?? '(unnamed test)',
        failed: Boolean(t.failure && t.failure.length > 0),
      });
    }
  }

  if (suite.testsuite) {
    for (const child of suite.testsuite) {
      walk(child, currentFile);
    }
  }
};

for (const suite of parsed.testsuites.testsuite) {
  walk(suite);
}

/* ---------- Summary ---------- */

const failed = cases.filter(t => t.failed).length;

/* ---------- Output Text ---------- */

let out = `
TEST REPORT
=====================

Project      : PAPI STARTER
Generated at : ${formatTimestamp(new Date())}

SUMMARY
-------
Total Tests  : ${cases.length}
Passed       : ${cases.length - failed}
Failed       : ${failed}

TEST CASES
----------
`;

const grouped = new Map<string, TestCase[]>();

for (const t of cases) {
  const list = grouped.get(t.file);
  if (list) {
    list.push(t);
  } else {
    grouped.set(t.file, [t]);
  }
}

for (const [file, tests] of grouped) {
  out += `${file}\n`;
  for (const t of tests) {
    out += `  ${t.failed ? '✗' : '✔'} ${t.name}\n`;
  }
  out += '\n';
}

out += `
OVERALL RESULT
--------------
${failed === 0 ? '✅ ALL TESTS PASSED' : '❌ TEST FAILURES'}`;

/* ---------- Write File ---------- */

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const txtPath = `${REPORT_DIR}/test-${formatTimestamp(new Date(), true)}.txt`;
fs.writeFileSync(txtPath, out.trim() + '\n');
