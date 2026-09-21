import type { Pool } from "pg"

const schema = `
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY,
        owner_id UUID NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL CHECK (price >= 0),
        description TEXT NOT NULL
    );

    ALTER TABLE products ADD COLUMN IF NOT EXISTS owner_id UUID;

    CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        author_id UUID NOT NULL,
        content TEXT NOT NULL CHECK (char_length(content) BETWEEN 4 AND 1024),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS replies (
        id UUID PRIMARY KEY,
        comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        author_id UUID NOT NULL,
        content TEXT NOT NULL CHECK (char_length(content) BETWEEN 4 AND 1024),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        embedding halfvec(2048),
        embedding_model TEXT
    );

    ALTER TABLE replies ADD COLUMN IF NOT EXISTS embedding halfvec(2048);
    ALTER TABLE replies ADD COLUMN IF NOT EXISTS embedding_model TEXT;

    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM pg_attribute
            WHERE attrelid = 'replies'::regclass
                AND attname = 'embedding'
                AND format_type(atttypid, atttypmod) <> 'halfvec(2048)'
        ) THEN
            DROP INDEX IF EXISTS replies_embedding_idx;
            UPDATE replies SET embedding = NULL, embedding_model = NULL;
            ALTER TABLE replies
                ALTER COLUMN embedding TYPE halfvec(2048)
                USING embedding::halfvec(2048);
        END IF;
    END
    $$;

    CREATE INDEX IF NOT EXISTS comments_product_id_idx ON comments(product_id);
    CREATE INDEX IF NOT EXISTS replies_comment_id_idx ON replies(comment_id);
    CREATE INDEX IF NOT EXISTS replies_embedding_idx
        ON replies USING hnsw (embedding halfvec_cosine_ops)
        WHERE embedding IS NOT NULL;
`

const seed = `
    INSERT INTO products (id, owner_id, name, price, description) VALUES
        (
            '264a6a79-e6df-4da7-8c03-a8698a7272b1',
            '3b3f40bc-ce62-455a-bcea-8c71a6c43bec',
            'Wireless headphones',
            29999,
            'Bluetooth headphones with noise cancellation.'
        ),
        (
            'b92c5da6-8857-44f1-b69a-968292d3ef01',
            '9a59b51c-65c9-45f4-b45a-9f99d50c7065',
            'Mechanical keyboard',
            89999,
            'Compact keyboard with mechanical switches.'
        ),
        (
            'd5421329-0f66-4d88-a49f-d1f9110ae2ec',
            '7b48ead1-aaf0-435d-a25a-b85285e165c1',
            '27-inch monitor',
            349999,
            '144 Hz IPS monitor with QHD resolution.'
        )
    ON CONFLICT (id) DO UPDATE SET owner_id = EXCLUDED.owner_id;

    INSERT INTO comments (id, product_id, author_id, content, created_at) VALUES
        (
            '04ee2a61-c5d6-4fae-890a-44eae44379f8',
            '264a6a79-e6df-4da7-8c03-a8698a7272b1',
            '8e2732d0-1f5a-4e7c-a0b7-2bfa6b8bc7d0',
            'Excellent sound quality and very comfortable.',
            '2026-01-15T12:00:00.000Z'
        ),
        (
            '195164c0-b744-4df2-b37d-4886b393ae2e',
            'b92c5da6-8857-44f1-b69a-968292d3ef01',
            'b13ae3d1-dc67-4856-aafe-a95f7fe0f76e',
            'The switches feel great for typing.',
            '2026-01-16T12:00:00.000Z'
        ),
        (
            'b1347e74-a3e4-4e85-a54f-8d043eae03d1',
            '264a6a79-e6df-4da7-8c03-a8698a7272b1',
            '947b07ae-99d1-4675-a0d4-99dc146c34b8',
            'How long does the battery last with noise cancellation enabled?',
            '2026-01-17T12:00:00.000Z'
        ),
        (
            'e5c6f746-20fe-4531-b25e-2cf30db72ba2',
            '264a6a79-e6df-4da7-8c03-a8698a7272b1',
            '875eb2cc-b85d-48e6-af4f-4bac80d341f1',
            'Can I use them with a cable when the battery is empty?',
            '2026-01-18T12:00:00.000Z'
        ),
        (
            '467a8e6f-e3f4-4332-8d87-114aa0cb37c8',
            '264a6a79-e6df-4da7-8c03-a8698a7272b1',
            'f859a027-bc58-4d7f-a06c-0651da45e533',
            'What warranty does this product include?',
            '2026-01-19T12:00:00.000Z'
        )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO replies (id, comment_id, author_id, content, created_at) VALUES
        (
            '1e9588f7-aa95-41cf-98f5-09bc24093494',
            '04ee2a61-c5d6-4fae-890a-44eae44379f8',
            '3b3f40bc-ce62-455a-bcea-8c71a6c43bec',
            'Thanks for sharing your experience.',
            '2026-01-15T13:00:00.000Z'
        ),
        (
            'a1a9ea6d-8e55-47ad-92ef-d81358fd7f77',
            'b1347e74-a3e4-4e85-a54f-8d043eae03d1',
            '3b3f40bc-ce62-455a-bcea-8c71a6c43bec',
            'The battery lasts up to 30 hours with active noise cancellation enabled.',
            '2026-01-17T13:00:00.000Z'
        ),
        (
            '2687c385-82af-4da6-ad7f-78819974496f',
            'e5c6f746-20fe-4531-b25e-2cf30db72ba2',
            '3b3f40bc-ce62-455a-bcea-8c71a6c43bec',
            'Yes. The included 3.5 mm cable works even when the battery is empty.',
            '2026-01-18T13:00:00.000Z'
        ),
        (
            'e5d632b8-a60e-4dc4-b77b-5d4ef421f3ce',
            '467a8e6f-e3f4-4332-8d87-114aa0cb37c8',
            '3b3f40bc-ce62-455a-bcea-8c71a6c43bec',
            'The product includes a 12-month manufacturer warranty.',
            '2026-01-19T13:00:00.000Z'
        )
    ON CONFLICT (id) DO NOTHING;
`

const constraints = `
    ALTER TABLE products ALTER COLUMN owner_id SET NOT NULL;
`

async function initializeV1Database(database: Pool): Promise<void> {
    const client = await database.connect()

    try {
        await client.query("BEGIN")
        await client.query(schema)
        await client.query(seed)
        await client.query(constraints)
        await client.query("COMMIT")
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

export { initializeV1Database }
