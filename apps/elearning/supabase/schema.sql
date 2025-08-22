SET
  statement_timeout = 0;

SET
  lock_timeout = 0;

SET
  idle_in_transaction_session_timeout = 0;

SET
  client_encoding = 'UTF8';

SET
  standard_conforming_strings = ON;

SELECT
  pg_catalog.set_config ('search_path', '', FALSE);

SET
  check_function_bodies = FALSE;

SET
  xmloption = content;

SET
  client_min_messages = warning;

SET
  row_security = off;

CREATE SCHEMA if NOT EXISTS "auth";

ALTER SCHEMA "auth" owner TO "supabase_admin";

CREATE SCHEMA if NOT EXISTS "public";

ALTER SCHEMA "public" owner TO "pg_database_owner";

comment ON schema "public" IS 'standard public schema';

CREATE TYPE "auth"."aal_level" AS ENUM('aal1', 'aal2', 'aal3');

ALTER TYPE "auth"."aal_level" owner TO "supabase_auth_admin";

CREATE TYPE "auth"."code_challenge_method" AS ENUM('s256', 'plain');

ALTER TYPE "auth"."code_challenge_method" owner TO "supabase_auth_admin";

CREATE TYPE "auth"."factor_status" AS ENUM('unverified', 'verified');

ALTER TYPE "auth"."factor_status" owner TO "supabase_auth_admin";

CREATE TYPE "auth"."factor_type" AS ENUM('totp', 'webauthn', 'phone');

ALTER TYPE "auth"."factor_type" owner TO "supabase_auth_admin";

CREATE TYPE "auth"."one_time_token_type" AS ENUM(
  'confirmation_token',
  'reauthentication_token',
  'recovery_token',
  'email_change_token_new',
  'email_change_token_current',
  'phone_change_token'
);

ALTER TYPE "auth"."one_time_token_type" owner TO "supabase_auth_admin";

CREATE TYPE "public"."course_type" AS ENUM('intro', 'skill');

ALTER TYPE "public"."course_type" owner TO "postgres";

CREATE TYPE "public"."language" AS ENUM('es', 'en', 'it');

ALTER TYPE "public"."language" owner TO "postgres";

CREATE TYPE "public"."role" AS ENUM('representative', 'tutor', 'volunteer', 'learner');

ALTER TYPE "public"."role" owner TO "postgres";

CREATE TYPE "public"."sex" AS ENUM('female', 'male', 'non-binary', 'unspecified');

ALTER TYPE "public"."sex" owner TO "postgres";

comment ON type "public"."sex" IS 'Sex of an user';

CREATE OR REPLACE FUNCTION "auth"."email" () returns "text" language "sql" stable AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;

ALTER FUNCTION "auth"."email" () owner TO "supabase_auth_admin";

comment ON function "auth"."email" () IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';

CREATE OR REPLACE FUNCTION "auth"."jwt" () returns "jsonb" language "sql" stable AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;

ALTER FUNCTION "auth"."jwt" () owner TO "supabase_auth_admin";

CREATE OR REPLACE FUNCTION "auth"."role" () returns "text" language "sql" stable AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;

ALTER FUNCTION "auth"."role" () owner TO "supabase_auth_admin";

comment ON function "auth"."role" () IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';

CREATE OR REPLACE FUNCTION "auth"."uid" () returns "uuid" language "sql" stable AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

ALTER FUNCTION "auth"."uid" () owner TO "supabase_auth_admin";

comment ON function "auth"."uid" () IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';

CREATE OR REPLACE FUNCTION "public"."insert_public_user" () returns "trigger" language "plpgsql" security definer
SET
  "search_path" TO '' AS $$
begin
  insert into public.users (
    id,
    email,
    phone,
    first_name,
    last_name,
    is_admin,
    is_editor
  )
  values (
    new.id,
    new.email,
    new.phone,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    COALESCE(new.raw_user_meta_data ->> 'is_admin', 'false')::boolean,
    COALESCE(new.raw_user_meta_data ->> 'is_editor', 'false')::boolean
  );
  return new;
end;
$$;

ALTER FUNCTION "public"."insert_public_user" () owner TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_skill_id" () returns "trigger" language "plpgsql"
SET
  "search_path" TO '' AS $$
BEGIN
    SELECT skill_id INTO new.skill_id
    FROM public.assessments
    WHERE id = new.assessment_id;
    return new;
END;
$$;

ALTER FUNCTION "public"."set_skill_id" () owner TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_username" () returns "trigger" language "plpgsql"
SET
  "search_path" TO '' AS $$
BEGIN
    NEW.username := regexp_replace(lower(regexp_replace(NEW.first_name, ' ', '.', 'g') || '.' || regexp_replace(NEW.last_name, ' ', '.', 'g')), '[^a-z0-9.]+', '', 'g');
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."set_username" () owner TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_public_user" () returns "trigger" language "plpgsql"
SET
  "search_path" TO '' AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE public.users
        SET email = NEW.email
        WHERE id = OLD.id;
    END IF;
    IF NEW.phone IS DISTINCT FROM OLD.phone THEN
        UPDATE public.users
        SET phone = NEW.phone
        WHERE id = OLD.id;
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_public_user" () owner TO "postgres";

SET
  default_tablespace = '';

SET
  default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "auth"."audit_log_entries" (
  "instance_id" "uuid",
  "id" "uuid" NOT NULL,
  "payload" JSON,
  "created_at" TIMESTAMP WITH TIME ZONE,
  "ip_address" CHARACTER VARYING(64) DEFAULT ''::CHARACTER VARYING NOT NULL
);

ALTER TABLE "auth"."audit_log_entries" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."audit_log_entries" IS 'Auth: Audit trail for user actions.';

CREATE TABLE IF NOT EXISTS "auth"."flow_state" (
  "id" "uuid" NOT NULL,
  "user_id" "uuid",
  "auth_code" "text" NOT NULL,
  "code_challenge_method" "auth"."code_challenge_method" NOT NULL,
  "code_challenge" "text" NOT NULL,
  "provider_type" "text" NOT NULL,
  "provider_access_token" "text",
  "provider_refresh_token" "text",
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  "authentication_method" "text" NOT NULL,
  "auth_code_issued_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "auth"."flow_state" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."flow_state" IS 'stores metadata for pkce logins';

CREATE TABLE IF NOT EXISTS "auth"."identities" (
  "provider_id" "text" NOT NULL,
  "user_id" "uuid" NOT NULL,
  "identity_data" "jsonb" NOT NULL,
  "provider" "text" NOT NULL,
  "last_sign_in_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  "email" "text" generated always AS ("lower" (("identity_data" ->> 'email'::"text"))) stored,
  "id" "uuid" DEFAULT "gen_random_uuid" () NOT NULL
);

ALTER TABLE "auth"."identities" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."identities" IS 'Auth: Stores identities associated to a user.';

comment ON COLUMN "auth"."identities"."email" IS 'Auth: Email is a generated column that references the optional email property in the identity_data';

CREATE TABLE IF NOT EXISTS "auth"."instances" (
  "id" "uuid" NOT NULL,
  "uuid" "uuid",
  "raw_base_config" "text",
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "auth"."instances" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."instances" IS 'Auth: Manages users across multiple sites.';

CREATE TABLE IF NOT EXISTS "auth"."mfa_amr_claims" (
  "session_id" "uuid" NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "authentication_method" "text" NOT NULL,
  "id" "uuid" NOT NULL
);

ALTER TABLE "auth"."mfa_amr_claims" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."mfa_amr_claims" IS 'auth: stores authenticator method reference claims for multi factor authentication';

CREATE TABLE IF NOT EXISTS "auth"."mfa_challenges" (
  "id" "uuid" NOT NULL,
  "factor_id" "uuid" NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "verified_at" TIMESTAMP WITH TIME ZONE,
  "ip_address" "inet" NOT NULL,
  "otp_code" "text",
  "web_authn_session_data" "jsonb"
);

ALTER TABLE "auth"."mfa_challenges" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."mfa_challenges" IS 'auth: stores metadata about challenge requests made';

CREATE TABLE IF NOT EXISTS "auth"."mfa_factors" (
  "id" "uuid" NOT NULL,
  "user_id" "uuid" NOT NULL,
  "friendly_name" "text",
  "factor_type" "auth"."factor_type" NOT NULL,
  "status" "auth"."factor_status" NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "secret" "text",
  "phone" "text",
  "last_challenged_at" TIMESTAMP WITH TIME ZONE,
  "web_authn_credential" "jsonb",
  "web_authn_aaguid" "uuid"
);

ALTER TABLE "auth"."mfa_factors" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."mfa_factors" IS 'auth: stores metadata about factors';

CREATE TABLE IF NOT EXISTS "auth"."one_time_tokens" (
  "id" "uuid" NOT NULL,
  "user_id" "uuid" NOT NULL,
  "token_type" "auth"."one_time_token_type" NOT NULL,
  "token_hash" "text" NOT NULL,
  "relates_to" "text" NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT "now" () NOT NULL,
  CONSTRAINT "one_time_tokens_token_hash_check" CHECK (("char_length" ("token_hash") > 0))
);

ALTER TABLE "auth"."one_time_tokens" owner TO "supabase_auth_admin";

CREATE TABLE IF NOT EXISTS "auth"."refresh_tokens" (
  "instance_id" "uuid",
  "id" BIGINT NOT NULL,
  "token" CHARACTER VARYING(255),
  "user_id" CHARACTER VARYING(255),
  "revoked" BOOLEAN,
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  "parent" CHARACTER VARYING(255),
  "session_id" "uuid"
);

ALTER TABLE "auth"."refresh_tokens" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."refresh_tokens" IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';

CREATE SEQUENCE if NOT EXISTS "auth"."refresh_tokens_id_seq" start
WITH
  1 increment by 1 no minvalue no maxvalue cache 1;

ALTER SEQUENCE "auth"."refresh_tokens_id_seq" owner TO "supabase_auth_admin";

ALTER SEQUENCE "auth"."refresh_tokens_id_seq" owned by "auth"."refresh_tokens"."id";

CREATE TABLE IF NOT EXISTS "auth"."saml_providers" (
  "id" "uuid" NOT NULL,
  "sso_provider_id" "uuid" NOT NULL,
  "entity_id" "text" NOT NULL,
  "metadata_xml" "text" NOT NULL,
  "metadata_url" "text",
  "attribute_mapping" "jsonb",
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  "name_id_format" "text",
  CONSTRAINT "entity_id not empty" CHECK (("char_length" ("entity_id") > 0)),
  CONSTRAINT "metadata_url not empty" CHECK (
    (
      ("metadata_url" = NULL::"text") OR
      ("char_length" ("metadata_url") > 0)
    )
  ),
  CONSTRAINT "metadata_xml not empty" CHECK (("char_length" ("metadata_xml") > 0))
);

ALTER TABLE "auth"."saml_providers" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."saml_providers" IS 'Auth: Manages SAML Identity Provider connections.';

CREATE TABLE IF NOT EXISTS "auth"."saml_relay_states" (
  "id" "uuid" NOT NULL,
  "sso_provider_id" "uuid" NOT NULL,
  "request_id" "text" NOT NULL,
  "for_email" "text",
  "redirect_to" "text",
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  "flow_state_id" "uuid",
  CONSTRAINT "request_id not empty" CHECK (("char_length" ("request_id") > 0))
);

ALTER TABLE "auth"."saml_relay_states" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."saml_relay_states" IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';

CREATE TABLE IF NOT EXISTS "auth"."schema_migrations" ("version" CHARACTER VARYING(255) NOT NULL);

ALTER TABLE "auth"."schema_migrations" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."schema_migrations" IS 'Auth: Manages updates to the auth system.';

CREATE TABLE IF NOT EXISTS "auth"."sessions" (
  "id" "uuid" NOT NULL,
  "user_id" "uuid" NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  "factor_id" "uuid",
  "aal" "auth"."aal_level",
  "not_after" TIMESTAMP WITH TIME ZONE,
  "refreshed_at" TIMESTAMP WITHOUT TIME ZONE,
  "user_agent" "text",
  "ip" "inet",
  "tag" "text"
);

ALTER TABLE "auth"."sessions" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."sessions" IS 'Auth: Stores session data associated to a user.';

comment ON COLUMN "auth"."sessions"."not_after" IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';

CREATE TABLE IF NOT EXISTS "auth"."sso_domains" (
  "id" "uuid" NOT NULL,
  "sso_provider_id" "uuid" NOT NULL,
  "domain" "text" NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "domain not empty" CHECK (("char_length" ("domain") > 0))
);

ALTER TABLE "auth"."sso_domains" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."sso_domains" IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';

CREATE TABLE IF NOT EXISTS "auth"."sso_providers" (
  "id" "uuid" NOT NULL,
  "resource_id" "text",
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  "disabled" BOOLEAN,
  CONSTRAINT "resource_id not empty" CHECK (
    (
      ("resource_id" = NULL::"text") OR
      ("char_length" ("resource_id") > 0)
    )
  )
);

ALTER TABLE "auth"."sso_providers" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."sso_providers" IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';

comment ON COLUMN "auth"."sso_providers"."resource_id" IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';

CREATE TABLE IF NOT EXISTS "auth"."users" (
  "instance_id" "uuid",
  "id" "uuid" NOT NULL,
  "aud" CHARACTER VARYING(255),
  "role" CHARACTER VARYING(255),
  "email" CHARACTER VARYING(255),
  "encrypted_password" CHARACTER VARYING(255),
  "email_confirmed_at" TIMESTAMP WITH TIME ZONE,
  "invited_at" TIMESTAMP WITH TIME ZONE,
  "confirmation_token" CHARACTER VARYING(255),
  "confirmation_sent_at" TIMESTAMP WITH TIME ZONE,
  "recovery_token" CHARACTER VARYING(255),
  "recovery_sent_at" TIMESTAMP WITH TIME ZONE,
  "email_change_token_new" CHARACTER VARYING(255),
  "email_change" CHARACTER VARYING(255),
  "email_change_sent_at" TIMESTAMP WITH TIME ZONE,
  "last_sign_in_at" TIMESTAMP WITH TIME ZONE,
  "raw_app_meta_data" "jsonb",
  "raw_user_meta_data" "jsonb",
  "is_super_admin" BOOLEAN,
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  "phone" "text" DEFAULT NULL::CHARACTER VARYING,
  "phone_confirmed_at" TIMESTAMP WITH TIME ZONE,
  "phone_change" "text" DEFAULT ''::CHARACTER VARYING,
  "phone_change_token" CHARACTER VARYING(255) DEFAULT ''::CHARACTER VARYING,
  "phone_change_sent_at" TIMESTAMP WITH TIME ZONE,
  "confirmed_at" TIMESTAMP WITH TIME ZONE generated always AS (LEAST("email_confirmed_at", "phone_confirmed_at")) stored,
  "email_change_token_current" CHARACTER VARYING(255) DEFAULT ''::CHARACTER VARYING,
  "email_change_confirm_status" SMALLINT DEFAULT 0,
  "banned_until" TIMESTAMP WITH TIME ZONE,
  "reauthentication_token" CHARACTER VARYING(255) DEFAULT ''::CHARACTER VARYING,
  "reauthentication_sent_at" TIMESTAMP WITH TIME ZONE,
  "is_sso_user" BOOLEAN DEFAULT FALSE NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "is_anonymous" BOOLEAN DEFAULT FALSE NOT NULL,
  CONSTRAINT "users_email_change_confirm_status_check" CHECK (
    (
      ("email_change_confirm_status" >= 0) AND
      ("email_change_confirm_status" <= 2)
    )
  )
);

ALTER TABLE "auth"."users" owner TO "supabase_auth_admin";

comment ON TABLE "auth"."users" IS 'Auth: Stores user login data within a secure schema.';

comment ON COLUMN "auth"."users"."is_sso_user" IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';

CREATE TABLE IF NOT EXISTS "public"."assessments" (
  "id" BIGINT NOT NULL,
  "lesson_id" BIGINT NOT NULL,
  "description" "jsonb",
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."assessments" owner TO "postgres";

comment ON TABLE "public"."assessments" IS 'Self-assessments of a soft skill';

CREATE TABLE IF NOT EXISTS "public"."evaluations" (
  "id" BIGINT NOT NULL,
  "lesson_id" BIGINT NOT NULL,
  "description" "jsonb" NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."evaluations" owner TO "postgres";

comment ON TABLE "public"."evaluations" IS 'Generic evaluations unrelated to a skill';

ALTER TABLE "public"."evaluations"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."assessments_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."certificate_skills" (
  "id" BIGINT NOT NULL,
  "certificate_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "course_id" BIGINT NOT NULL
);

ALTER TABLE "public"."certificate_skills" owner TO "postgres";

comment ON TABLE "public"."certificate_skills" IS 'Relation between a certificate and the related skills';

ALTER TABLE "public"."certificate_skills"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."certificate_skills_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."certificates" (
  "id" BIGINT NOT NULL,
  "user_id" "uuid" NOT NULL,
  "reviewer_id" "uuid",
  "organization_id" BIGINT NOT NULL,
  "language" "public"."language" NOT NULL,
  "activity_start_date" "date" NOT NULL,
  "activity_end_date" "date" NOT NULL,
  "activity_duration" SMALLINT NOT NULL,
  "activity_location" "text" NOT NULL,
  "activity_description" "text" NOT NULL,
  "organization_rating" SMALLINT NOT NULL,
  "reviewer_comment" "text",
  "document_url" "text",
  "issued_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "handle" "text" NOT NULL
);

ALTER TABLE "public"."certificates" owner TO "postgres";

comment ON TABLE "public"."certificates" IS 'User certificates';

ALTER TABLE "public"."certificates"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."certificates_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."user_answers" (
  "id" BIGINT NOT NULL,
  "user_id" "uuid" NOT NULL,
  "option_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."user_answers" owner TO "postgres";

comment ON TABLE "public"."user_answers" IS 'User answers to closed questions';

ALTER TABLE "public"."user_answers"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."closed_question_answers_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."question_options" (
  "id" BIGINT NOT NULL,
  "question_id" BIGINT NOT NULL,
  "content" "jsonb" NOT NULL,
  "is_correct" BOOLEAN NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."question_options" owner TO "postgres";

comment ON TABLE "public"."question_options" IS 'Options for a course question';

ALTER TABLE "public"."question_options"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."closed_question_options_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."questions" (
  "id" BIGINT NOT NULL,
  "lesson_id" BIGINT NOT NULL,
  "description" "jsonb" NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "explanation" "jsonb"
);

ALTER TABLE "public"."questions" owner TO "postgres";

comment ON TABLE "public"."questions" IS 'Questions with a single answer';

ALTER TABLE "public"."questions"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."closed_questions_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."contributions" (
  "id" BIGINT NOT NULL,
  "user_id" "uuid" NOT NULL,
  "lesson_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."contributions" owner TO "postgres";

comment ON TABLE "public"."contributions" IS 'Editor contributions to a course';

ALTER TABLE "public"."contributions"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."contributions_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."courses" (
  "id" BIGINT NOT NULL,
  "creator_id" "uuid" DEFAULT "auth"."uid" () NOT NULL,
  "title" "jsonb",
  "description" "jsonb",
  "sort_order" SMALLINT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "slug" "text" NOT NULL,
  "archived_at" TIMESTAMP WITH TIME ZONE,
  "icon" "text",
  "skill_group_id" BIGINT,
  "type" "public"."course_type" DEFAULT 'skill'::"public"."course_type",
  "languages" "public"."language" [] NOT NULL
);

ALTER TABLE "public"."courses" owner TO "postgres";

comment ON TABLE "public"."courses" IS 'Learning modules';

ALTER TABLE "public"."courses"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."courses_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."lessons" (
  "id" BIGINT NOT NULL,
  "course_id" BIGINT NOT NULL,
  "title" "jsonb" NOT NULL,
  "content" "jsonb",
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "sort_order" SMALLINT NOT NULL
);

ALTER TABLE "public"."lessons" owner TO "postgres";

comment ON TABLE "public"."lessons" IS 'Steps of a course';

ALTER TABLE "public"."lessons"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."lessons_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."memberships" (
  "id" BIGINT NOT NULL,
  "user_id" "uuid" NOT NULL,
  "organization_id" BIGINT NOT NULL,
  "role" "public"."role" NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."memberships" owner TO "postgres";

comment ON TABLE "public"."memberships" IS 'User organizations';

ALTER TABLE "public"."memberships"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."memberships_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."organization_regions" (
  "id" BIGINT NOT NULL,
  "region_id" BIGINT NOT NULL,
  "organization_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."organization_regions" owner TO "postgres";

comment ON TABLE "public"."organization_regions" IS 'Organizations per region';

ALTER TABLE "public"."organization_regions"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."organization_regions_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."organizations" (
  "id" BIGINT NOT NULL,
  "handle" "text" NOT NULL,
  "name" "text" NOT NULL,
  "email" "text" NOT NULL,
  "description" "jsonb",
  "phone" "text",
  "country" "text",
  "region" "text",
  "postcode" "text",
  "city" "text",
  "address" "text",
  "avatar_url" "text",
  "rating" REAL,
  "approved_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "url" "text"
);

ALTER TABLE "public"."organizations" owner TO "postgres";

comment ON TABLE "public"."organizations" IS 'Volunteering organizations';

ALTER TABLE "public"."organizations"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."organizations_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."regions" (
  "id" BIGINT NOT NULL,
  "name" "jsonb" NOT NULL,
  "coordinator_id" "uuid",
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "emoji" "text" DEFAULT 'NULL'::"text",
  "icon_url" "text" DEFAULT 'NULL'::"text"
);

ALTER TABLE "public"."regions" owner TO "postgres";

comment ON TABLE "public"."regions" IS 'Groups of organizations';

ALTER TABLE "public"."regions"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."regions_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."user_assessments" (
  "id" BIGINT NOT NULL,
  "user_id" "uuid" NOT NULL,
  "assessment_id" BIGINT,
  "value" SMALLINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."user_assessments" owner TO "postgres";

comment ON TABLE "public"."user_assessments" IS 'Self-assessments of a skill';

ALTER TABLE "public"."user_assessments"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."self_ skill_assessments_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."user_evaluations" (
  "id" BIGINT NOT NULL,
  "user_id" "uuid" NOT NULL,
  "evaluation_id" BIGINT NOT NULL,
  "value" SMALLINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."user_evaluations" owner TO "postgres";

comment ON TABLE "public"."user_evaluations" IS 'User evaluations unrelated to a skill';

ALTER TABLE "public"."user_evaluations"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."self_assessments_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

ALTER TABLE "public"."assessments"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."skill_assessments_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."skill_groups" (
  "id" BIGINT NOT NULL,
  "name" "jsonb" NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."skill_groups" owner TO "postgres";

ALTER TABLE "public"."skill_groups"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."skill_groups_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."user_courses" (
  "id" BIGINT NOT NULL,
  "user_id" "uuid" NOT NULL,
  "course_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "locale" "public"."language" NOT NULL
);

ALTER TABLE "public"."user_courses" owner TO "postgres";

comment ON TABLE "public"."user_courses" IS 'Subscriptions to a course';

ALTER TABLE "public"."user_courses"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."user_courses_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."user_lessons" (
  "id" BIGINT NOT NULL,
  "user_id" "uuid" NOT NULL,
  "lesson_id" BIGINT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."user_lessons" owner TO "postgres";

comment ON TABLE "public"."user_lessons" IS 'Completed lessons in a course';

ALTER TABLE "public"."user_lessons"
ALTER COLUMN "id"
ADD GENERATED BY DEFAULT AS IDENTITY (
  sequence name "public"."user_lessons_id_seq" start
  WITH
    1 increment by 1 no minvalue no maxvalue cache 1
);

CREATE TABLE IF NOT EXISTS "public"."users" (
  "id" "uuid" NOT NULL,
  "username" "text",
  "first_name" "text",
  "last_name" "text",
  "birthday" "date",
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT "now" () NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE,
  "sex" "public"."sex",
  "pronouns" "text",
  "country" "text",
  "city" "text",
  "avatar_url" "text",
  "bio" "text",
  "is_admin" BOOLEAN DEFAULT FALSE,
  "is_editor" BOOLEAN DEFAULT FALSE,
  "email" "text" NOT NULL,
  "phone" "text",
  "languages" "text" []
);

ALTER TABLE "public"."users" owner TO "postgres";

comment ON TABLE "public"."users" IS 'User profiles';

ALTER TABLE ONLY "auth"."refresh_tokens"
ALTER COLUMN "id"
SET DEFAULT "nextval" ('"auth"."refresh_tokens_id_seq"'::"regclass");

ALTER TABLE ONLY "auth"."mfa_amr_claims"
ADD CONSTRAINT "amr_id_pk" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."audit_log_entries"
ADD CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."flow_state"
ADD CONSTRAINT "flow_state_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."identities"
ADD CONSTRAINT "identities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."identities"
ADD CONSTRAINT "identities_provider_id_provider_unique" UNIQUE ("provider_id", "provider");

ALTER TABLE ONLY "auth"."instances"
ADD CONSTRAINT "instances_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."mfa_amr_claims"
ADD CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE ("session_id", "authentication_method");

ALTER TABLE ONLY "auth"."mfa_challenges"
ADD CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."mfa_factors"
ADD CONSTRAINT "mfa_factors_last_challenged_at_key" UNIQUE ("last_challenged_at");

ALTER TABLE ONLY "auth"."mfa_factors"
ADD CONSTRAINT "mfa_factors_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."one_time_tokens"
ADD CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."refresh_tokens"
ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."refresh_tokens"
ADD CONSTRAINT "refresh_tokens_token_unique" UNIQUE ("token");

ALTER TABLE ONLY "auth"."saml_providers"
ADD CONSTRAINT "saml_providers_entity_id_key" UNIQUE ("entity_id");

ALTER TABLE ONLY "auth"."saml_providers"
ADD CONSTRAINT "saml_providers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."saml_relay_states"
ADD CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."schema_migrations"
ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");

ALTER TABLE ONLY "auth"."sessions"
ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."sso_domains"
ADD CONSTRAINT "sso_domains_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."sso_providers"
ADD CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "auth"."users"
ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");

ALTER TABLE ONLY "auth"."users"
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."evaluations"
ADD CONSTRAINT "assessments_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."evaluations"
ADD CONSTRAINT "assessments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."certificate_skills"
ADD CONSTRAINT "certificate_skills_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."certificate_skills"
ADD CONSTRAINT "certificate_skills_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."certificates"
ADD CONSTRAINT "certificates_handle_key" UNIQUE ("handle");

ALTER TABLE ONLY "public"."certificates"
ADD CONSTRAINT "certificates_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."certificates"
ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_answers"
ADD CONSTRAINT "closed_question_answers_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."user_answers"
ADD CONSTRAINT "closed_question_answers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."question_options"
ADD CONSTRAINT "closed_question_options_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."question_options"
ADD CONSTRAINT "closed_question_options_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."questions"
ADD CONSTRAINT "closed_questions_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."questions"
ADD CONSTRAINT "closed_questions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."contributions"
ADD CONSTRAINT "contributions_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."contributions"
ADD CONSTRAINT "contributions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."courses"
ADD CONSTRAINT "courses_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."courses"
ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."courses"
ADD CONSTRAINT "courses_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."courses"
ADD CONSTRAINT "courses_sort_order_key" UNIQUE ("sort_order");

ALTER TABLE ONLY "public"."lessons"
ADD CONSTRAINT "lessons_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."lessons"
ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."memberships"
ADD CONSTRAINT "memberships_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."organization_regions"
ADD CONSTRAINT "organization_regions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."organizations"
ADD CONSTRAINT "organizations_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."organizations"
ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."organizations"
ADD CONSTRAINT "organizations_slug_key" UNIQUE ("handle");

ALTER TABLE ONLY "public"."regions"
ADD CONSTRAINT "regions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_assessments"
ADD CONSTRAINT "self_ skill_assessments_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."user_assessments"
ADD CONSTRAINT "self_ skill_assessments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_evaluations"
ADD CONSTRAINT "self_assessments_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."user_evaluations"
ADD CONSTRAINT "self_assessments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."skill_groups"
ADD CONSTRAINT "skill_areas_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."skill_groups"
ADD CONSTRAINT "skill_areas_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."skill_groups"
ADD CONSTRAINT "skill_areas_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."assessments"
ADD CONSTRAINT "skill_assessments_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."assessments"
ADD CONSTRAINT "skill_assessments_lesson_id_key" UNIQUE ("lesson_id");

ALTER TABLE ONLY "public"."assessments"
ADD CONSTRAINT "skill_assessments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_courses"
ADD CONSTRAINT "user_courses_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_lessons"
ADD CONSTRAINT "user_lessons_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
ADD CONSTRAINT "users_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."users"
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
ADD CONSTRAINT "users_username_key" UNIQUE ("username");

CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" USING "btree" ("instance_id");

CREATE UNIQUE INDEX "confirmation_token_idx" ON "auth"."users" USING "btree" ("confirmation_token")
WHERE
  (("confirmation_token")::"text" !~ '^[0-9 ]*$'::"text");

CREATE UNIQUE INDEX "email_change_token_current_idx" ON "auth"."users" USING "btree" ("email_change_token_current")
WHERE
  (("email_change_token_current")::"text" !~ '^[0-9 ]*$'::"text");

CREATE UNIQUE INDEX "email_change_token_new_idx" ON "auth"."users" USING "btree" ("email_change_token_new")
WHERE
  (("email_change_token_new")::"text" !~ '^[0-9 ]*$'::"text");

CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors" USING "btree" ("user_id", "created_at");

CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state" USING "btree" ("created_at" DESC);

CREATE INDEX "identities_email_idx" ON "auth"."identities" USING "btree" ("email" "text_pattern_ops");

comment ON index "auth"."identities_email_idx" IS 'Auth: Ensures indexed queries on the email column';

CREATE INDEX "identities_user_id_idx" ON "auth"."identities" USING "btree" ("user_id");

CREATE INDEX "idx_auth_code" ON "auth"."flow_state" USING "btree" ("auth_code");

CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state" USING "btree" ("user_id", "authentication_method");

CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" USING "btree" ("created_at" DESC);

CREATE UNIQUE INDEX "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" USING "btree" ("friendly_name", "user_id")
WHERE
  (
    TRIM(
      BOTH
      FROM
        "friendly_name"
    ) <> ''::"text"
  );

CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors" USING "btree" ("user_id");

CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("relates_to");

CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("token_hash");

CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens" USING "btree" ("user_id", "token_type");

CREATE UNIQUE INDEX "reauthentication_token_idx" ON "auth"."users" USING "btree" ("reauthentication_token")
WHERE
  (("reauthentication_token")::"text" !~ '^[0-9 ]*$'::"text");

CREATE UNIQUE INDEX "recovery_token_idx" ON "auth"."users" USING "btree" ("recovery_token")
WHERE
  (("recovery_token")::"text" !~ '^[0-9 ]*$'::"text");

CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id");

CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id", "user_id");

CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" USING "btree" ("parent");

CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" USING "btree" ("session_id", "revoked");

CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" USING "btree" ("updated_at" DESC);

CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" USING "btree" ("sso_provider_id");

CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" USING "btree" ("created_at" DESC);

CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" USING "btree" ("for_email");

CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" USING "btree" ("sso_provider_id");

CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions" USING "btree" ("not_after" DESC);

CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" USING "btree" ("user_id");

CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" USING "btree" ("lower" ("domain"));

CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" USING "btree" ("sso_provider_id");

CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" USING "btree" ("lower" ("resource_id"));

CREATE INDEX "sso_providers_resource_id_pattern_idx" ON "auth"."sso_providers" USING "btree" ("resource_id" "text_pattern_ops");

CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors" USING "btree" ("user_id", "phone");

CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions" USING "btree" ("user_id", "created_at");

CREATE UNIQUE INDEX "users_email_partial_key" ON "auth"."users" USING "btree" ("email")
WHERE
  ("is_sso_user" = FALSE);

comment ON index "auth"."users_email_partial_key" IS 'Auth: A partial unique index that applies only when is_sso_user is false';

CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" USING "btree" ("instance_id", "lower" (("email")::"text"));

CREATE INDEX "users_instance_id_idx" ON "auth"."users" USING "btree" ("instance_id");

CREATE INDEX "users_is_anonymous_idx" ON "auth"."users" USING "btree" ("is_anonymous");

CREATE OR REPLACE TRIGGER "after_user_insert"
AFTER insert ON "auth"."users" FOR each ROW
EXECUTE function "public"."insert_public_user" ();

CREATE OR REPLACE TRIGGER "after_user_update"
AFTER
UPDATE ON "auth"."users" FOR each ROW
EXECUTE function "public"."update_public_user" ();

CREATE OR REPLACE TRIGGER "create_username" before insert ON "public"."users" FOR each ROW
EXECUTE function "public"."set_username" ();

CREATE OR REPLACE TRIGGER "set_assessment_skill" before insert ON "public"."user_assessments" FOR each ROW
EXECUTE function "public"."set_skill_id" ();

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."assessments" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."certificates" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."contributions" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."courses" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."evaluations" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."lessons" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."memberships" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."organization_regions" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."organizations" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."question_options" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."questions" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."regions" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."skill_groups" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."user_answers" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."user_assessments" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."user_courses" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."user_evaluations" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."user_lessons" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "set_updated_at" before
UPDATE ON "public"."users" FOR each ROW
EXECUTE function "extensions"."moddatetime" ('updated_at');

CREATE OR REPLACE TRIGGER "update_username" before
UPDATE ON "public"."users" FOR each ROW
EXECUTE function "public"."set_username" ();

ALTER TABLE ONLY "auth"."identities"
ADD CONSTRAINT "identities_user_id_fkey" FOREIGN key ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."mfa_amr_claims"
ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN key ("session_id") REFERENCES "auth"."sessions" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."mfa_challenges"
ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN key ("factor_id") REFERENCES "auth"."mfa_factors" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."mfa_factors"
ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN key ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."one_time_tokens"
ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN key ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."refresh_tokens"
ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN key ("session_id") REFERENCES "auth"."sessions" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."saml_providers"
ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN key ("sso_provider_id") REFERENCES "auth"."sso_providers" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."saml_relay_states"
ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN key ("flow_state_id") REFERENCES "auth"."flow_state" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."saml_relay_states"
ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN key ("sso_provider_id") REFERENCES "auth"."sso_providers" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."sessions"
ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN key ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "auth"."sso_domains"
ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN key ("sso_provider_id") REFERENCES "auth"."sso_providers" ("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."assessments"
ADD CONSTRAINT "assessments_lesson_id_fkey" FOREIGN key ("lesson_id") REFERENCES "public"."lessons" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."certificate_skills"
ADD CONSTRAINT "certificate_skills_certificate_id_fkey" FOREIGN key ("certificate_id") REFERENCES "public"."certificates" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."certificate_skills"
ADD CONSTRAINT "certificate_skills_course_id_fkey" FOREIGN key ("course_id") REFERENCES "public"."courses" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."certificates"
ADD CONSTRAINT "certificates_organization_id_fkey" FOREIGN key ("organization_id") REFERENCES "public"."organizations" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."certificates"
ADD CONSTRAINT "certificates_reviewer_id_fkey" FOREIGN key ("reviewer_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."certificates"
ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN key ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."contributions"
ADD CONSTRAINT "contributions_lesson_id_fkey" FOREIGN key ("lesson_id") REFERENCES "public"."lessons" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."contributions"
ADD CONSTRAINT "contributions_user_id_fkey" FOREIGN key ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."courses"
ADD CONSTRAINT "courses_creator_id_fkey1" FOREIGN key ("creator_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."courses"
ADD CONSTRAINT "courses_skill_group_id_fkey" FOREIGN key ("skill_group_id") REFERENCES "public"."skill_groups" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."evaluations"
ADD CONSTRAINT "evaluations_lesson_id_fkey" FOREIGN key ("lesson_id") REFERENCES "public"."lessons" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."lessons"
ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN key ("course_id") REFERENCES "public"."courses" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."memberships"
ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN key ("organization_id") REFERENCES "public"."organizations" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."memberships"
ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN key ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."organization_regions"
ADD CONSTRAINT "organization_regions_organization_id_fkey" FOREIGN key ("organization_id") REFERENCES "public"."organizations" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."organization_regions"
ADD CONSTRAINT "organization_regions_region_id_fkey" FOREIGN key ("region_id") REFERENCES "public"."regions" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."question_options"
ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN key ("question_id") REFERENCES "public"."questions" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."questions"
ADD CONSTRAINT "questions_lesson_id_fkey" FOREIGN key ("lesson_id") REFERENCES "public"."lessons" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."regions"
ADD CONSTRAINT "regions_coordinator_id_fkey" FOREIGN key ("coordinator_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_answers"
ADD CONSTRAINT "user_answers_option_id_fkey" FOREIGN key ("option_id") REFERENCES "public"."question_options" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_answers"
ADD CONSTRAINT "user_answers_user_id_fkey" FOREIGN key ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_assessments"
ADD CONSTRAINT "user_assessments_assessment_id_fkey" FOREIGN key ("assessment_id") REFERENCES "public"."assessments" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_assessments"
ADD CONSTRAINT "user_assessments_user_id_fkey" FOREIGN key ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_courses"
ADD CONSTRAINT "user_courses_course_id_fkey" FOREIGN key ("course_id") REFERENCES "public"."courses" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_courses"
ADD CONSTRAINT "user_courses_user_id_fkey" FOREIGN key ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_evaluations"
ADD CONSTRAINT "user_evaluations_evaluation_id_fkey" FOREIGN key ("evaluation_id") REFERENCES "public"."evaluations" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_evaluations"
ADD CONSTRAINT "user_evaluations_user_id_fkey" FOREIGN key ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_lessons"
ADD CONSTRAINT "user_lessons_lesson_id_fkey" FOREIGN key ("lesson_id") REFERENCES "public"."lessons" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_lessons"
ADD CONSTRAINT "user_lessons_user_id_fkey" FOREIGN key ("user_id") REFERENCES "public"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."users"
ADD CONSTRAINT "users_id_fkey" FOREIGN key ("id") REFERENCES "auth"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "auth"."audit_log_entries" enable ROW level security;

ALTER TABLE "auth"."flow_state" enable ROW level security;

ALTER TABLE "auth"."identities" enable ROW level security;

ALTER TABLE "auth"."instances" enable ROW level security;

ALTER TABLE "auth"."mfa_amr_claims" enable ROW level security;

ALTER TABLE "auth"."mfa_challenges" enable ROW level security;

ALTER TABLE "auth"."mfa_factors" enable ROW level security;

ALTER TABLE "auth"."one_time_tokens" enable ROW level security;

ALTER TABLE "auth"."refresh_tokens" enable ROW level security;

ALTER TABLE "auth"."saml_providers" enable ROW level security;

ALTER TABLE "auth"."saml_relay_states" enable ROW level security;

ALTER TABLE "auth"."schema_migrations" enable ROW level security;

ALTER TABLE "auth"."sessions" enable ROW level security;

ALTER TABLE "auth"."sso_domains" enable ROW level security;

ALTER TABLE "auth"."sso_providers" enable ROW level security;

ALTER TABLE "auth"."users" enable ROW level security;

CREATE POLICY "Admins and editors can delete assessments" ON "public"."assessments" FOR delete TO "authenticated" USING (
  (
    (
      SELECT
        "users"."is_admin"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    ) OR
    (
      SELECT
        "users"."is_editor"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    )
  )
);

CREATE POLICY "Admins and editors can delete courses" ON "public"."courses" FOR delete TO "authenticated" USING (
  (
    (
      SELECT
        "users"."is_admin"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    ) OR
    (
      SELECT
        "users"."is_editor"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    )
  )
);

CREATE POLICY "Admins and editors can delete evaluations" ON "public"."evaluations" FOR delete TO "authenticated" USING (
  (
    (
      SELECT
        "users"."is_admin"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    ) OR
    (
      SELECT
        "users"."is_editor"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    )
  )
);

CREATE POLICY "Admins and editors can delete lessons" ON "public"."lessons" FOR delete TO "authenticated" USING (
  (
    (
      SELECT
        "users"."is_admin"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    ) OR
    (
      SELECT
        "users"."is_editor"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    )
  )
);

CREATE POLICY "Admins and editors can delete question_options" ON "public"."question_options" FOR delete TO "authenticated" USING (
  (
    (
      SELECT
        "users"."is_admin"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    ) OR
    (
      SELECT
        "users"."is_editor"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    )
  )
);

CREATE POLICY "Admins and editors can delete questions" ON "public"."questions" FOR delete TO "authenticated" USING (
  (
    (
      SELECT
        "users"."is_admin"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    ) OR
    (
      SELECT
        "users"."is_editor"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    )
  )
);

CREATE POLICY "Admins and editors can insert assessments" ON "public"."assessments" FOR insert TO "authenticated"
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can insert courses" ON "public"."courses" FOR insert TO "authenticated"
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can insert evaluations" ON "public"."evaluations" FOR insert TO "authenticated"
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can insert lessons" ON "public"."lessons" FOR insert TO "authenticated"
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can insert question_options" ON "public"."question_options" FOR insert TO "authenticated"
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can insert questions" ON "public"."questions" FOR insert TO "authenticated"
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can select assessments" ON "public"."assessments" FOR
SELECT
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can select evaluations" ON "public"."evaluations" FOR
SELECT
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can select lessons" ON "public"."lessons" FOR
SELECT
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can select question_options" ON "public"."question_options" FOR
SELECT
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can select questions" ON "public"."questions" FOR
SELECT
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can update assessments" ON "public"."assessments"
FOR UPDATE
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  )
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can update courses" ON "public"."courses"
FOR UPDATE
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  )
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can update evaluations" ON "public"."evaluations"
FOR UPDATE
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  )
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can update lessons" ON "public"."lessons"
FOR UPDATE
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  )
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can update question_options" ON "public"."question_options"
FOR UPDATE
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  )
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can update questions" ON "public"."questions"
FOR UPDATE
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  )
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and editors can view courses" ON "public"."courses" FOR
SELECT
  TO "authenticated" USING (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_editor"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      )
    )
  );

CREATE POLICY "Admins and service roles can delete memberships" ON "public"."memberships" TO "authenticated" USING (
  (
    (
      SELECT
        "users"."is_admin"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    ) OR
    (
      SELECT
        "users"."is_admin"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    ) OR
    (
      SELECT
        ("auth"."role" () = 'service_role'::"text")
    )
  )
);

CREATE POLICY "Admins and service roles can insert memberships" ON "public"."memberships" TO "authenticated"
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          ("auth"."role" () = 'service_role'::"text")
      )
    )
  );

CREATE POLICY "Admins and service roles can update memberships" ON "public"."memberships" TO "authenticated"
WITH
  CHECK (
    (
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        SELECT
          ("auth"."role" () = 'service_role'::"text")
      )
    )
  );

CREATE POLICY "Admins can delete contributions" ON "public"."contributions" FOR delete TO "authenticated" USING (
  (
    EXISTS (
      SELECT
        1
      FROM
        "public"."users" "u"
      WHERE
        (
          (
            "u"."id" = (
              SELECT
                "auth"."uid" () AS "uid"
            )
          ) AND
          ("u"."is_admin" = TRUE)
        )
    )
  )
);

CREATE POLICY "Admins or editors can create contributions" ON "public"."contributions" FOR insert TO "authenticated"
WITH
  CHECK (
    (
      EXISTS (
        SELECT
          1
        FROM
          "public"."users" "u"
        WHERE
          (
            (
              "u"."id" = (
                SELECT
                  "auth"."uid" () AS "uid"
              )
            ) AND
            (
              ("u"."is_admin" = TRUE) OR
              ("u"."is_editor" = TRUE)
            )
          )
      )
    )
  );

CREATE POLICY "Allow all users to view skill groups" ON "public"."skill_groups" FOR
SELECT
  TO "authenticated" USING (TRUE);

CREATE POLICY "Anyone can read public users" ON "public"."users" FOR
SELECT
  TO "anon" USING (TRUE);

CREATE POLICY "Authenticated users can select memberships" ON "public"."memberships" FOR
SELECT
  TO "authenticated" USING (TRUE);

CREATE POLICY "Authenticated users can view all organizations" ON "public"."organizations" FOR
SELECT
  TO "authenticated" USING (TRUE);

CREATE POLICY "Authenticated users can view all users" ON "public"."users" FOR
SELECT
  TO "authenticated" USING (TRUE);

CREATE POLICY "Authenticated users can view contributions" ON "public"."contributions" FOR
SELECT
  TO "authenticated" USING (TRUE);

CREATE POLICY "Service roles can delete users" ON "public"."users" FOR delete TO "service_role" USING (TRUE);

CREATE POLICY "Service roles can insert users" ON "public"."users" FOR insert TO "service_role"
WITH
  CHECK (TRUE);

CREATE POLICY "Service roles can select users" ON "public"."users" FOR
SELECT
  TO "service_role" USING (TRUE);

CREATE POLICY "Service roles can update users" ON "public"."users"
FOR UPDATE
  TO "service_role" USING (TRUE)
WITH
  CHECK (TRUE);

CREATE POLICY "Users can create their own lessons" ON "public"."user_lessons" FOR insert TO "authenticated"
WITH
  CHECK (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can delete their own lessons" ON "public"."user_lessons" FOR delete TO "authenticated" USING (
  (
    "user_id" = (
      SELECT
        "auth"."uid" () AS "uid"
    )
  )
);

CREATE POLICY "Users can delete their own lessons or by admin, rep" ON "public"."user_lessons" FOR delete TO "authenticated" USING (
  (
    ("auth"."uid" () = "user_id") OR
    (
      SELECT
        "users"."is_admin"
      FROM
        "public"."users"
      WHERE
        ("users"."id" = "auth"."uid" ())
    ) OR
    (
      "user_id" IN (
        SELECT
          "memberships"."user_id"
        FROM
          "public"."memberships"
        WHERE
          (
            "memberships"."organization_id" IN (
              SELECT
                "memberships_1"."organization_id"
              FROM
                "public"."memberships" "memberships_1"
              WHERE
                (
                  ("memberships_1"."user_id" = "auth"."uid" ()) AND
                  ("memberships_1"."role" = 'representative'::"public"."role")
                )
            )
          )
      )
    )
  )
);

CREATE POLICY "Users can insert their own lessons" ON "public"."user_lessons" FOR insert TO "authenticated"
WITH
  CHECK (
    (
      "user_id" = (
        SELECT
          "auth"."uid" () AS "uid"
      )
    )
  );

CREATE POLICY "Users can update their own lessons" ON "public"."user_lessons"
FOR UPDATE
  TO "authenticated" USING (
    (
      "user_id" = (
        SELECT
          "auth"."uid" () AS "uid"
      )
    )
  )
WITH
  CHECK (TRUE);

CREATE POLICY "Users can update their own lessons or by admin, rep, or tutor" ON "public"."user_lessons"
FOR UPDATE
  TO "authenticated" USING (
    (
      ("auth"."uid" () = "user_id") OR
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        "user_id" IN (
          SELECT
            "memberships"."user_id"
          FROM
            "public"."memberships"
          WHERE
            (
              "memberships"."organization_id" IN (
                SELECT
                  "memberships_1"."organization_id"
                FROM
                  "public"."memberships" "memberships_1"
                WHERE
                  (
                    ("memberships_1"."user_id" = "auth"."uid" ()) AND
                    (
                      "memberships_1"."role" = ANY (ARRAY['representative'::"public"."role", 'tutor'::"public"."role"])
                    )
                  )
              )
            )
        )
      )
    )
  )
WITH
  CHECK (("auth"."uid" () = "user_id"));

CREATE POLICY "Users can view their own lessons or by admin, rep, or tutor" ON "public"."user_lessons" FOR
SELECT
  TO "authenticated" USING (
    (
      ("auth"."uid" () = "user_id") OR
      (
        SELECT
          "users"."is_admin"
        FROM
          "public"."users"
        WHERE
          ("users"."id" = "auth"."uid" ())
      ) OR
      (
        "user_id" IN (
          SELECT
            "memberships"."user_id"
          FROM
            "public"."memberships"
          WHERE
            (
              "memberships"."organization_id" IN (
                SELECT
                  "memberships_1"."organization_id"
                FROM
                  "public"."memberships" "memberships_1"
                WHERE
                  (
                    ("memberships_1"."user_id" = "auth"."uid" ()) AND
                    (
                      "memberships_1"."role" = ANY (ARRAY['representative'::"public"."role", 'tutor'::"public"."role"])
                    )
                  )
              )
            )
        )
      )
    )
  );

CREATE POLICY "Users can view their own records" ON "public"."users" FOR
SELECT
  TO "authenticated" USING (("id" = "auth"."uid" ()));

CREATE POLICY "Users, admins and representative can update a public record" ON "public"."users"
FOR UPDATE
  TO "authenticated" USING (
    (
      ("auth"."uid" () = "id") OR
      (
        SELECT
          "users_1"."is_admin"
        FROM
          "public"."users" "users_1"
        WHERE
          ("users_1"."id" = "auth"."uid" ())
      ) OR
      (
        "id" IN (
          SELECT
            "memberships"."user_id"
          FROM
            "public"."memberships"
          WHERE
            (
              "memberships"."organization_id" IN (
                SELECT
                  "memberships_1"."organization_id"
                FROM
                  "public"."memberships" "memberships_1"
                WHERE
                  (
                    ("memberships_1"."user_id" = "auth"."uid" ()) AND
                    (
                      "memberships_1"."role" = ANY (ARRAY['representative'::"public"."role", 'tutor'::"public"."role"])
                    )
                  )
              )
            )
        )
      )
    )
  )
WITH
  CHECK (("auth"."uid" () = "id"));

ALTER TABLE "public"."assessments" enable ROW level security;

ALTER TABLE "public"."certificate_skills" enable ROW level security;

ALTER TABLE "public"."certificates" enable ROW level security;

ALTER TABLE "public"."contributions" enable ROW level security;

ALTER TABLE "public"."courses" enable ROW level security;

ALTER TABLE "public"."evaluations" enable ROW level security;

ALTER TABLE "public"."lessons" enable ROW level security;

ALTER TABLE "public"."memberships" enable ROW level security;

ALTER TABLE "public"."organization_regions" enable ROW level security;

ALTER TABLE "public"."organizations" enable ROW level security;

ALTER TABLE "public"."question_options" enable ROW level security;

ALTER TABLE "public"."questions" enable ROW level security;

ALTER TABLE "public"."regions" enable ROW level security;

ALTER TABLE "public"."skill_groups" enable ROW level security;

ALTER TABLE "public"."user_answers" enable ROW level security;

ALTER TABLE "public"."user_assessments" enable ROW level security;

ALTER TABLE "public"."user_courses" enable ROW level security;

ALTER TABLE "public"."user_evaluations" enable ROW level security;

ALTER TABLE "public"."user_lessons" enable ROW level security;

ALTER TABLE "public"."users" enable ROW level security;

GRANT usage ON schema "auth" TO "anon";

GRANT usage ON schema "auth" TO "authenticated";

GRANT usage ON schema "auth" TO "service_role";

GRANT ALL ON schema "auth" TO "supabase_auth_admin";

GRANT ALL ON schema "auth" TO "dashboard_user";

GRANT usage ON schema "auth" TO "postgres";

GRANT usage ON schema "public" TO "postgres";

GRANT usage ON schema "public" TO "anon";

GRANT usage ON schema "public" TO "authenticated";

GRANT usage ON schema "public" TO "service_role";

GRANT ALL ON function "auth"."email" () TO "dashboard_user";

GRANT ALL ON function "auth"."jwt" () TO "postgres";

GRANT ALL ON function "auth"."jwt" () TO "dashboard_user";

GRANT ALL ON function "auth"."role" () TO "dashboard_user";

GRANT ALL ON function "auth"."uid" () TO "dashboard_user";

GRANT ALL ON function "public"."insert_public_user" () TO "anon";

GRANT ALL ON function "public"."insert_public_user" () TO "authenticated";

GRANT ALL ON function "public"."insert_public_user" () TO "service_role";

GRANT ALL ON function "public"."set_skill_id" () TO "anon";

GRANT ALL ON function "public"."set_skill_id" () TO "authenticated";

GRANT ALL ON function "public"."set_skill_id" () TO "service_role";

GRANT ALL ON function "public"."set_username" () TO "anon";

GRANT ALL ON function "public"."set_username" () TO "authenticated";

GRANT ALL ON function "public"."set_username" () TO "service_role";

GRANT ALL ON function "public"."update_public_user" () TO "anon";

GRANT ALL ON function "public"."update_public_user" () TO "authenticated";

GRANT ALL ON function "public"."update_public_user" () TO "service_role";

GRANT ALL ON TABLE "auth"."audit_log_entries" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."audit_log_entries" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."audit_log_entries" TO "postgres"
WITH
GRANT option;

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."flow_state" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."flow_state" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."flow_state" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."identities" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."identities" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."identities" TO "dashboard_user";

GRANT ALL ON TABLE "auth"."instances" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."instances" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."instances" TO "postgres"
WITH
GRANT option;

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."mfa_amr_claims" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."mfa_amr_claims" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."mfa_amr_claims" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."mfa_challenges" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."mfa_challenges" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."mfa_challenges" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."mfa_factors" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."mfa_factors" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."mfa_factors" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."one_time_tokens" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."one_time_tokens" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."one_time_tokens" TO "dashboard_user";

GRANT ALL ON TABLE "auth"."refresh_tokens" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."refresh_tokens" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."refresh_tokens" TO "postgres"
WITH
GRANT option;

GRANT ALL ON sequence "auth"."refresh_tokens_id_seq" TO "dashboard_user";

GRANT ALL ON sequence "auth"."refresh_tokens_id_seq" TO "postgres";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."saml_providers" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."saml_providers" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."saml_providers" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."saml_relay_states" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."saml_relay_states" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."saml_relay_states" TO "dashboard_user";

GRANT
SELECT
  ON TABLE "auth"."schema_migrations" TO "postgres"
WITH
GRANT option;

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."sessions" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."sessions" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."sessions" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."sso_domains" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."sso_domains" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."sso_domains" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."sso_providers" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."sso_providers" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "auth"."sso_providers" TO "dashboard_user";

GRANT ALL ON TABLE "auth"."users" TO "dashboard_user";

GRANT insert,
REFERENCES,
delete,
trigger,
TRUNCATE,
maintain,
UPDATE ON TABLE "auth"."users" TO "postgres";

GRANT
SELECT
  ON TABLE "auth"."users" TO "postgres"
WITH
GRANT option;

GRANT ALL ON TABLE "public"."assessments" TO "anon";

GRANT ALL ON TABLE "public"."assessments" TO "authenticated";

GRANT ALL ON TABLE "public"."assessments" TO "service_role";

GRANT ALL ON TABLE "public"."evaluations" TO "anon";

GRANT ALL ON TABLE "public"."evaluations" TO "authenticated";

GRANT ALL ON TABLE "public"."evaluations" TO "service_role";

GRANT ALL ON sequence "public"."assessments_id_seq" TO "anon";

GRANT ALL ON sequence "public"."assessments_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."assessments_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."certificate_skills" TO "anon";

GRANT ALL ON TABLE "public"."certificate_skills" TO "authenticated";

GRANT ALL ON TABLE "public"."certificate_skills" TO "service_role";

GRANT ALL ON sequence "public"."certificate_skills_id_seq" TO "anon";

GRANT ALL ON sequence "public"."certificate_skills_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."certificate_skills_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."certificates" TO "anon";

GRANT ALL ON TABLE "public"."certificates" TO "authenticated";

GRANT ALL ON TABLE "public"."certificates" TO "service_role";

GRANT ALL ON sequence "public"."certificates_id_seq" TO "anon";

GRANT ALL ON sequence "public"."certificates_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."certificates_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_answers" TO "anon";

GRANT ALL ON TABLE "public"."user_answers" TO "authenticated";

GRANT ALL ON TABLE "public"."user_answers" TO "service_role";

GRANT ALL ON sequence "public"."closed_question_answers_id_seq" TO "anon";

GRANT ALL ON sequence "public"."closed_question_answers_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."closed_question_answers_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."question_options" TO "anon";

GRANT ALL ON TABLE "public"."question_options" TO "authenticated";

GRANT ALL ON TABLE "public"."question_options" TO "service_role";

GRANT ALL ON sequence "public"."closed_question_options_id_seq" TO "anon";

GRANT ALL ON sequence "public"."closed_question_options_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."closed_question_options_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."questions" TO "anon";

GRANT ALL ON TABLE "public"."questions" TO "authenticated";

GRANT ALL ON TABLE "public"."questions" TO "service_role";

GRANT ALL ON sequence "public"."closed_questions_id_seq" TO "anon";

GRANT ALL ON sequence "public"."closed_questions_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."closed_questions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."contributions" TO "anon";

GRANT ALL ON TABLE "public"."contributions" TO "authenticated";

GRANT ALL ON TABLE "public"."contributions" TO "service_role";

GRANT ALL ON sequence "public"."contributions_id_seq" TO "anon";

GRANT ALL ON sequence "public"."contributions_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."contributions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."courses" TO "anon";

GRANT ALL ON TABLE "public"."courses" TO "authenticated";

GRANT ALL ON TABLE "public"."courses" TO "service_role";

GRANT ALL ON sequence "public"."courses_id_seq" TO "anon";

GRANT ALL ON sequence "public"."courses_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."courses_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."lessons" TO "anon";

GRANT ALL ON TABLE "public"."lessons" TO "authenticated";

GRANT ALL ON TABLE "public"."lessons" TO "service_role";

GRANT ALL ON sequence "public"."lessons_id_seq" TO "anon";

GRANT ALL ON sequence "public"."lessons_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."lessons_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."memberships" TO "anon";

GRANT ALL ON TABLE "public"."memberships" TO "authenticated";

GRANT ALL ON TABLE "public"."memberships" TO "service_role";

GRANT ALL ON sequence "public"."memberships_id_seq" TO "anon";

GRANT ALL ON sequence "public"."memberships_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."memberships_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."organization_regions" TO "anon";

GRANT ALL ON TABLE "public"."organization_regions" TO "authenticated";

GRANT ALL ON TABLE "public"."organization_regions" TO "service_role";

GRANT ALL ON sequence "public"."organization_regions_id_seq" TO "anon";

GRANT ALL ON sequence "public"."organization_regions_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."organization_regions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."organizations" TO "anon";

GRANT ALL ON TABLE "public"."organizations" TO "authenticated";

GRANT ALL ON TABLE "public"."organizations" TO "service_role";

GRANT ALL ON sequence "public"."organizations_id_seq" TO "anon";

GRANT ALL ON sequence "public"."organizations_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."organizations_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."regions" TO "anon";

GRANT ALL ON TABLE "public"."regions" TO "authenticated";

GRANT ALL ON TABLE "public"."regions" TO "service_role";

GRANT ALL ON sequence "public"."regions_id_seq" TO "anon";

GRANT ALL ON sequence "public"."regions_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."regions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_assessments" TO "anon";

GRANT ALL ON TABLE "public"."user_assessments" TO "authenticated";

GRANT ALL ON TABLE "public"."user_assessments" TO "service_role";

GRANT ALL ON sequence "public"."self_ skill_assessments_id_seq" TO "anon";

GRANT ALL ON sequence "public"."self_ skill_assessments_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."self_ skill_assessments_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_evaluations" TO "anon";

GRANT ALL ON TABLE "public"."user_evaluations" TO "authenticated";

GRANT ALL ON TABLE "public"."user_evaluations" TO "service_role";

GRANT ALL ON sequence "public"."self_assessments_id_seq" TO "anon";

GRANT ALL ON sequence "public"."self_assessments_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."self_assessments_id_seq" TO "service_role";

GRANT ALL ON sequence "public"."skill_assessments_id_seq" TO "anon";

GRANT ALL ON sequence "public"."skill_assessments_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."skill_assessments_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."skill_groups" TO "anon";

GRANT ALL ON TABLE "public"."skill_groups" TO "authenticated";

GRANT ALL ON TABLE "public"."skill_groups" TO "service_role";

GRANT ALL ON sequence "public"."skill_groups_id_seq" TO "anon";

GRANT ALL ON sequence "public"."skill_groups_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."skill_groups_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_courses" TO "anon";

GRANT ALL ON TABLE "public"."user_courses" TO "authenticated";

GRANT ALL ON TABLE "public"."user_courses" TO "service_role";

GRANT ALL ON sequence "public"."user_courses_id_seq" TO "anon";

GRANT ALL ON sequence "public"."user_courses_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."user_courses_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_lessons" TO "anon";

GRANT ALL ON TABLE "public"."user_lessons" TO "authenticated";

GRANT ALL ON TABLE "public"."user_lessons" TO "service_role";

GRANT ALL ON sequence "public"."user_lessons_id_seq" TO "anon";

GRANT ALL ON sequence "public"."user_lessons_id_seq" TO "authenticated";

GRANT ALL ON sequence "public"."user_lessons_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";

GRANT ALL ON TABLE "public"."users" TO "authenticated";

GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR role "supabase_auth_admin" IN schema "auth"
GRANT ALL ON sequences TO "postgres";

ALTER DEFAULT PRIVILEGES FOR role "supabase_auth_admin" IN schema "auth"
GRANT ALL ON sequences TO "dashboard_user";

ALTER DEFAULT PRIVILEGES FOR role "supabase_auth_admin" IN schema "auth"
GRANT ALL ON functions TO "postgres";

ALTER DEFAULT PRIVILEGES FOR role "supabase_auth_admin" IN schema "auth"
GRANT ALL ON functions TO "dashboard_user";

ALTER DEFAULT PRIVILEGES FOR role "supabase_auth_admin" IN schema "auth"
GRANT ALL ON tables TO "postgres";

ALTER DEFAULT PRIVILEGES FOR role "supabase_auth_admin" IN schema "auth"
GRANT ALL ON tables TO "dashboard_user";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON sequences TO "postgres";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON sequences TO "anon";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON sequences TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON sequences TO "service_role";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON functions TO "postgres";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON functions TO "anon";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON functions TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON functions TO "service_role";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON tables TO "postgres";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON tables TO "anon";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON tables TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR role "postgres" IN schema "public"
GRANT ALL ON tables TO "service_role";

RESET ALL;
