CREATE TYPE "public"."language" AS ENUM('es', 'en', 'it');

DROP POLICY "Authenticated users can view courses with published locales" ON "public"."courses";

ALTER TABLE "public"."certificates"
ALTER COLUMN "language"
SET DATA TYPE language USING "language"::TEXT::language;

ALTER TABLE "public"."courses"
DROP COLUMN "draft_locales";

ALTER TABLE "public"."courses"
DROP COLUMN "published_locales";

ALTER TABLE "public"."courses"
ADD COLUMN "languages" language[] NOT NULL;

ALTER TABLE "public"."user_courses"
ALTER COLUMN "locale"
SET DATA TYPE language USING "locale"::TEXT::language;

DROP TYPE "public"."locale";
