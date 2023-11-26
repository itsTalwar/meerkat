import { DBM, FileManagerType, MemoryDBFileManager } from '@devrev/meerkat-dbm';
import log from 'loglevel';
import React, { useState } from 'react';
import { DBMContext } from '../hooks/dbm-context';
import { useClassicEffect } from '../hooks/use-classic-effect';
import { useAsyncDuckDB } from './use-async-duckdb';

export const RawDBMProvider = ({ children }: { children: JSX.Element }) => {
  const fileManagerRef = React.useRef<FileManagerType | null>(null);
  const [dbm, setdbm] = useState<DBM | null>(null);

  const dbState = useAsyncDuckDB();

  useClassicEffect(() => {
    if (!dbState) {
      return;
    }
    fileManagerRef.current = new MemoryDBFileManager({
      db: dbState,
      fetchTableFileBuffers: async (table) => {
        return [];
      },
    });
    const dbm = new DBM({
      db: dbState,
      fileManager: fileManagerRef.current,
      logger: log,
      onEvent: (event) => {
        log.info(event);
      },
    });
    /**
     * Making the queryWithTableNames simply run the queries without sequence which is the default behavior
     */
    dbm.queryWithTableNames = async (query, tableNames) => {
      return dbm.query(query);
    };
    setdbm(dbm);
  }, [dbState]);

  if (!dbm || !fileManagerRef.current) {
    return <div>Loading...</div>;
  }

  return (
    <DBMContext.Provider
      value={{
        dbm,
        fileManager: fileManagerRef.current,
      }}
    >
      {children}
    </DBMContext.Provider>
  );
};
