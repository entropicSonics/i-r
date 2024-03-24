import {
  bigint,
  bigserial,
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  PgColumn,
  pgSchema,
  pgTable,
  PrimaryKey,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { vector } from "pgvector/drizzle-orm";

export const irSchema = pgSchema("ir");

export const authTable = pgTable("auth.users", {
  id: uuid("id").primaryKey(),
});

export const publicProfiles = irSchema.table("profile", {
  id: uuid("id").primaryKey().references(() => authTable.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
});

export const notes = irSchema.table("note", {
  id: uuid("id").primaryKey(),
  profileId: uuid("profile_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),

  // { dimensions: 1024 }
  contentEmbedding: vector("content_embedding"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
}, (table) => {
  return {
    profileId: index("note_profile_id_index").on(table.profileId),

    createdAt: index("note_created_at_index").on(table.createdAt),
    updatedAt: index("note_updated_at_index").on(table.updatedAt),
    deletedAt: index("note_deleted_at_index").on(table.deletedAt),
  };
});

export const tags = irSchema.table("tag", {
  id: uuid("id").primaryKey(),
  profileId: uuid("profile_id"),
  name: text("name").notNull(),
  hexColor: varchar("hex_color").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
}, (table) => {
  return {
    profileId: index("tag_profile_id_index").on(table.profileId),

    createdAt: index("tag_created_at_index").on(table.createdAt),
    updatedAt: index("tag_updated_at_index").on(table.updatedAt),
    deletedAt: index("tag_deleted_at_index").on(table.deletedAt),
  };
});

export const noteTags = irSchema.table("note_tag", {
  noteId: uuid("note_id").references(() => notes.id, {
    onDelete: "cascade",
  }),
  tagId: uuid("tag_id").references(() => tags.id, {
    onDelete: "cascade",
  }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.noteId, table.tagId] }),
  };
});
