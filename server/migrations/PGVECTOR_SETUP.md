# Настройка pgvector для векторного поиска

После выполнения основной миграции необходимо настроить тип `vector` для колонки `embedding` в таблице `KnowledgeEmbeddings`.

## Шаг 1: Изменение типа колонки

Выполните следующий SQL запрос в PostgreSQL:

```sql
-- Изменение типа колонки на vector
-- Размерность 384 соответствует модели all-MiniLM-L6-v2
ALTER TABLE "KnowledgeEmbeddings" 
ALTER COLUMN embedding TYPE vector(384) 
USING embedding::vector;
```

## Шаг 2: Создание индекса для быстрого поиска

```sql
-- Создание индекса для косинусного расстояния
CREATE INDEX ON "KnowledgeEmbeddings" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

Примечание: параметр `lists` должен быть примерно равен `rows / 1000` для оптимальной производительности.

## Шаг 3: Обновление сервиса для использования vector типа

После настройки типа vector в БД, обновите `server/services/ragService.js`:

Замените вычисление similarity в JavaScript на использование операторов pgvector:

```javascript
// Вместо вычисления в JavaScript используйте SQL:
const querySQL = `
    SELECT 
        kc.id,
        kc."documentId",
        kc.content,
        kc."chunkIndex",
        kd.title as "documentTitle",
        kd."documentType",
        kd."serviceId",
        1 - (ke.embedding <=> :queryEmbedding::vector) as similarity
    FROM "KnowledgeChunks" kc
    INNER JOIN "KnowledgeDocuments" kd ON kc."documentId" = kd.id
    INNER JOIN "KnowledgeEmbeddings" ke ON kc.id = ke."chunkId"
    WHERE ${whereClause} AND kd."isActive" = true
    ORDER BY ke.embedding <=> :queryEmbedding::vector
    LIMIT :topK
`;
```

И передавайте embedding как строку для преобразования в vector:

```javascript
const embeddingStr = '[' + queryEmbedding.join(',') + ']';
const results = await KnowledgeChunk.sequelize.query(querySQL, {
    replacements: { 
        queryEmbedding: embeddingStr,
        topK: topK,
        ...otherReplacements
    },
    type: Sequelize.QueryTypes.SELECT,
});
```

## Альтернатива: использование массива

Если не хотите использовать тип vector, текущая реализация с массивом и вычислением similarity в JavaScript также работает, но медленнее на больших объёмах данных.
