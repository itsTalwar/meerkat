import puppeteer from 'puppeteer';
import { TEST_DATA, TABLE_SCHEMA } from '../src/__tests__/test-data';

describe('Browser cube-to-sql tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  TEST_DATA.forEach(testCase => {
    it(`Testing ${testCase.testName} in browser`, async () => {
      const result = await page.evaluate(async (cubeQuery, tableSchema) => {
        const connection = {}; // Mocked DuckDB connection
        const cubeQueryToSQL = window.cubeQueryToSQL; // Assuming cubeQueryToSQL is exposed to window
        return cubeQueryToSQL(connection, cubeQuery, [tableSchema]);
      }, testCase.cubeInput, TABLE_SCHEMA);

      expect(result.sql).toEqual(testCase.expectedSQL);
      // Additional logic to handle DuckDB execution and result assertion in browser context
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});
