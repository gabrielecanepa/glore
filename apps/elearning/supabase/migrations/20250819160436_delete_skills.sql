CREATE TYPE "public"."course_type" AS ENUM('intro', 'skill');

DROP TRIGGER if EXISTS "set_updated_at" ON "public"."skills";

DROP POLICY "Authenticated users can view skills" ON "public"."skills";

REVOKE delete ON TABLE "public"."skills"
FROM
  "anon";

REVOKE insert ON TABLE "public"."skills"
FROM
  "anon";

REVOKE REFERENCES ON TABLE "public"."skills"
FROM
  "anon";

REVOKE
SELECT
  ON TABLE "public"."skills"
FROM
  "anon";

REVOKE trigger ON TABLE "public"."skills"
FROM
  "anon";

REVOKE
TRUNCATE ON TABLE "public"."skills"
FROM
  "anon";

REVOKE
UPDATE ON TABLE "public"."skills"
FROM
  "anon";

REVOKE delete ON TABLE "public"."skills"
FROM
  "authenticated";

REVOKE insert ON TABLE "public"."skills"
FROM
  "authenticated";

REVOKE REFERENCES ON TABLE "public"."skills"
FROM
  "authenticated";

REVOKE
SELECT
  ON TABLE "public"."skills"
FROM
  "authenticated";

REVOKE trigger ON TABLE "public"."skills"
FROM
  "authenticated";

REVOKE
TRUNCATE ON TABLE "public"."skills"
FROM
  "authenticated";

REVOKE
UPDATE ON TABLE "public"."skills"
FROM
  "authenticated";

REVOKE delete ON TABLE "public"."skills"
FROM
  "service_role";

REVOKE insert ON TABLE "public"."skills"
FROM
  "service_role";

REVOKE REFERENCES ON TABLE "public"."skills"
FROM
  "service_role";

REVOKE
SELECT
  ON TABLE "public"."skills"
FROM
  "service_role";

REVOKE trigger ON TABLE "public"."skills"
FROM
  "service_role";

REVOKE
TRUNCATE ON TABLE "public"."skills"
FROM
  "service_role";

REVOKE
UPDATE ON TABLE "public"."skills"
FROM
  "service_role";

ALTER TABLE "public"."assessments"
DROP CONSTRAINT "assessments_skill_id_fkey";

ALTER TABLE "public"."assessments"
DROP CONSTRAINT "skill_assessments_skill_id_key";

ALTER TABLE "public"."certificate_skills"
DROP CONSTRAINT "certificate_skills_skill_id_fkey";

ALTER TABLE "public"."courses"
DROP CONSTRAINT "courses_skill_id_fkey";

ALTER TABLE "public"."user_assessments"
DROP CONSTRAINT "user_assessments_skill_id_fkey";

ALTER TABLE "public"."skills"
DROP CONSTRAINT "skills_id_key";

ALTER TABLE "public"."skills"
DROP CONSTRAINT "skills_name_key";

ALTER TABLE "public"."skills"
DROP CONSTRAINT "skills_skill_group_id_fkey";

ALTER TABLE "public"."skills"
DROP CONSTRAINT "skills_pkey";

DROP TABLE "public"."skills";

ALTER TABLE "public"."assessments"
DROP COLUMN "skill_id";

ALTER TABLE "public"."certificate_skills"
DROP COLUMN "skill_id";

ALTER TABLE "public"."certificate_skills"
ADD COLUMN "course_id" BIGINT NOT NULL;

ALTER TABLE "public"."courses"
DROP COLUMN "skill_id";

ALTER TABLE "public"."courses"
ADD COLUMN "skill_group_id" BIGINT;

ALTER TABLE "public"."user_assessments"
DROP COLUMN "skill_id";

ALTER TABLE "public"."certificate_skills"
ADD CONSTRAINT "certificate_skills_course_id_fkey" FOREIGN key (course_id) REFERENCES courses (id) ON UPDATE CASCADE ON DELETE SET NULL NOT valid;

ALTER TABLE "public"."certificate_skills" validate CONSTRAINT "certificate_skills_course_id_fkey";

ALTER TABLE "public"."courses"
ADD CONSTRAINT "courses_skill_group_id_fkey" FOREIGN key (skill_group_id) REFERENCES skill_groups (id) ON UPDATE CASCADE ON DELETE SET NULL NOT valid;

ALTER TABLE "public"."courses" validate CONSTRAINT "courses_skill_group_id_fkey";

ALTER TABLE "public"."courses"
ADD COLUMN "type" course_type DEFAULT 'skill'::course_type;
