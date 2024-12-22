CREATE TABLE  IF NOT EXISTS section(
    section_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
	venue_id BIGINT,
    section_name VARCHAR,
    section_capacity INTEGER,
	section_seating VARCHAR,
	section_width BIGINT DEFAULT 0,
    section_details JSONB
);

CREATE TABLE  IF NOT EXISTS ticket(
    ticket_id BIGSERIAL,
    event_id BIGINT NOT NULL,
    venue_id BIGINT,
    section_id BIGINT,
	seat_number VARCHAR,
    ticket_details JSONB,
    ticket_status VARCHAR,
    ticket_price DOUBLE PRECISION,
	ticket_section_seating VARCHAR,
    ticket_code VARCHAR,
    ticket_date_created TIMESTAMP,
    PRIMARY KEY (ticket_id, event_id, section_id),
    FOREIGN KEY (section_id) REFERENCES section(section_id)
) PARTITION BY HASH (event_id);

CREATE TABLE ticket_event_0 PARTITION OF ticket
    FOR VALUES WITH (MODULUS 8, REMAINDER 0)
    PARTITION BY HASH (section_id);

CREATE TABLE ticket_event_0_section_0 PARTITION OF ticket_event_0
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE ticket_event_0_section_1 PARTITION OF ticket_event_0
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE ticket_event_0_section_2 PARTITION OF ticket_event_0
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE ticket_event_0_section_3 PARTITION OF ticket_event_0
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);
CREATE TABLE ticket_event_0_section_4 PARTITION OF ticket_event_0
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE ticket_event_0_section_5 PARTITION OF ticket_event_0
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE ticket_event_0_section_6 PARTITION OF ticket_event_0
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE ticket_event_0_section_7 PARTITION OF ticket_event_0
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);

CREATE TABLE ticket_event_1 PARTITION OF ticket
    FOR VALUES WITH (MODULUS 8, REMAINDER 1)
    PARTITION BY HASH (section_id);

CREATE TABLE ticket_event_1_section_0 PARTITION OF ticket_event_1
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE ticket_event_1_section_1 PARTITION OF ticket_event_1
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE ticket_event_1_section_2 PARTITION OF ticket_event_1
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE ticket_event_1_section_3 PARTITION OF ticket_event_1
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);
CREATE TABLE ticket_event_1_section_4 PARTITION OF ticket_event_1
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE ticket_event_1_section_5 PARTITION OF ticket_event_1
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE ticket_event_1_section_6 PARTITION OF ticket_event_1
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE ticket_event_1_section_7 PARTITION OF ticket_event_1
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);

CREATE TABLE ticket_event_2 PARTITION OF ticket
    FOR VALUES WITH (MODULUS 8, REMAINDER 2)
    PARTITION BY HASH (section_id);

CREATE TABLE ticket_event_2_section_0 PARTITION OF ticket_event_2
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE ticket_event_2_section_1 PARTITION OF ticket_event_2
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE ticket_event_2_section_2 PARTITION OF ticket_event_2
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE ticket_event_2_section_3 PARTITION OF ticket_event_2
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);
CREATE TABLE ticket_event_2_section_4 PARTITION OF ticket_event_2
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE ticket_event_2_section_5 PARTITION OF ticket_event_2
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE ticket_event_2_section_6 PARTITION OF ticket_event_2
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE ticket_event_2_section_7 PARTITION OF ticket_event_2
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);

CREATE TABLE ticket_event_3 PARTITION OF ticket
    FOR VALUES WITH (MODULUS 8, REMAINDER 3)
    PARTITION BY HASH (section_id);

CREATE TABLE ticket_event_3_section_0 PARTITION OF ticket_event_3
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE ticket_event_3_section_1 PARTITION OF ticket_event_3
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE ticket_event_3_section_2 PARTITION OF ticket_event_3
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE ticket_event_3_section_3 PARTITION OF ticket_event_3
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);
CREATE TABLE ticket_event_3_section_4 PARTITION OF ticket_event_3
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE ticket_event_3_section_5 PARTITION OF ticket_event_3
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE ticket_event_3_section_6 PARTITION OF ticket_event_3
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE ticket_event_3_section_7 PARTITION OF ticket_event_3
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);

CREATE TABLE ticket_event_4 PARTITION OF ticket
    FOR VALUES WITH (MODULUS 8, REMAINDER 4)
    PARTITION BY HASH (section_id);

CREATE TABLE ticket_event_4_section_0 PARTITION OF ticket_event_4
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE ticket_event_4_section_1 PARTITION OF ticket_event_4
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE ticket_event_4_section_2 PARTITION OF ticket_event_4
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE ticket_event_4_section_3 PARTITION OF ticket_event_4
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);
CREATE TABLE ticket_event_4_section_4 PARTITION OF ticket_event_4
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE ticket_event_4_section_5 PARTITION OF ticket_event_4
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE ticket_event_4_section_6 PARTITION OF ticket_event_4
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE ticket_event_4_section_7 PARTITION OF ticket_event_4
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);

CREATE TABLE ticket_event_5 PARTITION OF ticket
    FOR VALUES WITH (MODULUS 8, REMAINDER 5)
    PARTITION BY HASH (section_id);

CREATE TABLE ticket_event_5_section_0 PARTITION OF ticket_event_5
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE ticket_event_5_section_1 PARTITION OF ticket_event_5
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE ticket_event_5_section_2 PARTITION OF ticket_event_5
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE ticket_event_5_section_3 PARTITION OF ticket_event_5
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);
CREATE TABLE ticket_event_5_section_4 PARTITION OF ticket_event_5
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE ticket_event_5_section_5 PARTITION OF ticket_event_5
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE ticket_event_5_section_6 PARTITION OF ticket_event_5
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE ticket_event_5_section_7 PARTITION OF ticket_event_5
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);

CREATE TABLE ticket_event_6 PARTITION OF ticket
    FOR VALUES WITH (MODULUS 8, REMAINDER 6)
    PARTITION BY HASH (section_id);

CREATE TABLE ticket_event_6_section_0 PARTITION OF ticket_event_6
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE ticket_event_6_section_1 PARTITION OF ticket_event_6
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE ticket_event_6_section_2 PARTITION OF ticket_event_6
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE ticket_event_6_section_3 PARTITION OF ticket_event_6
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);
CREATE TABLE ticket_event_6_section_4 PARTITION OF ticket_event_6
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE ticket_event_6_section_5 PARTITION OF ticket_event_6
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE ticket_event_6_section_6 PARTITION OF ticket_event_6
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE ticket_event_6_section_7 PARTITION OF ticket_event_6
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);

CREATE TABLE ticket_event_7 PARTITION OF ticket
    FOR VALUES WITH (MODULUS 8, REMAINDER 7)
    PARTITION BY HASH (section_id);

CREATE TABLE ticket_event_7_section_0 PARTITION OF ticket_event_7
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE ticket_event_7_section_1 PARTITION OF ticket_event_7
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE ticket_event_7_section_2 PARTITION OF ticket_event_7
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE ticket_event_7_section_3 PARTITION OF ticket_event_7
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);
CREATE TABLE ticket_event_7_section_4 PARTITION OF ticket_event_7
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE ticket_event_7_section_5 PARTITION OF ticket_event_7
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE ticket_event_7_section_6 PARTITION OF ticket_event_7
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE ticket_event_7_section_7 PARTITION OF ticket_event_7
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);

	
	
-- Composite index for the specific query pattern
CREATE INDEX idx_ticket_event_section ON ticket(event_id, section_id, ticket_status);

CREATE INDEX idx_ticket_event_section_seating on ticket(event_id, section_id, ticket_status, ticket_section_seating);
-- Index on section lookup
CREATE INDEX idx_section_event ON section(event_id);



ALTER TABLE ticket
ADD COLUMN ticket_code VARCHAR,
ADD COLUMN ticket_date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP;