def generate_partition_sql(num_events, num_sections):
    # Base table creation
    sql = """CREATE TABLE ticket (
    ticket_id BIGSERIAL,
    event_id BIGINT NOT NULL,
    venue_id BIGINT,
    section_id BIGINT,
    seat_number VARCHAR,
    ticket_details JSONB,
    ticket_status VARCHAR,
    ticket_price DOUBLE PRECISION,
    ticket_section_seating VARCHAR,
    PRIMARY KEY (ticket_id, event_id),
    FOREIGN KEY (section_id) REFERENCES section(section_id)
) PARTITION BY HASH (event_id);\n\n"""

    # Generate event partitions and their section subpartitions
    for i in range(num_events):
        # Create event partition
        sql += f"""CREATE TABLE ticket_event_{i} PARTITION OF ticket 
    FOR VALUES WITH (MODULUS {num_events}, REMAINDER {i}) 
    PARTITION BY HASH (section_id);\n\n"""
        
        # Create section subpartitions
        for j in range(num_sections):
            sql += f"""CREATE TABLE ticket_event_{i}_section_{j} PARTITION OF ticket_event_{i} 
    FOR VALUES WITH (MODULUS {num_sections}, REMAINDER {j});\n"""
        sql += "\n"
    
    return sql

# Example usage:
print(generate_partition_sql(8, 8))

