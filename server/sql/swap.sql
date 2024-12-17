\echo 'Delete and recreate swap db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS swap;
CREATE DATABASE swap;
\connect swap

\i swap-schema.sql
\i swap-seed.sql
