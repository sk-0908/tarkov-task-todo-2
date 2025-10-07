-- FTS5テーブルの作成
CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
    docId UNINDEXED,
    kind UNINDEXED,
    language UNINDEXED,
    name,
    altNames,
    trader,
    map,
    content,
    tokenize='unicode61 remove_diacritics 2'
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_search_index_docId_kind ON search_index(docId, kind);
CREATE INDEX IF NOT EXISTS idx_search_index_language ON search_index(language);
CREATE INDEX IF NOT EXISTS idx_search_index_kind ON search_index(kind);

-- FTS5テーブルにトリガーを設定して同期
CREATE TRIGGER IF NOT EXISTS search_index_ai AFTER INSERT ON search_index BEGIN
    INSERT INTO search_fts(docId, kind, language, name, altNames, trader, map, content)
    VALUES (new.docId, new.kind, new.language, new.name, new.altNames, new.trader, new.map, new.content);
END;

CREATE TRIGGER IF NOT EXISTS search_index_ad AFTER DELETE ON search_index BEGIN
    DELETE FROM search_fts WHERE docId = old.docId AND kind = old.kind AND language = old.language;
END;

CREATE TRIGGER IF NOT EXISTS search_index_au AFTER UPDATE ON search_index BEGIN
    DELETE FROM search_fts WHERE docId = old.docId AND kind = old.kind AND language = old.language;
    INSERT INTO search_fts(docId, kind, language, name, altNames, trader, map, content)
    VALUES (new.docId, new.kind, new.language, new.name, new.altNames, new.trader, new.map, new.content);
END;
