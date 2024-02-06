import { MEERKAT_OUTPUT_DELIMITER } from "./constants";

export const meerkatPlaceholderReplacer = (sql: string, tableName: string) => {
    const tableNameEncapsulationRegEx =/\{MEERKAT\}\./g;
    return sql.replace(tableNameEncapsulationRegEx, tableName + MEERKAT_OUTPUT_DELIMITER )
}
