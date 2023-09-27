import { Query, TableSchema } from '@devrev/cube-types';
import { SelectNode } from '@devrev/duckdb-serialization-types';
import { cubeFilterToDuckdbAST } from './cube-filter-transformer/factory';
import { cubeDimensionToGroupByAST } from './cube-group-by-transformer/cube-group-by-transformer';
import { getBaseAST } from './utils/base-ast';
import { cubeFiltersEnrichment } from './utils/cube-filter-enrichment';

export const cubeToDuckdbAST = (query: Query, tableSchema: TableSchema) => {
  const tableKey: string | null = 'base'; //tableKeyFromMeasuresDimension(query);
  /**
   * If no table key was found, return null.
   */
  if (!tableKey) {
    return null;
  }

  /**
   * Obviously, if no table schema was found, return null.
   */
  if (!tableSchema) {
    return null;
  }

  const baseAST = getBaseAST();

  if (query.filters && query.filters.length > 0) {
    /**
     * Make a copy of the query filters and enrich them with the table schema.
     */
    const queryFiltersWithInfo = cubeFiltersEnrichment(
      JSON.parse(JSON.stringify(query.filters)),
      tableSchema
    );
    console.info(JSON.stringify(queryFiltersWithInfo, null, 2));

    if (!queryFiltersWithInfo) {
      return null;
    }

    const duckdbWhereClause = cubeFilterToDuckdbAST(
      queryFiltersWithInfo,
      baseAST
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    (baseAST.node as SelectNode).where_clause = duckdbWhereClause;
  }

  if (query.dimensions && query.dimensions?.length > 0) {
    (baseAST.node as SelectNode).group_expressions = cubeDimensionToGroupByAST(
      query.dimensions
    );
    const groupSets = [];
    /**
     * We only support one group set for now.
     */
    for (
      let i = 0;
      i < (baseAST.node as SelectNode).group_expressions.length;
      i++
    ) {
      groupSets.push(i);
    }
    (baseAST.node as SelectNode).group_sets = [groupSets];
  }

  console.info(JSON.stringify(baseAST, null, 2));

  return baseAST;
};
