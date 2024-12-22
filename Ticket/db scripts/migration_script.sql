-- Disable triggers if any exist (optional)
ALTER TABLE ticket DISABLE TRIGGER ALL;

--Migration Script
ALTER TABLE ticket RENAME TO ticket_old;


CREATE TABLE ticket (
    ticket_id BIGSERIAL,
    event_id BIGINT NOT NULL,
    venue_id BIGINT,
    ticket_details JSONB,
    ticket_status VARCHAR,
    ticket_price DOUBLE PRECISION,
    PRIMARY KEY (ticket_id, event_id)
) PARTITION BY HASH (event_id);

/* TO preserve attributes and indexes we can use below command:
CREATE TABLE ticket (
    LIKE ticket_old INCLUDING ALL
) PARTITION BY HASH (event_id);
*/

-- Create the partitions
CREATE TABLE ticket_partition_0 PARTITION OF ticket 
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE ticket_partition_1 PARTITION OF ticket 
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE ticket_partition_2 PARTITION OF ticket 
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE ticket_partition_3 PARTITION OF ticket 
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);
	CREATE TABLE ticket_partition_4 PARTITION OF ticket 
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE ticket_partition_5 PARTITION OF ticket 
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE ticket_partition_6 PARTITION OF ticket 
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE ticket_partition_7 PARTITION OF ticket 
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);
	
	
-- Insert data from old table to new partitioned table
INSERT INTO ticket (
    ticket_id,
    event_id,
    venue_id,
    ticket_details,
    ticket_status,
    ticket_price
)
SELECT 
    ticket_id,
    event_id,
    venue_id,
    ticket_details,
    ticket_status,
    ticket_price
FROM ticket_old;


-- Reset the sequence to continue from the max ticket_id
SELECT setval(
    pg_get_serial_sequence('ticket', 'ticket_id'),
    (SELECT MAX(ticket_id) FROM ticket_old)
);

-- Re-enable triggers if disabled
ALTER TABLE ticket ENABLE TRIGGER ALL;


/*to insert data from old table to new partitioned table using parallel execution and batch processing, use below code

INSERT INTO ticket
SELECT *
FROM ticket_old
WHERE ticket_id BETWEEN X AND Y
ORDER BY event_id;

*/

/* To see partition allocation between the tables, use this command

SELECT tableoid::regclass, count(*) 
FROM ticket 
GROUP BY tableoid;

*/
