import fs from 'fs';
import PDFDocument from 'pdfkit';
import { parseStringPromise } from 'xml2js';

/* ---------- Types ---------- */

type TestCase = {
  suite: string;
  name: string;
  time: number;
  failed: boolean;
};

type XmlAttributes = {
  name?: string;
  time?: string;
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

type XmlTestSuites = {
  testsuites: {
    testsuite: XmlTestSuite[];
  };
};

/**
 * Recursively collect ALL testcases from Bun JUnit XML
 */
const collectTestCases = (
  suite: XmlTestSuite,
  parentName = '',
  results: TestCase[] = [],
): TestCase[] => {
  const currentName =
    suite.$?.name
      ? parentName
        ? `${parentName} › ${suite.$.name}`
        : suite.$.name
      : parentName;

  // Collect testcases at this level
  if (suite.testcase) {
    for (const test of suite.testcase) {
      results.push({
        suite: currentName,
        name: test.$.name ?? '(unnamed test)',
        time: Number(test.$.time ?? 0) * 1000,
        failed: Boolean(test.failure && test.failure.length > 0),
      });
    }
  }

  // Recurse into nested test suites
  if (suite.testsuite) {
    for (const child of suite.testsuite) {
      collectTestCases(child, currentName, results);
    }
  }

  return results;
};

const formatTimestamp = (date: Date, isFormattingFilename = false): string => {
  const pad = (n: number): string => n.toString().padStart(2, '0');

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const sec = pad(date.getSeconds());

  if (isFormattingFilename) {
    return `${yyyy}${mm}${dd}-${hh}${min}${sec}`;
  }

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
};

const generate = async (): Promise<void> => {
  const REPORT_DIR = 'test-reports';
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const xml = fs.readFileSync(`${REPORT_DIR}/test-report.xml`, 'utf8');
  const parsed = await parseStringPromise(xml) as XmlTestSuites;

  const rootSuites = parsed.testsuites.testsuite;

  const testCases: TestCase[] = [];
  for (const suite of rootSuites) {
    collectTestCases(suite, '', testCases);
  }

  const total = testCases.length;
  const failed = testCases.filter(t => t.failed).length;
  const passed = total - failed;

  /* ---------- PDF ---------- */
  const pdfPath = `${REPORT_DIR}/test-${formatTimestamp(new Date(), true)}.pdf`;

  const doc = new PDFDocument({ margin: 25 });
  doc.pipe(fs.createWriteStream(pdfPath));

  // Header
  doc.moveDown();
  doc.moveTo(25, doc.y).lineTo(575, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(12).text('TEST REPORT - PAPI STARTER');
  doc.fontSize(8).text(`${formatTimestamp(new Date())}`);
  doc.moveDown();

  // Summary
  doc.fontSize(10).text(`Total tests: ${total}`);
  doc.text(`Passed: ${passed}`);
  doc.text(`Failed: ${failed}`);
  doc.moveDown();

  doc.moveTo(25, doc.y).lineTo(575, doc.y).stroke();
  doc.moveDown();

  // Details
  let lastSuite = '';

  for (const test of testCases) {
    if (test.suite !== lastSuite) {
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('black').text(test.suite);
      doc.moveDown(0.25);
      lastSuite = test.suite;
    }

    if (test.failed) {
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('red')
        .text(`[FAIL] ${test.name}`);
    } else {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('black')
        .text(`[PASS] ${test.name} (${test.time.toFixed(0)} ms)`);
    }
  }

  doc.end();
};

generate().catch((err: unknown) => {
  console.error('Failed to generate test PDF report:', err);
  process.exit(1);
});
