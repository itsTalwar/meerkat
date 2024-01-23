import { Member } from '../types/cube-types/query';
import { TableSchema } from '../types/cube-types/table';
import {
  applyProjectionToSQLQuery,
  cubeMeasureToSQLSelectString,
} from './cube-measure-transformer';

describe('cubeMeasureToSQLSelectString', () => {
  let tableSchema: TableSchema;
  const cube = 'cube_test';

  beforeEach(() => {
    tableSchema = {
      name: 'test',
      sql: cube,
      measures: [
        { name: 'measure1', sql: 'COUNT(*)', type: 'number' },
        { name: 'measure2', sql: 'SUM(total)', type: 'number' },
      ],
      dimensions: [
        { name: 'dimension1', sql: 'dimension1', type: 'number' },
        {
          name: 'dimension2',
          sql: `DATE_TRUNC('month', order_date)`,
          type: 'number',
        },
      ],
    };
  });

  it('should construct a SQL select string with COUNT(*) when provided with correct measure', () => {
    const measures: Member[] = ['temp.measure1'];
    const result = cubeMeasureToSQLSelectString(measures, tableSchema);
    expect(result).toBe(`SELECT COUNT(*) AS temp__measure1 `);
  });

  it('should construct a SQL select string with SUM(total) when provided with correct measure', () => {
    const measures: Member[] = ['temp.measure2'];
    const result = cubeMeasureToSQLSelectString(measures, tableSchema);
    expect(result).toBe(`SELECT SUM(total) AS temp__measure2 `);
  });

  it('should substitute "*" for all columns in the cube', () => {
    const measures: Member[] = ['*'];
    const result = cubeMeasureToSQLSelectString(measures, tableSchema);
    expect(result).toBe(`SELECT test.*`);
  });

  it('should replace the select portion of a SQL string using replaceSelectWithCubeMeasure 1', () => {
    const measures: Member[] = ['temp.measure1', 'temp.measure2'];
    const sqlToReplace = 'SELECT * FROM my_table';
    const result = applyProjectionToSQLQuery(
      [],
      measures,
      tableSchema,
      sqlToReplace
    );
    expect(result).toBe(
      `SELECT COUNT(*) AS temp__measure1 ,  SUM(total) AS temp__measure2  FROM my_table`
    );
  });

  it('should replace the select portion of a SQL string using replaceSelectWithCubeMeasure 2', () => {
    const measures: Member[] = ['temp.measure1', 'temp.measure2'];
    const sqlToReplace = 'SELECT * FROM (SELECT * FROM TABLE_1)';
    const result = applyProjectionToSQLQuery(
      [],
      measures,
      tableSchema,
      sqlToReplace
    );
    expect(result).toBe(
      `SELECT COUNT(*) AS temp__measure1 ,  SUM(total) AS temp__measure2  FROM (SELECT * FROM TABLE_1)`
    );
  });

  it('should replace the select portion of a SQL string using replaceSelectWithCubeMeasure & dimension', () => {
    const measures: Member[] = ['temp.measure1', 'temp.measure2'];
    const dimensions: Member[] = ['temp.dimension1', 'temp.dimension2'];
    const sqlToReplace = 'SELECT * FROM (SELECT * FROM TABLE_1)';
    const result = applyProjectionToSQLQuery(
      dimensions,
      measures,
      tableSchema,
      sqlToReplace
    );
    expect(result).toBe(
      `SELECT COUNT(*) AS temp__measure1 ,  SUM(total) AS temp__measure2 ,   temp__dimension1,  temp__dimension2 FROM (SELECT * FROM TABLE_1)`
    );
  });
});
