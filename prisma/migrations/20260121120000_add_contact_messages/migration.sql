-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "is_spam" BOOLEAN NOT NULL DEFAULT false,
    "spam_score" INTEGER NOT NULL DEFAULT 0,
    "spam_reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ip_anonymized" TEXT,
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "referer" TEXT,
    "accept_language" TEXT,
    "geo_country" TEXT,
    "geo_region" TEXT,
    "geo_city" TEXT,
    "ai_suggested_reply" TEXT,
    "ai_model" TEXT,
    "ai_suggested_at" TIMESTAMP(3),
    "reply_subject" TEXT,
    "reply_body" TEXT,
    "replied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

-- CreateIndex
CREATE INDEX "contact_messages_is_read_idx" ON "contact_messages"("is_read");

-- CreateIndex
CREATE INDEX "contact_messages_is_spam_idx" ON "contact_messages"("is_spam");

-- CreateIndex
CREATE INDEX "contact_messages_email_idx" ON "contact_messages"("email");
