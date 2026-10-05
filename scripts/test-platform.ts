import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
const directory='packages/auth/src/__tests__';
const files=readdirSync(directory).filter(name=>name.endsWith('.test.ts')).map(name=>join(directory,name));
const result=spawnSync(process.execPath,['--import','tsx','--test','--test-concurrency=1',...files],{stdio:'inherit',env:{...process.env,DATABASE_URL:'file::memory:'}});
process.exitCode=result.status??1;
