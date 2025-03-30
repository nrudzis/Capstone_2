\echo 'Delete and recreate swap db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS swap;
CREATE DATABASE swap;
\connect swap

\i swap-schema.sql
\i swap-seed.sql

\echo 'Delete and recreate swap_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE swap_test;
CREATE DATABASE swap_test;
\connect swap_test

\i swap-schema.sql
