-- TRIX no longer writes execution logs. Apply manually to drop the orphaned table (this deletes its rows).
DROP TABLE IF EXISTS agent_execution_logs;
