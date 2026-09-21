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
            'Auriculares inalámbricos',
            29999,
            'Auriculares Bluetooth con cancelación de ruido.'
        ),
        (
            'b92c5da6-8857-44f1-b69a-968292d3ef01',
            '9a59b51c-65c9-45f4-b45a-9f99d50c7065',
            'Teclado mecánico',
            89999,
            'Teclado compacto con interruptores mecánicos.'
        ),
        (
            'd5421329-0f66-4d88-a49f-d1f9110ae2ec',
            '7b48ead1-aaf0-435d-a25a-b85285e165c1',
            'Monitor de 27 pulgadas',
            349999,
            'Monitor IPS de 144 Hz con resolución QHD.'
        )
    ON CONFLICT (id) DO UPDATE SET
        owner_id = EXCLUDED.owner_id,
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        description = EXCLUDED.description;

    INSERT INTO comments (id, product_id, author_id, content, created_at) VALUES
        (
            '04ee2a61-c5d6-4fae-890a-44eae44379f8',
            '264a6a79-e6df-4da7-8c03-a8698a7272b1',
            '8e2732d0-1f5a-4e7c-a0b7-2bfa6b8bc7d0',
            '¿Son cómodos para usarlos durante varias horas?',
            '2026-01-15T12:00:00.000Z'
        ),
        (
            '195164c0-b744-4df2-b37d-4886b393ae2e',
            'b92c5da6-8857-44f1-b69a-968292d3ef01',
            'b13ae3d1-dc67-4856-aafe-a95f7fe0f76e',
            '¿Cómo se sienten los interruptores al escribir?',
            '2026-01-16T12:00:00.000Z'
        ),
        (
            'b1347e74-a3e4-4e85-a54f-8d043eae03d1',
            '264a6a79-e6df-4da7-8c03-a8698a7272b1',
            '947b07ae-99d1-4675-a0d4-99dc146c34b8',
            '¿Cuánto dura la batería con la cancelación de ruido activada?',
            '2026-01-17T12:00:00.000Z'
        ),
        (
            'e5c6f746-20fe-4531-b25e-2cf30db72ba2',
            '264a6a79-e6df-4da7-8c03-a8698a7272b1',
            '875eb2cc-b85d-48e6-af4f-4bac80d341f1',
            '¿Puedo usarlos con cable cuando la batería está agotada?',
            '2026-01-18T12:00:00.000Z'
        ),
        (
            '467a8e6f-e3f4-4332-8d87-114aa0cb37c8',
            '264a6a79-e6df-4da7-8c03-a8698a7272b1',
            'f859a027-bc58-4d7f-a06c-0651da45e533',
            '¿Qué garantía incluye este producto?',
            '2026-01-19T12:00:00.000Z'
        ),
        (
            '554e26aa-7ee7-4c65-8d39-7b238cf4c7cb',
            'b92c5da6-8857-44f1-b69a-968292d3ef01',
            'b0f0b49b-44d5-4e61-848b-01d53abff93a',
            '¿Qué tipo de interruptores incluye el teclado?',
            '2026-01-20T12:00:00.000Z'
        ),
        (
            '833cbdc9-4c32-44f2-9732-d5ca0f673a28',
            'b92c5da6-8857-44f1-b69a-968292d3ef01',
            '4d4646b9-8d42-4d5d-bb22-b59072b8124d',
            '¿El teclado tiene iluminación?',
            '2026-01-21T12:00:00.000Z'
        ),
        (
            '38120b46-55a6-42c9-bf74-7a5e5c3796b6',
            'd5421329-0f66-4d88-a49f-d1f9110ae2ec',
            '6c4ae4d9-f286-4bc5-93b8-8e0e4e1f6d87',
            '¿Qué resolución tiene el monitor?',
            '2026-01-22T12:00:00.000Z'
        ),
        (
            'c405441f-754f-4751-9e1a-7cbd1e649f1b',
            'd5421329-0f66-4d88-a49f-d1f9110ae2ec',
            'ea2b0054-f36b-40c5-a09f-3a309f9ddde0',
            '¿El monitor permite ajustar la altura?',
            '2026-01-23T12:00:00.000Z'
        ),
        (
            '6bd297d8-e343-48a7-9481-6bb080ba990b',
            'd5421329-0f66-4d88-a49f-d1f9110ae2ec',
            '1c5d15db-45aa-43b0-9c15-7ac28c92ffbb',
            '¿Qué conexiones incluye el monitor?',
            '2026-01-24T12:00:00.000Z'
        ),
        ('03e2eaf5-4ca1-49fd-8e75-feb0c6c9b4cb', '264a6a79-e6df-4da7-8c03-a8698a7272b1', '61e890dd-aed9-4e68-9ea6-dc8cc30f6c0e', '¿Los auriculares tienen micrófono para llamadas?', '2026-01-25T12:00:00.000Z'),
        ('e7d2d6ba-36a2-40c3-837b-491a477bb801', '264a6a79-e6df-4da7-8c03-a8698a7272b1', '0510dbf2-ec3b-4f96-8537-bda68b6bbdca', '¿Se pueden conectar a dos dispositivos a la vez?', '2026-01-26T12:00:00.000Z'),
        ('3691ac0f-2f93-40dc-974a-fc7027c62a81', '264a6a79-e6df-4da7-8c03-a8698a7272b1', '9ee09715-ba2f-4809-8bce-a0b79c1c11cf', '¿Cuánto tardan en cargarse por completo?', '2026-01-27T12:00:00.000Z'),
        ('acddfe81-a972-4cf8-b47c-0d2e5329481e', '264a6a79-e6df-4da7-8c03-a8698a7272b1', '7bdf506d-7604-4d83-b419-ba6665d17a0d', '¿Son resistentes al agua?', '2026-01-28T12:00:00.000Z'),
        ('8e6cedcc-77ee-415d-a6be-08edbdd41e81', 'b92c5da6-8857-44f1-b69a-968292d3ef01', '9a12cb92-6d36-488b-ab18-22591e252198', '¿Es compatible con computadoras Mac?', '2026-01-25T12:00:00.000Z'),
        ('4924f963-3c48-475e-ba63-532664fc9124', 'b92c5da6-8857-44f1-b69a-968292d3ef01', 'ec9b1ed9-3fd7-46c6-9e75-752958585284', '¿Incluye reposamuñecas?', '2026-01-26T12:00:00.000Z'),
        ('9dae5f23-6c99-4423-bf28-efcbcfed1c64', 'b92c5da6-8857-44f1-b69a-968292d3ef01', 'd53c993d-2078-41b8-9d87-0ae9ee5d9df4', '¿Se puede conectar por Bluetooth?', '2026-01-27T12:00:00.000Z'),
        ('e6e72f66-c266-45ac-895e-a15553304ec2', 'b92c5da6-8857-44f1-b69a-968292d3ef01', '6b7f1635-f0e1-47e8-b996-3116feeaeb7a', '¿Las teclas son reemplazables?', '2026-01-28T12:00:00.000Z'),
        ('1736b70b-3fb8-474d-871b-e52f3346e1fc', 'b92c5da6-8857-44f1-b69a-968292d3ef01', 'e7701dd2-3101-4a6c-bff4-77010b0c923f', '¿Qué distribución de teclado tiene?', '2026-01-29T12:00:00.000Z'),
        ('51c4f6a0-73cf-4eb3-a76f-942808795ee0', 'd5421329-0f66-4d88-a49f-d1f9110ae2ec', 'e3592480-a8ef-4269-8f5e-2e00620b6e72', '¿Es compatible con montaje VESA?', '2026-01-25T12:00:00.000Z'),
        ('01e02c6f-896f-4291-b378-125d4444d7d3', 'd5421329-0f66-4d88-a49f-d1f9110ae2ec', 'cd968eb7-011c-4ef8-9c5c-84f5b4d1366a', '¿Tiene parlantes integrados?', '2026-01-26T12:00:00.000Z'),
        ('9cf39879-2279-45a1-b1dd-4c428d2b0bce', 'd5421329-0f66-4d88-a49f-d1f9110ae2ec', '5ef9fa7d-27df-412e-b5d6-156c8eb37d04', '¿Cuál es el tiempo de respuesta de la pantalla?', '2026-01-27T12:00:00.000Z'),
        ('e2a77db7-a10d-44ff-bd26-117b5534cf2d', 'd5421329-0f66-4d88-a49f-d1f9110ae2ec', '764c3806-35c6-4dc4-872d-79d0ae5830f3', '¿Incluye cables para conectarlo?', '2026-01-28T12:00:00.000Z'),
        ('ea6ac09f-78a5-4223-9ab9-947a75e41cd5', 'd5421329-0f66-4d88-a49f-d1f9110ae2ec', '6caeaf23-264d-48c8-87f9-6e8d1a94b99e', '¿El panel reduce el cansancio visual?', '2026-01-29T12:00:00.000Z')
    ON CONFLICT (id) DO UPDATE SET
        product_id = EXCLUDED.product_id,
        author_id = EXCLUDED.author_id,
        content = EXCLUDED.content,
        created_at = EXCLUDED.created_at;

    INSERT INTO replies (id, comment_id, author_id, content, created_at) VALUES
        (
            '1e9588f7-aa95-41cf-98f5-09bc24093494',
            '04ee2a61-c5d6-4fae-890a-44eae44379f8',
            '3b3f40bc-ce62-455a-bcea-8c71a6c43bec',
            'Sí. Las almohadillas acolchadas están diseñadas para ofrecer comodidad durante sesiones prolongadas.',
            '2026-01-15T13:00:00.000Z'
        ),
        (
            'a1a9ea6d-8e55-47ad-92ef-d81358fd7f77',
            'b1347e74-a3e4-4e85-a54f-8d043eae03d1',
            '3b3f40bc-ce62-455a-bcea-8c71a6c43bec',
            'La batería dura hasta 30 horas con la cancelación activa de ruido habilitada.',
            '2026-01-17T13:00:00.000Z'
        ),
        (
            '2687c385-82af-4da6-ad7f-78819974496f',
            'e5c6f746-20fe-4531-b25e-2cf30db72ba2',
            '3b3f40bc-ce62-455a-bcea-8c71a6c43bec',
            'Sí. El cable de 3,5 mm incluido funciona incluso cuando la batería está agotada.',
            '2026-01-18T13:00:00.000Z'
        ),
        (
            'e5d632b8-a60e-4dc4-b77b-5d4ef421f3ce',
            '467a8e6f-e3f4-4332-8d87-114aa0cb37c8',
            '3b3f40bc-ce62-455a-bcea-8c71a6c43bec',
            'El producto incluye una garantía del fabricante de 12 meses.',
            '2026-01-19T13:00:00.000Z'
        ),
        (
            'f3bd1e5c-08ad-4a2a-a386-702679c1d53e',
            '195164c0-b744-4df2-b37d-4886b393ae2e',
            '9a59b51c-65c9-45f4-b45a-9f99d50c7065',
            'Los interruptores mecánicos ofrecen una respuesta táctil precisa al escribir.',
            '2026-01-16T13:00:00.000Z'
        ),
        (
            '2b0fe720-e971-4864-a03d-41116aa57d84',
            '554e26aa-7ee7-4c65-8d39-7b238cf4c7cb',
            '9a59b51c-65c9-45f4-b45a-9f99d50c7065',
            'Incluye interruptores mecánicos lineales, pensados para una pulsación suave y rápida.',
            '2026-01-20T13:00:00.000Z'
        ),
        (
            'e16bbf13-fb19-465d-ae47-7b59a4582c4e',
            '833cbdc9-4c32-44f2-9732-d5ca0f673a28',
            '9a59b51c-65c9-45f4-b45a-9f99d50c7065',
            'Sí. Cuenta con iluminación RGB configurable mediante combinaciones de teclas.',
            '2026-01-21T13:00:00.000Z'
        ),
        (
            '52ca9c18-0a8c-480e-a18e-d10f77c283bf',
            '38120b46-55a6-42c9-bf74-7a5e5c3796b6',
            '7b48ead1-aaf0-435d-a25a-b85285e165c1',
            'Tiene resolución QHD de 2560 por 1440 píxeles.',
            '2026-01-22T13:00:00.000Z'
        ),
        (
            '6db7decc-dbc6-4d6b-b310-96121a7c5895',
            'c405441f-754f-4751-9e1a-7cbd1e649f1b',
            '7b48ead1-aaf0-435d-a25a-b85285e165c1',
            'Sí. La base permite regular la altura, la inclinación y el giro.',
            '2026-01-23T13:00:00.000Z'
        ),
        (
            '9aeb7fa5-dcbc-4e5c-8f1f-0a4fc65b59f1',
            '6bd297d8-e343-48a7-9481-6bb080ba990b',
            '7b48ead1-aaf0-435d-a25a-b85285e165c1',
            'Incluye un puerto DisplayPort, dos puertos HDMI y una salida para auriculares.',
            '2026-01-24T13:00:00.000Z'
        ),
        ('6f335749-6a6d-4e15-ab2a-0386e1530e95', '03e2eaf5-4ca1-49fd-8e75-feb0c6c9b4cb', '3b3f40bc-ce62-455a-bcea-8c71a6c43bec', 'Sí. Tiene micrófonos integrados para llamadas y videollamadas.', '2026-01-25T13:00:00.000Z'),
        ('4274ccdd-0a70-47d1-a4cf-20228402621d', 'e7d2d6ba-36a2-40c3-837b-491a477bb801', '3b3f40bc-ce62-455a-bcea-8c71a6c43bec', 'Sí. Permiten alternar entre dos dispositivos vinculados.', '2026-01-26T13:00:00.000Z'),
        ('caa10cc9-103d-4cc7-992a-6d1d8e25a2a7', '3691ac0f-2f93-40dc-974a-fc7027c62a81', '3b3f40bc-ce62-455a-bcea-8c71a6c43bec', 'La carga completa demora aproximadamente dos horas mediante USB-C.', '2026-01-27T13:00:00.000Z'),
        ('f9f28f94-b3ae-4e36-825d-0cafd03c6eb5', 'acddfe81-a972-4cf8-b47c-0d2e5329481e', '3b3f40bc-ce62-455a-bcea-8c71a6c43bec', 'Cuentan con protección contra salpicaduras para uso cotidiano.', '2026-01-28T13:00:00.000Z'),
        ('7192cf95-82a5-41fe-b537-87f5dcf8cb21', '8e6cedcc-77ee-415d-a6be-08edbdd41e81', '9a59b51c-65c9-45f4-b45a-9f99d50c7065', 'Sí. Es compatible con macOS y Windows mediante conexión USB.', '2026-01-25T13:00:00.000Z'),
        ('f613b2e5-2d5e-42f4-9903-080c2ae8527e', '4924f963-3c48-475e-ba63-532664fc9124', '9a59b51c-65c9-45f4-b45a-9f99d50c7065', 'No incluye reposamuñecas, pero es compatible con accesorios estándar.', '2026-01-26T13:00:00.000Z'),
        ('ea9f6da4-b4df-4f8c-9f61-4d2d7fea7dd8', '9dae5f23-6c99-4423-bf28-efcbcfed1c64', '9a59b51c-65c9-45f4-b45a-9f99d50c7065', 'No. Este modelo se conecta únicamente por cable USB-C extraíble.', '2026-01-27T13:00:00.000Z'),
        ('c044651b-b6fb-447b-a6a5-b10ff7f033e9', 'e6e72f66-c266-45ac-895e-a15553304ec2', '9a59b51c-65c9-45f4-b45a-9f99d50c7065', 'Sí. Las teclas usan un diseño estándar que permite reemplazarlas.', '2026-01-28T13:00:00.000Z'),
        ('2b052668-7b56-4a34-87e5-56d3fe1491a5', '1736b70b-3fb8-474d-871b-e52f3346e1fc', '9a59b51c-65c9-45f4-b45a-9f99d50c7065', 'Tiene distribución en español latinoamericano.', '2026-01-29T13:00:00.000Z'),
        ('339b3f0d-b612-4a50-8819-0c93cda4b60f', '51c4f6a0-73cf-4eb3-a76f-942808795ee0', '7b48ead1-aaf0-435d-a25a-b85285e165c1', 'Sí. Es compatible con soportes VESA de 100 por 100 milímetros.', '2026-01-25T13:00:00.000Z'),
        ('9b14d607-1ee6-45d8-aeed-2041681c18df', '01e02c6f-896f-4291-b378-125d4444d7d3', '7b48ead1-aaf0-435d-a25a-b85285e165c1', 'No tiene parlantes integrados.', '2026-01-26T13:00:00.000Z'),
        ('3ed301de-336e-4ba9-8bc4-3b0597b62284', '9cf39879-2279-45a1-b1dd-4c428d2b0bce', '7b48ead1-aaf0-435d-a25a-b85285e165c1', 'El tiempo de respuesta es de 1 milisegundo en modo rápido.', '2026-01-27T13:00:00.000Z'),
        ('c7949783-8172-43cd-a8cd-a1ae9334b3f8', 'e2a77db7-a10d-44ff-bd26-117b5534cf2d', '7b48ead1-aaf0-435d-a25a-b85285e165c1', 'Incluye cables HDMI y DisplayPort para conectarlo.', '2026-01-28T13:00:00.000Z'),
        ('0a93278e-1f4f-4753-819c-d4d1cc318a92', 'ea6ac09f-78a5-4223-9ab9-947a75e41cd5', '7b48ead1-aaf0-435d-a25a-b85285e165c1', 'Sí. Incluye tecnología de reducción de luz azul y sin parpadeos.', '2026-01-29T13:00:00.000Z')
    ON CONFLICT (id) DO UPDATE SET
        comment_id = EXCLUDED.comment_id,
        author_id = EXCLUDED.author_id,
        content = EXCLUDED.content,
        created_at = EXCLUDED.created_at,
        embedding = NULL,
        embedding_model = NULL;
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
