--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by uuid NOT NULL,
    reason text,
    scheduled_end timestamp(6) without time zone NOT NULL,
    scheduled_start timestamp(6) without time zone NOT NULL,
    status character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    updated_by uuid,
    patient_id uuid NOT NULL,
    practitioner_id uuid NOT NULL,
    CONSTRAINT appointment_status_check CHECK (((status)::text = ANY ((ARRAY['BOOKED'::character varying, 'CONFIRMED'::character varying, 'CHECKED_IN'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: assessment_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_answers (
    answer_id uuid NOT NULL,
    answer_type character varying(255) NOT NULL,
    answer_value text,
    answered_at timestamp(6) without time zone NOT NULL,
    question_code character varying(255),
    question_id uuid NOT NULL,
    question_text text,
    session_id uuid NOT NULL,
    question_bank_id uuid,
    CONSTRAINT assessment_answers_answer_type_check CHECK (((answer_type)::text = ANY ((ARRAY['TEXT'::character varying, 'NUMBER'::character varying, 'BOOLEAN'::character varying, 'SINGLE_CHOICE'::character varying, 'MULTIPLE_CHOICE'::character varying, 'DATE'::character varying])::text[])))
);


--
-- Name: assessment_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_sessions (
    session_id uuid NOT NULL,
    completed_at timestamp(6) without time zone,
    notes text,
    started_at timestamp(6) without time zone NOT NULL,
    status character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    doctor_id uuid NOT NULL,
    form_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    form_version_id uuid,
    CONSTRAINT assessment_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'ABANDONED'::character varying])::text[])))
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_name character varying(100),
    entity_id character varying(255),
    action character varying(20),
    old_data jsonb,
    new_data jsonb,
    changed_at timestamp without time zone DEFAULT now(),
    changed_by uuid,
    action_type character varying(255) NOT NULL,
    entity_type character varying(255) NOT NULL,
    ip_address character varying(255),
    "timestamp" timestamp(6) without time zone NOT NULL,
    user_id uuid
);


--
-- Name: care_plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.care_plan (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by uuid NOT NULL,
    end_date date,
    notes text,
    start_date date,
    status character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    updated_by uuid,
    assessment_session_id uuid,
    patient_id uuid NOT NULL,
    CONSTRAINT care_plan_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'ACTIVE'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: care_plan_action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.care_plan_action (
    id uuid NOT NULL,
    action_type character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by uuid NOT NULL,
    description text NOT NULL,
    duration character varying(255),
    frequency character varying(255),
    status character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    updated_by uuid,
    care_plan_id uuid NOT NULL,
    CONSTRAINT care_plan_action_action_type_check CHECK (((action_type)::text = ANY ((ARRAY['MEDICATION'::character varying, 'LIFESTYLE'::character varying, 'FOLLOW_UP'::character varying, 'LAB_TEST'::character varying])::text[]))),
    CONSTRAINT care_plan_action_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: care_plan_goal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.care_plan_goal (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by uuid NOT NULL,
    goal_description text NOT NULL,
    status character varying(255) NOT NULL,
    target_date date,
    target_value character varying(255),
    updated_at timestamp(6) without time zone,
    updated_by uuid,
    care_plan_id uuid NOT NULL,
    CONSTRAINT care_plan_goal_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACHIEVED'::character varying, 'FAILED'::character varying])::text[])))
);


--
-- Name: diagnostic_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diagnostic_forms (
    form_id uuid NOT NULL,
    category character varying(255),
    description character varying(255),
    form_name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    version integer,
    scoring_rules text,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    CONSTRAINT diagnostic_forms_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'ARCHIVED'::character varying])::text[])))
);


--
-- Name: drugs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drugs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    unit character varying(50),
    strength character varying(100)
);


--
-- Name: form_question_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_question_options (
    option_id uuid NOT NULL,
    option_order integer,
    option_text character varying(255) NOT NULL,
    option_value character varying(255),
    points integer,
    question_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: form_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_questions (
    question_id uuid NOT NULL,
    display_condition text,
    help_text text,
    max_value double precision,
    min_value double precision,
    options text,
    points integer,
    question_code character varying(255) NOT NULL,
    question_order integer NOT NULL,
    question_text text NOT NULL,
    question_type character varying(255) NOT NULL,
    required boolean,
    unit character varying(255),
    section_id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    CONSTRAINT form_questions_question_type_check CHECK (((question_type)::text = ANY ((ARRAY['SINGLE_CHOICE'::character varying, 'MULTIPLE_CHOICE'::character varying, 'TEXT'::character varying, 'NUMBER'::character varying, 'DATE'::character varying, 'BOOLEAN'::character varying])::text[])))
);


--
-- Name: form_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_sections (
    section_id uuid NOT NULL,
    section_name character varying(255) NOT NULL,
    section_order integer NOT NULL,
    form_id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone
);


--
-- Name: form_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_name character varying(200),
    version_number integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: guidelines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guidelines (
    id uuid NOT NULL,
    category character varying(255),
    created_at timestamp(6) without time zone,
    owner character varying(255),
    status character varying(255),
    title character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone
);


--
-- Name: icd10_code; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.icd10_code (
    code character varying(20) NOT NULL,
    is_billable boolean,
    chapter character varying(255),
    created_at timestamp(6) without time zone NOT NULL,
    created_by uuid NOT NULL,
    description text NOT NULL,
    updated_at timestamp(6) without time zone,
    updated_by uuid
);


--
-- Name: logic_conditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logic_conditions (
    condition_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    condition_expression text NOT NULL,
    evaluation_order integer,
    recommendation text,
    result_label character varying(255),
    result_value character varying(255),
    formula_id uuid NOT NULL
);


--
-- Name: logic_formulas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logic_formulas (
    formula_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    expression text,
    formula_code character varying(255),
    formula_name character varying(255) NOT NULL
);


--
-- Name: logic_variables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logic_variables (
    variable_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    unit character varying(255),
    variable_code character varying(255),
    variable_name character varying(255) NOT NULL
);


--
-- Name: patient_diagnosis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_diagnosis (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by uuid NOT NULL,
    diagnosed_at timestamp(6) without time zone NOT NULL,
    diagnosis_type character varying(255) NOT NULL,
    notes text,
    updated_at timestamp(6) without time zone,
    updated_by uuid,
    assessment_session_id uuid,
    icd10_code character varying(20) NOT NULL,
    patient_id uuid NOT NULL,
    CONSTRAINT patient_diagnosis_diagnosis_type_check CHECK (((diagnosis_type)::text = ANY ((ARRAY['PRIMARY'::character varying, 'SECONDARY'::character varying])::text[])))
);


--
-- Name: patient_form_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_form_submissions (
    submission_id uuid NOT NULL,
    diagnostic_result text,
    notes character varying(255),
    risk_level character varying(255),
    status character varying(255) NOT NULL,
    submission_data text,
    total_score double precision,
    doctor_id uuid NOT NULL,
    form_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    CONSTRAINT patient_form_submissions_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'COMPLETED'::character varying, 'REVIEWED'::character varying])::text[])))
);


--
-- Name: patient_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_visits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid,
    appointment_id uuid,
    visit_date timestamp without time zone,
    doctor_id uuid,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    patient_id uuid NOT NULL,
    address character varying(255),
    allergies character varying(255),
    current_medications character varying(255),
    date_of_birth date NOT NULL,
    email character varying(255),
    full_name character varying(255) NOT NULL,
    gender character varying(255) NOT NULL,
    medical_history character varying(255),
    notes character varying(255),
    patient_code character varying(255) NOT NULL,
    phone_number character varying(255),
    status character varying(255) NOT NULL,
    doctor_id uuid,
    CONSTRAINT patients_gender_check CHECK (((gender)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT patients_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'ARCHIVED'::character varying])::text[])))
);


--
-- Name: prescription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prescription (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by uuid NOT NULL,
    issued_at timestamp(6) without time zone,
    status character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    updated_by uuid,
    care_plan_id uuid,
    diagnosis_id uuid,
    patient_id uuid NOT NULL,
    CONSTRAINT prescription_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'ISSUED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: prescription_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prescription_item (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by uuid NOT NULL,
    dosage character varying(255) NOT NULL,
    drug_name character varying(255) NOT NULL,
    duration character varying(255),
    frequency character varying(255),
    instructions text,
    route character varying(255),
    updated_at timestamp(6) without time zone,
    updated_by uuid,
    prescription_id uuid NOT NULL
);


--
-- Name: question_bank; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_bank (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    label text NOT NULL,
    question_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp(6) without time zone,
    question_code character varying(255),
    question_text text
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    replaced_by uuid,
    revoked_at timestamp(6) without time zone,
    token_hash character varying(128) NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    role_id uuid NOT NULL,
    role_code character varying(255) NOT NULL,
    role_name character varying(255) NOT NULL,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp(6) without time zone,
    email character varying(255),
    full_name character varying(255),
    password_hash character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    role_id uuid NOT NULL,
    updated_at timestamp(6) without time zone
);


--
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointment (id, created_at, created_by, reason, scheduled_end, scheduled_start, status, updated_at, updated_by, patient_id, practitioner_id) FROM stdin;
\.


--
-- Data for Name: assessment_answers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assessment_answers (answer_id, answer_type, answer_value, answered_at, question_code, question_id, question_text, session_id, question_bank_id) FROM stdin;
4676b90a-8be2-458c-9637-591a4eb04026	TEXT	2005	2026-02-14 19:26:56.57477	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
4f5d52b8-d8fe-4b23-b330-21feeed3f809	TEXT	200	2026-02-14 19:26:55.219316	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
0438795f-fc7d-43b2-b22a-647425cdb3b2	TEXT	20	2026-02-14 19:26:55.056071	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
a5612686-da94-4de6-8e80-dff340676914	TEXT	aaaaaaaaaa	2026-02-14 19:26:50.550865	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
c25a99a0-59b5-4e66-b3f6-9558b6f9dd8a	TEXT	aaaaaa	2026-02-14 19:26:50.421443	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
3548e9ca-126a-415b-927d-163dd486c9d6	TEXT	aaaa	2026-02-14 19:26:50.350262	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
1becd532-a2e6-45ee-8f07-19144a52f761	TEXT	aaaaaa	2026-02-14 17:43:28.171888	2. số điện thoại	da9cac15-1d6e-414e-878f-1964451a34a4	liên lạc	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72
4d09092f-28a0-4e46-88ab-e168017b855a	TEXT	aaaaaa	2026-02-14 17:43:19.695845	2. số điện thoại	da9cac15-1d6e-414e-878f-1964451a34a4	liên lạc	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72
71864412-3c8c-4b3b-9945-f4d8a42d4574	TEXT	aaaaa	2026-02-14 17:43:19.659513	2. số điện thoại	da9cac15-1d6e-414e-878f-1964451a34a4	liên lạc	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72
142bbcdd-fae1-4a2b-a195-d73d30bde92e	TEXT	aaaa	2026-02-14 17:43:19.623938	2. số điện thoại	da9cac15-1d6e-414e-878f-1964451a34a4	liên lạc	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72
defb9daa-5857-4361-99db-3b0b71ab85dd	TEXT	aaa	2026-02-14 17:43:19.594607	2. số điện thoại	da9cac15-1d6e-414e-878f-1964451a34a4	liên lạc	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72
bc890f93-aac3-4ab3-856a-ec2a831784fd	TEXT	aa	2026-02-14 17:43:19.580678	2. số điện thoại	da9cac15-1d6e-414e-878f-1964451a34a4	liên lạc	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72
41d76647-8fd1-4a69-a83b-ef2065c93834	TEXT	a	2026-02-14 17:43:19.569624	2. số điện thoại	da9cac15-1d6e-414e-878f-1964451a34a4	liên lạc	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72
2ee82eb3-c1e2-46a3-b217-10bc9c9f2a84	TEXT	â	2026-02-14 17:43:19.537045	2. số điện thoại	da9cac15-1d6e-414e-878f-1964451a34a4	liên lạc	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72
f3dadb53-e4b2-413b-ace6-9c4fa36f8d47	TEXT	a	2026-02-14 17:43:19.277843	2. số điện thoại	da9cac15-1d6e-414e-878f-1964451a34a4	liên lạc	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72
8381ef0d-4952-41af-a7c9-51b260d8ea87	TEXT	aaaa	2026-02-14 17:43:28.175404	4. Giới 	fc6e5195-e4de-44e6-ae73-7bd1c55f8ba1	giới tính 	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	6aa0aa0b-a192-4d18-9965-3c2b37a00049
eff63609-9b9a-48e6-a751-82fd17a60d68	TEXT	aaaa	2026-02-14 17:43:21.818663	4. Giới 	fc6e5195-e4de-44e6-ae73-7bd1c55f8ba1	giới tính 	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	6aa0aa0b-a192-4d18-9965-3c2b37a00049
ddba3e93-7a0f-48c5-b603-dd7c6c204c77	TEXT	aaa	2026-02-14 17:43:21.800509	4. Giới 	fc6e5195-e4de-44e6-ae73-7bd1c55f8ba1	giới tính 	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	6aa0aa0b-a192-4d18-9965-3c2b37a00049
6ae34b7e-c6a3-4c0b-a65d-e0e7f299490b	TEXT	aa	2026-02-14 17:43:21.787717	4. Giới 	fc6e5195-e4de-44e6-ae73-7bd1c55f8ba1	giới tính 	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	6aa0aa0b-a192-4d18-9965-3c2b37a00049
f1e37499-b9d8-4142-bc7c-a0b82e367038	TEXT	a	2026-02-14 17:43:21.778368	4. Giới 	fc6e5195-e4de-44e6-ae73-7bd1c55f8ba1	giới tính 	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	6aa0aa0b-a192-4d18-9965-3c2b37a00049
5a1cb74d-4dcc-4168-b691-50cbb9477384	TEXT	â	2026-02-14 17:43:21.748893	4. Giới 	fc6e5195-e4de-44e6-ae73-7bd1c55f8ba1	giới tính 	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	6aa0aa0b-a192-4d18-9965-3c2b37a00049
3f195290-4396-4bf0-9296-84ba7b082901	TEXT	a	2026-02-14 17:43:21.477666	4. Giới 	fc6e5195-e4de-44e6-ae73-7bd1c55f8ba1	giới tính 	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	6aa0aa0b-a192-4d18-9965-3c2b37a00049
47f3909c-2cc0-48f9-ad6e-2c7239f60ba4	TEXT	aaaaa	2026-02-14 17:43:28.181119	5. Nghề nghiệp	8c9e6c7a-1086-4ee8-9a1a-eaf6c427bb35	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	9e63dea5-e746-4ac1-8330-82c244c8b8aa
47602035-ff81-4dde-adf3-5e0c6ed11324	TEXT	aaaaa	2026-02-14 17:43:22.923389	5. Nghề nghiệp	8c9e6c7a-1086-4ee8-9a1a-eaf6c427bb35	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	9e63dea5-e746-4ac1-8330-82c244c8b8aa
b50e3f16-0210-450d-aa52-0804180d76a8	TEXT	aaaa	2026-02-14 17:43:22.896347	5. Nghề nghiệp	8c9e6c7a-1086-4ee8-9a1a-eaf6c427bb35	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	9e63dea5-e746-4ac1-8330-82c244c8b8aa
f7b3be6d-062e-425d-8d7c-32dae1aa66dc	TEXT	aaa	2026-02-14 17:43:22.871504	5. Nghề nghiệp	8c9e6c7a-1086-4ee8-9a1a-eaf6c427bb35	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	9e63dea5-e746-4ac1-8330-82c244c8b8aa
409388ed-36d2-44e1-83fc-d9a2541da11f	TEXT	aa	2026-02-14 17:43:22.850418	5. Nghề nghiệp	8c9e6c7a-1086-4ee8-9a1a-eaf6c427bb35	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	9e63dea5-e746-4ac1-8330-82c244c8b8aa
8d331b0c-d2cd-42bc-8716-592976b57485	TEXT	a	2026-02-14 17:43:22.836785	5. Nghề nghiệp	8c9e6c7a-1086-4ee8-9a1a-eaf6c427bb35	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	9e63dea5-e746-4ac1-8330-82c244c8b8aa
0793d490-ac37-4c47-a467-ce95afa211c3	TEXT	â	2026-02-14 17:43:22.803812	5. Nghề nghiệp	8c9e6c7a-1086-4ee8-9a1a-eaf6c427bb35	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	9e63dea5-e746-4ac1-8330-82c244c8b8aa
a1fdb0cb-c24f-4a9f-87ed-417bca72e495	TEXT	a	2026-02-14 17:43:22.532312	5. Nghề nghiệp	8c9e6c7a-1086-4ee8-9a1a-eaf6c427bb35	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	9e63dea5-e746-4ac1-8330-82c244c8b8aa
66a845a8-3fac-4790-9e24-1751fd163932	TEXT	2005	2026-02-14 19:26:55.476993	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
f2ed3683-8b26-4025-87fa-bbb03c82177a	TEXT	2	2026-02-14 19:26:54.824144	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
cdd5d820-950f-4527-a2f0-d3b96ceacf47	TEXT	aaaaaaaaaaa	2026-02-14 19:26:50.580017	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
7a135072-ec14-41ae-a3d3-940c6c76cd94	TEXT	aaaaaaaaa	2026-02-14 19:26:50.518757	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
1114964c-931f-45e1-89eb-40861978905a	TEXT	aaaaaaaa	2026-02-14 19:26:50.491311	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
fc50a9f1-300d-41d2-a9a5-9fc88464a1f3	TEXT	aaaaaaa	2026-02-14 19:26:50.462904	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
d2970463-301a-4d39-83f1-d1ea1b0e3ca5	TEXT	aaaaa	2026-02-14 19:26:50.395098	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
950f0cf3-6a57-4308-85a9-ca3753116f25	TEXT	aaa	2026-02-14 19:26:50.329162	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
02109be2-3fc9-4044-a5d8-780b27440a0b	TEXT	aa	2026-02-14 19:26:50.319102	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
55157d33-4d3c-4b42-b968-9bbbf0815d1d	TEXT	a	2026-02-14 19:26:50.307587	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
95fe6d8f-b753-4808-9a49-c7ac59aab690	TEXT	â	2026-02-14 19:26:50.277683	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
c5c62a97-5bb7-44df-826a-fa535ba623fc	TEXT	a	2026-02-14 19:26:50.015446	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	ca06deed-71b1-42d2-8f9a-d3c4387422c7	06cbf47c-c177-429b-adc2-f95084111bd0
288908a7-251b-4792-a8eb-cd86c259bf8a	TEXT	aaaaa	2026-02-14 17:43:28.179118	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	06cbf47c-c177-429b-adc2-f95084111bd0
d72d77e0-ffaa-41ee-bf95-4426a1d938f5	TEXT	aaaaa	2026-02-14 17:43:20.967387	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	06cbf47c-c177-429b-adc2-f95084111bd0
799fc57a-3561-4794-aa8d-5704c3c6af24	TEXT	aaaa	2026-02-14 17:43:20.938222	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	06cbf47c-c177-429b-adc2-f95084111bd0
c0efd04e-2df8-4591-9336-d12d82c65cf1	TEXT	aaa	2026-02-14 17:43:20.90845	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	06cbf47c-c177-429b-adc2-f95084111bd0
c85131e1-9924-432a-a2fb-bd9c0b9cfd9d	TEXT	aa	2026-02-14 17:43:20.895248	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	06cbf47c-c177-429b-adc2-f95084111bd0
6f20da60-8be9-4f90-9132-6798cc585d66	TEXT	a	2026-02-14 17:43:20.883625	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	06cbf47c-c177-429b-adc2-f95084111bd0
6dbbbe33-440a-4105-9ddb-e2ec08d0fec9	TEXT	â	2026-02-14 17:43:20.852521	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	06cbf47c-c177-429b-adc2-f95084111bd0
1e93b6c0-3aad-4ae7-9edc-5ce45e7c61b1	TEXT	a	2026-02-14 17:43:20.591933	3. Tuổi / năm sinh	e0f9c969-ba28-4f92-a4ee-384cc33cb84b	lấy năm sinh từ V1	d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	06cbf47c-c177-429b-adc2-f95084111bd0
\.


--
-- Data for Name: assessment_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assessment_sessions (session_id, completed_at, notes, started_at, status, updated_at, doctor_id, form_id, patient_id, form_version_id) FROM stdin;
767b87e7-6d82-415e-96b0-a94023cc2af2	\N	\N	2026-02-14 17:42:43.615126	IN_PROGRESS	2026-02-14 17:42:43.615126	7ce36c0a-0752-4809-8c8c-28f6385dd0bd	d57a9094-7b56-49da-81c5-ec7c1bd8afd3	0d59ab2c-cff8-4293-9c0a-e3d4775cb6f7	\N
da709314-ccd8-4936-b2c4-19c3b76b5ca9	2026-02-14 17:43:01.846945		2026-02-14 17:42:43.649837	COMPLETED	2026-02-14 17:43:01.846945	7ce36c0a-0752-4809-8c8c-28f6385dd0bd	d57a9094-7b56-49da-81c5-ec7c1bd8afd3	0d59ab2c-cff8-4293-9c0a-e3d4775cb6f7	\N
ca06deed-71b1-42d2-8f9a-d3c4387422c7	2026-02-14 19:26:56.59305		2026-02-14 19:26:45.613398	COMPLETED	2026-02-14 19:26:56.59305	7ce36c0a-0752-4809-8c8c-28f6385dd0bd	d57a9094-7b56-49da-81c5-ec7c1bd8afd3	0d59ab2c-cff8-4293-9c0a-e3d4775cb6f7	\N
2240d2e2-668f-429f-b8ee-91baaa3097a3	\N	\N	2026-02-14 21:33:40.616122	IN_PROGRESS	2026-02-14 21:33:40.616122	7ce36c0a-0752-4809-8c8c-28f6385dd0bd	d57a9094-7b56-49da-81c5-ec7c1bd8afd3	0d59ab2c-cff8-4293-9c0a-e3d4775cb6f7	\N
37cdb071-2c2d-4c80-abd9-81d0ee592852	\N	\N	2026-02-14 21:33:40.677638	IN_PROGRESS	2026-02-14 21:33:40.677638	7ce36c0a-0752-4809-8c8c-28f6385dd0bd	d57a9094-7b56-49da-81c5-ec7c1bd8afd3	0d59ab2c-cff8-4293-9c0a-e3d4775cb6f7	\N
d9d3ef4a-5360-4171-b7cf-f0169ce10fcc	2026-02-14 17:43:28.208999		2026-02-14 17:43:17.567782	COMPLETED	2026-02-14 17:43:28.208999	7ce36c0a-0752-4809-8c8c-28f6385dd0bd	d57a9094-7b56-49da-81c5-ec7c1bd8afd3	0d59ab2c-cff8-4293-9c0a-e3d4775cb6f7	\N
b8adc0e9-e38f-4beb-8932-803c96aa61b3	\N	\N	2026-02-14 19:26:45.576883	IN_PROGRESS	2026-02-14 19:26:45.576883	7ce36c0a-0752-4809-8c8c-28f6385dd0bd	d57a9094-7b56-49da-81c5-ec7c1bd8afd3	0d59ab2c-cff8-4293-9c0a-e3d4775cb6f7	\N
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_log (id, entity_name, entity_id, action, old_data, new_data, changed_at, changed_by, action_type, entity_type, ip_address, "timestamp", user_id) FROM stdin;
\.


--
-- Data for Name: care_plan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.care_plan (id, created_at, created_by, end_date, notes, start_date, status, updated_at, updated_by, assessment_session_id, patient_id) FROM stdin;
\.


--
-- Data for Name: care_plan_action; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.care_plan_action (id, action_type, created_at, created_by, description, duration, frequency, status, updated_at, updated_by, care_plan_id) FROM stdin;
\.


--
-- Data for Name: care_plan_goal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.care_plan_goal (id, created_at, created_by, goal_description, status, target_date, target_value, updated_at, updated_by, care_plan_id) FROM stdin;
\.


--
-- Data for Name: diagnostic_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.diagnostic_forms (form_id, category, description, form_name, status, version, scoring_rules, created_at, updated_at) FROM stdin;
d57a9094-7b56-49da-81c5-ec7c1bd8afd3	GENERAL_INTAKE	Bộ câu hỏi thu thập thông tin đầu vào	Khảo sát sức khỏe tổng quát	ACTIVE	1	\N	\N	\N
\.


--
-- Data for Name: drugs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.drugs (id, name, unit, strength) FROM stdin;
\.


--
-- Data for Name: form_question_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_question_options (option_id, option_order, option_text, option_value, points, question_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: form_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_questions (question_id, display_condition, help_text, max_value, min_value, options, points, question_code, question_order, question_text, question_type, required, unit, section_id, created_at, updated_at) FROM stdin;
da9cac15-1d6e-414e-878f-1964451a34a4	\N	câu trả lời ngắn	\N	\N	\N	\N	2. số điện thoại	1	liên lạc	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
e0f9c969-ba28-4f92-a4ee-384cc33cb84b	\N	nhập năm sinh: tuổi = năm hiện tại - năm sinh	\N	\N	\N	\N	3. Tuổi / năm sinh	2	lấy năm sinh từ V1	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
fc6e5195-e4de-44e6-ae73-7bd1c55f8ba1	\N		\N	\N	\N	\N	4. Giới 	3	giới tính 	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
8c9e6c7a-1086-4ee8-9a1a-eaf6c427bb35	\N	câu trả lời ngắn/ có thể dùng dạng bảng check , nếu có công việc củ thì tik thêm cột	\N	\N	\N	\N	5. Nghề nghiệp	4	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
1dce2c32-3418-436a-8ace-4f5a5b663bcd	\N	câu trả lời lựa chọn: nhẹ-trung bình-nặng	\N	\N	[]	\N	- Gắng sức thể chất	5	Công việc cần dùng nhiều sức, mang vác, đứng/ngồi lâu, thao tác lặp đi lặp lại	SINGLE_CHOICE	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
3daec21a-1bf5-4b86-bed4-1278b12c1003	\N	câu trả lời lựa chọn: nhẹ-trung bình-nặng	\N	\N	[]	\N	- Tiếp xúc bụi	6	Thường xuyên tiếp xúc với bụi trong không khí – bụi đất, xi măng, gỗ, kim loại...	SINGLE_CHOICE	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
40bc83fc-3f9c-4107-bc5a-fed1e4e40089	\N	câu trả lời lựa chọn: nhẹ-trung bình-nặng	\N	\N	[]	\N	- Tiếp xúc hóa chất	7	Làm việc với sơn, dung môi, thuốc trừ sâu, chất tẩy, xăng dầu...	SINGLE_CHOICE	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
4d620d99-187e-4147-be10-8c7498b54742	\N	câu trả lời lựa chọn: nhẹ-trung bình-nặng	\N	\N	[]	\N	- Khác: ghi rõ	8	tính chất khác mà bạn nghĩ nó ảnh hưởng đến sức khỏe của bạn	SINGLE_CHOICE	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
18e8639f-a037-4ac9-8762-c67e430cbcaf	\N	câu trả lời ngắn. phân ra:\n1. mức hoạt động trung bình\n2. Mức hoặt động nặng\nVới mỗi mwucs hoạt động trả lời 2 câu bến dưới	\N	\N	\N	\N	  6.2.1. cường độ	9	Hoạt động thể lực làm tim đập nhanh, thở nhanh, đổ mồ hôi.\n - vẫn nói chuyện được: => mức hoạt động trung bình\n - thở gấp, khó nói trọn câu => mức hoạt động nặng	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
b0a0ef92-b788-4614-b76b-dc9a99f0154e	\N	số ngày	\N	\N	\N	\N	  6.2.2 tần suất	10	Các hoạt động đó thực hiện bao nhiêu ngày 1 tuần	NUMBER	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
07177fba-85cc-4ee5-bc8c-8c4756132959	\N	số phút	\N	\N	\N	\N	  6.2.3 thơi gian	11	Các hoạt động đó thực hiện bao nhiêu giờ 1 ngày	NUMBER	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
71184369-ca29-415e-bb38-4bb1572b68d1	\N		\N	\N	\N	\N	8. Kinh nguyệt	12	áp dụng khi 4.1 chọn nữ, trừ trường hợp 4.3.1 KH đã phẫu thuật loại bỏ tư cung 	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
c0c18e2b-32fe-4970-9a63-61ddd0337b37	\N	tuổi	\N	\N	\N	\N	8.2.1 tuổi mãn kinh	13	Áp dụng khi 8.2 chọn 4 mãn kinh. Tuổi mãn kinh	NUMBER	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
b4d6b371-8f41-475b-9806-9273ae528e1d	\N		\N	\N	\N	\N	9. Tiền sử sản khoa	14	áp dụng khi 4.1 chọn là nữ 	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
f7dc0316-a94c-46c5-a423-58ec9782fa8e	\N	lựa chọn. 1. chưa từng, 2. 1 lần, 3 >=2 lần	\N	\N	["lựa chọn.","chưa từng,","1 lần, 3 >=2 lần"]	\N	  9.5.1 sanh mổ	15	hỏi số lần sanh mổ	SINGLE_CHOICE	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
62077390-66d7-4096-ac86-8f9fb6a9a5f2	\N	1. từng mắc STI, 2: có triệu chứng nghi STI: loét, đau, tiểu buốt, khí hư...), 3: không có, 4: khác:....	\N	\N	\N	\N	 10.5 Bệnh lý STI	16	 với mục từng mắc STI có thể liên hệ mục tiền sử bệnh tật 	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
6f030353-7c0b-4487-afe8-4fd33dc8185c	\N	cm	\N	\N	\N	\N	11. Chiều cao	17	chiều cao hiện tại	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
531e28c4-bb39-4b5d-9ae9-9ec3c9852ff5	\N	kg	\N	\N	\N	\N	12. cân nặng	18	Cân nặng hiện tại	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
2c695b70-6c3f-441c-a0ad-0c4562254dab	\N	cm	\N	\N	\N	\N	13. vòng eo/mông	19	Cách đo chuẩn (WHO):\n– Đo tại điểm giữa bờ dưới xương sườn cuối và mào chậu, khi thở ra nhẹ\n– Đơn vị: cm	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
71b0fd49-4b11-4439-8aed-80f331620429	\N	số chu kỳ/phút	\N	\N	\N	\N	14. Tần số tim	20	Nhịp tim trung bình, (khi đi khám, đo điện tim, máy huyết áp)	NUMBER	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
c2eb3ff9-6be3-4075-9566-bbe325d66b1d	\N	1. không, 2: ăn chay (>10 ngày/ tháng), 3. keto, 4. khác:	\N	\N	\N	\N	15. chế độ ăn uống	21	chế độ ăn đặc biệt	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
3a5d73ac-2775-4819-8cb6-8406025c78be	\N	Lựa chọn: 1 chưa từng hút, 2: đã từng hút nhưng đã bỏ, 3. đang hút	\N	\N	["Lựa chọn: 1 chưa từng hút","2: đã từng hút nhưng đã bỏ","3. đang hút"]	\N	17. Hút thuốc lá	22	tính trạng hút thuốc lá hiện tại	SINGLE_CHOICE	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
c3d2ff47-0cde-41b8-957b-61e71d8a81ca	\N	sô năm	\N	\N	\N	\N	 17.2 Thơi gian hút	23	khi 17 chọn 2 or 3\nThời gian hút	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
a8e1d9ec-bff6-4cb0-9cdd-f2e37beffd8c	\N	số điếu/ngày	\N	\N	\N	\N	 17.2 số điếu/ngày	24	khi 17 chọn 2 or 3\ntrung bình số điều hút trên ngày	NUMBER	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
9e4640ce-cf5a-4e86-a637-2a26997755f8	\N	1. dị ứng thuốc\n2.dị ứng thức ăn\n3. phản ứng sau tiêm chủng\n4. dị ứng khác: hóa chất/ ong đót, phân hoa, dị nguyên khác.... \n5. chưa ghi nhân	\N	\N	\N	\N	19. tiền sử dị ứng	25	lựa chọn và ghi rõ 	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
b4fee925-91ae-4d27-924e-a8672ebd0ce5	\N	1. đái tháo đường type 1\n2. đía tháo dường type 2. \n3. tiền sử đại tháo đường thai kỳ\n4. tiền đái tháo đường\n5 cường giáp\n6. suy giáp\n7. rối loạn lipid máu\n8. suy sinh dục: bệnh gây giảm hormon sinh dục	\N	\N	\N	\N	  21.2.2 Nôi tiết	26	Anh/chị có từng được chẩn đoán bệnh nội tiết hay chuyển hóa nào không?\n(ví dụ: tiểu đường (type 1,2, tiểu đường thai kỳ), tiền đái tháo đường, bệnh tuyến giáp (suy giáp, cường giáp, viêm tuyến giáp), mỡ máu cao, bệnh tuyến yên (u tuyến yên, tăng prolactin...), tuyến thượng thận (u tyến thượng thận, hội chứng cushing, suy thượng thận)....	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
9899911f-4b81-4a57-87fa-1661dede5cca	\N	1. Hen phế quản\n2. COPD\n3. Lao phổi \n	\N	\N	\N	\N	  21.2.4 Hô hấp	27	Anh/chị có từng được chẩn đoán bệnh hô hấp nào không? hen phế quản, COPD, lao phổi, lao ngoài phổi, viêm phổi tái diễn (nhập viện vì phổi: viêm phổi, covid), bệnh phổi mô kẻ, xơ phổi,dãn phế quản, ngưng thở khi ngủ...\n	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
974e8d3c-ce41-414b-85fc-a903326de98b	\N		\N	\N	\N	\N	   21.2.12 mắt	28	Anh/chị có từng được chẩn đoán bệnh về mắt không? tật khúc xạ (cận viễn, loạn, lão) thủy tinh thể, giác mạc...	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
e3ff17a7-06b4-4169-9168-4652e1104955	\N		\N	\N	\N	\N	   21.2.13 da liễu	29	Anh/chị có từng được chẩn đoán bệnh về da mạn tính không?  viêm da cơ địa, vây nến, viêm da tiếp xúc mạn, mề đay mạn tính	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
e8c38bf9-ea87-475a-8d32-57bdbf24d8d7	\N	Lựa chọn:\nĐầy đủ\nChưa tiêm / tiêm không đầy đủ\nkhông rõ	\N	\N	[]	\N	 22.1 TCMR	30	Trước dây anh chị đã tiêm ngừa đầy đủ theo chương trình tiêm chủng mở rộng chưa?	SINGLE_CHOICE	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
69519673-cf6f-427e-8297-af6f478cb432	\N	các chỉ số cố định, ưu tiên đơn vị mmol/L hoặc cả đơn vị mg/dl\n1. Cholesterol total:\n1.1: triglyceride:\n2. LDL\n2. HDL\n3. GLU\n4. Hba1c\n5. Creatinin => độ lọc cầu thận\n5.1 ACR: \n6. Mật độ xương phương pháp DEXA\n- các chỉ số theo dõi theo bệnh lý:\n- có thể thêm bớt khi cập nhật kết quả	\N	\N	\N	\N	27. cận lâm sàng	31	KH scan chụp tất cả các kết quả xét nghiệm chẩn đoán hình ảnh, cận lâm sàng. CB CSKH. BS sẽ lọc ra các chỉ số có ý nghĩa điền cụ thể hoặc chỉ cần ghi kết quả bình thường hay bất thường. hiển thị theo thời gian và theo cận lâm sàng. ví dụ: \n theo thời gian: ngày 5/1/2024 : thực hiện các xét nghiệm CTM, glu, thận, siêu âm x quang\n Theo cận lâm sàng: khi nhấp vào đường huyết sẽ hiện các kết quả theo thười gian các lần thực hiện	NUMBER	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
d2ae6235-a176-439c-9565-edb5f0949a5b	\N	1. có thực hiện\n2. chưa thực hiện\n	\N	\N	\N	\N	Kham lâm sàng	32	Ghi nhận khi BS thăm khám trực tiếp	TEXT	f	\N	1092ee95-5139-49c7-b9e8-68188dc05458	\N	\N
\.


--
-- Data for Name: form_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_sections (section_id, section_name, section_order, form_id, created_at, updated_at) FROM stdin;
1092ee95-5139-49c7-b9e8-68188dc05458	PHẦN THÔNG TIN CHUNG	1	d57a9094-7b56-49da-81c5-ec7c1bd8afd3	\N	\N
\.


--
-- Data for Name: form_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_versions (id, form_name, version_number, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: guidelines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.guidelines (id, category, created_at, owner, status, title, updated_at) FROM stdin;
\.


--
-- Data for Name: icd10_code; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.icd10_code (code, is_billable, chapter, created_at, created_by, description, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: logic_conditions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.logic_conditions (condition_id, created_at, updated_at, condition_expression, evaluation_order, recommendation, result_label, result_value, formula_id) FROM stdin;
\.


--
-- Data for Name: logic_formulas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.logic_formulas (formula_id, created_at, updated_at, expression, formula_code, formula_name) FROM stdin;
\.


--
-- Data for Name: logic_variables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.logic_variables (variable_id, created_at, updated_at, unit, variable_code, variable_name) FROM stdin;
\.


--
-- Data for Name: patient_diagnosis; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_diagnosis (id, created_at, created_by, diagnosed_at, diagnosis_type, notes, updated_at, updated_by, assessment_session_id, icd10_code, patient_id) FROM stdin;
\.


--
-- Data for Name: patient_form_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_form_submissions (submission_id, diagnostic_result, notes, risk_level, status, submission_data, total_score, doctor_id, form_id, patient_id, created_at, updated_at) FROM stdin;
86dd30ca-b5e2-4f17-853e-551adfd547a3	{}		LOW	COMPLETED	{"sessionId":"ca06deed-71b1-42d2-8f9a-d3c4387422c7","answers":[{"questionId":"e0f9c969-ba28-4f92-a4ee-384cc33cb84b","questionCode":"3. Tuổi / năm sinh","questionText":"lấy năm sinh từ V1","questionType":"TEXT","answerValue":"2005"}]}	0	7ce36c0a-0752-4809-8c8c-28f6385dd0bd	d57a9094-7b56-49da-81c5-ec7c1bd8afd3	0d59ab2c-cff8-4293-9c0a-e3d4775cb6f7	\N	\N
\.


--
-- Data for Name: patient_visits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_visits (id, patient_id, appointment_id, visit_date, doctor_id, created_at) FROM stdin;
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patients (patient_id, address, allergies, current_medications, date_of_birth, email, full_name, gender, medical_history, notes, patient_code, phone_number, status, doctor_id) FROM stdin;
0d59ab2c-cff8-4293-9c0a-e3d4775cb6f7	Số 20 phường Xã Lợi	qqqqqq	qqqqqqqqq	2005-03-31	hau05.ruan@gmail.com	Nguyễn Văn Tèo	MALE	qqqqqq	qqqqqqqqq	202602140001	0969513657	ACTIVE	7ce36c0a-0752-4809-8c8c-28f6385dd0bd
f1e9cb96-7701-4cf8-b3e0-9ed20832edb8	Số 20 phường Xã Lợi	qqqqqqq	qqqqqqqq	2007-02-22	hau05.ruan@gmail.com	Nguyen Hoang Hao	MALE	qqqqqqqq	qqqqqqq	202602140002	0969513657	ACTIVE	7ce36c0a-0752-4809-8c8c-28f6385dd0bd
5e7bacd5-7361-40f4-9116-2715e0641cec	aaaa	aaaaaaa	aaaaa	2005-02-23	hau05.ruan@gmail.com	Nguyen Hoang Hao	MALE	aaaaa	aaaaaaa	202602140003	0969513657	ACTIVE	7ce36c0a-0752-4809-8c8c-28f6385dd0bd
d93295af-7ecf-4494-9bcc-2bc2ec36e100	aaaa	11111111	111111111	2004-03-03	hau05.ruan@gmail.com	wwwwwwwwwww	MALE	11111111111	1111111111	202602140004	0969513657	ACTIVE	7ce36c0a-0752-4809-8c8c-28f6385dd0bd
ed56fd4c-d0e2-444f-9f01-e6a126507343	aaaa	333222222	ư332r	2004-03-03	hau05.ruan@gmail.com	wwwwwwwwwww	MALE	wwwwwwwww	3333333	202602140005	0969513657	ACTIVE	7ce36c0a-0752-4809-8c8c-28f6385dd0bd
0c26bffd-effb-406f-9efb-ad022c36ea62	aaaa	qfefe	qqq	2004-03-03	hau05.ruan@gmail.com	wwwwwwwwwww	MALE	qqqqq	fefef	202602140006	0969513657	ACTIVE	7ce36c0a-0752-4809-8c8c-28f6385dd0bd
\.


--
-- Data for Name: prescription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prescription (id, created_at, created_by, issued_at, status, updated_at, updated_by, care_plan_id, diagnosis_id, patient_id) FROM stdin;
\.


--
-- Data for Name: prescription_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prescription_item (id, created_at, created_by, dosage, drug_name, duration, frequency, instructions, route, updated_at, updated_by, prescription_id) FROM stdin;
\.


--
-- Data for Name: question_bank; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.question_bank (id, code, label, question_type, is_active, created_at, updated_at, question_code, question_text) FROM stdin;
3f1f1a3a-efa8-47ba-92c6-2c2ac90faa72	2. số điện thoại	liên lạc	TEXT	t	2026-02-20 09:18:13.248974	\N	\N	\N
6aa0aa0b-a192-4d18-9965-3c2b37a00049	4. Giới 	giới tính 	TEXT	t	2026-02-20 09:18:13.248974	\N	\N	\N
9e63dea5-e746-4ac1-8330-82c244c8b8aa	5. Nghề nghiệp	gồm 2 phần :\nHiện tại :Ghi rõ công việc chính (chiếm nhiều thười gian nhất) đang làm hiện tại\nTrước đây: liệt kê tất cả các công việc bạn đã từng làm từ trước đến nay (kể cả đã nghỉ), nếu từng làm liên tục từ 6 tháng trở lên và có các yêu tố tính chất công việc trên từ mức độ trung bình trở lên	TEXT	t	2026-02-20 09:18:13.248974	\N	\N	\N
06cbf47c-c177-429b-adc2-f95084111bd0	3. Tuổi / năm sinh	lấy năm sinh từ V1	TEXT	t	2026-02-20 09:18:13.248974	\N	\N	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, created_at, expires_at, replaced_by, revoked_at, token_hash, user_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (role_id, role_code, role_name, created_at, updated_at) FROM stdin;
38041b12-18f6-46d9-87c3-e0014b736b1a	ADMIN	Administrator	\N	\N
b6d86437-423d-44c3-877a-f0f92629abe1	DOCTOR	Doctor	\N	\N
ead4bb9a-3f45-454a-bc35-efaa46fddbb0	NURSE	Nurse	\N	\N
bf8e36b0-b786-4234-ac93-7080ec0dad98	ROLE_ADMIN	Administrator	\N	\N
0a7cfbd5-8ab6-407f-bd0d-446b1ccab3e5	ROLE_DOCTOR	Doctor	\N	\N
cd1112df-e22b-4d49-90b4-69a911b39197	ROLE_USER	Regular User	\N	\N
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (user_id, role_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, is_active, created_at, email, full_name, password_hash, username, role_id, updated_at) FROM stdin;
e650490a-dfd9-47e0-a4d3-a403dd158425	t	\N	admin@familymed.vn	Administrator	$2a$10$EO4b7KGzwV17e8qgVuPaW.3eeyTELnCAnCQ3kb7By6j/5KAznyN3q	ADMIN001	38041b12-18f6-46d9-87c3-e0014b736b1a	\N
7ce36c0a-0752-4809-8c8c-28f6385dd0bd	t	\N	doctor@familymed.vn	Dr. Nguyễn Văn A	$2a$10$dZ7FNKHfR95yQmQHjDFNfeO.C4rbatvjb8ne6Wk8Nwdqs1Z29iM6.	DOCTOR001	b6d86437-423d-44c3-877a-f0f92629abe1	\N
\.


--
-- Name: appointment appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_pkey PRIMARY KEY (id);


--
-- Name: assessment_answers assessment_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_answers
    ADD CONSTRAINT assessment_answers_pkey PRIMARY KEY (answer_id);


--
-- Name: assessment_sessions assessment_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_sessions
    ADD CONSTRAINT assessment_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: care_plan_action care_plan_action_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.care_plan_action
    ADD CONSTRAINT care_plan_action_pkey PRIMARY KEY (id);


--
-- Name: care_plan_goal care_plan_goal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.care_plan_goal
    ADD CONSTRAINT care_plan_goal_pkey PRIMARY KEY (id);


--
-- Name: care_plan care_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.care_plan
    ADD CONSTRAINT care_plan_pkey PRIMARY KEY (id);


--
-- Name: diagnostic_forms diagnostic_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostic_forms
    ADD CONSTRAINT diagnostic_forms_pkey PRIMARY KEY (form_id);


--
-- Name: drugs drugs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drugs
    ADD CONSTRAINT drugs_pkey PRIMARY KEY (id);


--
-- Name: form_question_options form_question_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_question_options
    ADD CONSTRAINT form_question_options_pkey PRIMARY KEY (option_id);


--
-- Name: form_questions form_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_questions
    ADD CONSTRAINT form_questions_pkey PRIMARY KEY (question_id);


--
-- Name: form_sections form_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_sections
    ADD CONSTRAINT form_sections_pkey PRIMARY KEY (section_id);


--
-- Name: form_versions form_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_versions
    ADD CONSTRAINT form_versions_pkey PRIMARY KEY (id);


--
-- Name: guidelines guidelines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guidelines
    ADD CONSTRAINT guidelines_pkey PRIMARY KEY (id);


--
-- Name: icd10_code icd10_code_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.icd10_code
    ADD CONSTRAINT icd10_code_pkey PRIMARY KEY (code);


--
-- Name: logic_conditions logic_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logic_conditions
    ADD CONSTRAINT logic_conditions_pkey PRIMARY KEY (condition_id);


--
-- Name: logic_formulas logic_formulas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logic_formulas
    ADD CONSTRAINT logic_formulas_pkey PRIMARY KEY (formula_id);


--
-- Name: logic_variables logic_variables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logic_variables
    ADD CONSTRAINT logic_variables_pkey PRIMARY KEY (variable_id);


--
-- Name: patient_diagnosis patient_diagnosis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_diagnosis
    ADD CONSTRAINT patient_diagnosis_pkey PRIMARY KEY (id);


--
-- Name: patient_form_submissions patient_form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_form_submissions
    ADD CONSTRAINT patient_form_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: patient_visits patient_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_visits
    ADD CONSTRAINT patient_visits_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- Name: prescription_item prescription_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_item
    ADD CONSTRAINT prescription_item_pkey PRIMARY KEY (id);


--
-- Name: prescription prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT prescription_pkey PRIMARY KEY (id);


--
-- Name: question_bank question_bank_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_bank
    ADD CONSTRAINT question_bank_code_key UNIQUE (code);


--
-- Name: question_bank question_bank_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_bank
    ADD CONSTRAINT question_bank_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: users uk_6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: roles uk_949pwsnk7kxk0px0tbj3r3web; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uk_949pwsnk7kxk0px0tbj3r3web UNIQUE (role_code);


--
-- Name: patients uk_pdu5f0e015icwwcx7otn46rv8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT uk_pdu5f0e015icwwcx7otn46rv8 UNIQUE (patient_code);


--
-- Name: users uk_r43af9ap4edm43mmtq01oddj6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_r43af9ap4edm43mmtq01oddj6 UNIQUE (username);


--
-- Name: question_bank uk_sy4ae308j4jpw3vmr51vyhnkn; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_bank
    ADD CONSTRAINT uk_sy4ae308j4jpw3vmr51vyhnkn UNIQUE (question_code);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_appointment_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_patient ON public.appointment USING btree (patient_id);


--
-- Name: idx_appointment_practitioner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_practitioner ON public.appointment USING btree (practitioner_id);


--
-- Name: idx_appointment_schedule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_schedule ON public.appointment USING btree (scheduled_start, scheduled_end);


--
-- Name: idx_appointment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_status ON public.appointment USING btree (status);


--
-- Name: idx_assessment_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessment_completed ON public.assessment_sessions USING btree (completed_at);


--
-- Name: idx_assessment_doctor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessment_doctor ON public.assessment_sessions USING btree (doctor_id);


--
-- Name: idx_assessment_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessment_patient ON public.assessment_sessions USING btree (patient_id);


--
-- Name: idx_assessment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessment_status ON public.assessment_sessions USING btree (status);


--
-- Name: idx_audit_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_entity ON public.audit_log USING btree (entity_type, entity_id);


--
-- Name: idx_audit_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_time ON public.audit_log USING btree ("timestamp");


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_user ON public.audit_log USING btree (user_id);


--
-- Name: idx_care_plan_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_care_plan_created ON public.care_plan USING btree (created_at);


--
-- Name: idx_care_plan_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_care_plan_patient ON public.care_plan USING btree (patient_id);


--
-- Name: idx_care_plan_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_care_plan_status ON public.care_plan USING btree (status);


--
-- Name: idx_guideline_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guideline_category ON public.guidelines USING btree (category);


--
-- Name: idx_guideline_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guideline_updated ON public.guidelines USING btree (updated_at);


--
-- Name: idx_prescription_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prescription_created_by ON public.prescription USING btree (created_by);


--
-- Name: idx_prescription_issued; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prescription_issued ON public.prescription USING btree (issued_at);


--
-- Name: idx_prescription_patient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prescription_patient ON public.prescription USING btree (patient_id);


--
-- Name: idx_prescription_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prescription_status ON public.prescription USING btree (status);


--
-- Name: idx_refresh_token_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_token_expires ON public.refresh_tokens USING btree (expires_at);


--
-- Name: idx_refresh_token_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_token_hash ON public.refresh_tokens USING btree (token_hash);


--
-- Name: idx_refresh_token_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_token_user ON public.refresh_tokens USING btree (user_id);


--
-- Name: refresh_tokens fk1lih5y2npsf8u5o3vhdb9y0os; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk1lih5y2npsf8u5o3vhdb9y0os FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: care_plan fk31ng61y3bmnc02ow3o5hsbode; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.care_plan
    ADD CONSTRAINT fk31ng61y3bmnc02ow3o5hsbode FOREIGN KEY (assessment_session_id) REFERENCES public.assessment_sessions(session_id);


--
-- Name: appointment fk3mbue9w5cldlnxx3hm15t5sfo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT fk3mbue9w5cldlnxx3hm15t5sfo FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: patient_form_submissions fk44xr5ug2nsbnhn5ifvrvscdc6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_form_submissions
    ADD CONSTRAINT fk44xr5ug2nsbnhn5ifvrvscdc6 FOREIGN KEY (form_id) REFERENCES public.diagnostic_forms(form_id);


--
-- Name: patient_diagnosis fk7jrne897rk6rsb98kl7lu2yxe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_diagnosis
    ADD CONSTRAINT fk7jrne897rk6rsb98kl7lu2yxe FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: patient_form_submissions fk9gmcig1cmv6rnl1cxbv9m3wdq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_form_submissions
    ADD CONSTRAINT fk9gmcig1cmv6rnl1cxbv9m3wdq FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: patient_form_submissions fk_submission_doctor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_form_submissions
    ADD CONSTRAINT fk_submission_doctor FOREIGN KEY (doctor_id) REFERENCES public.users(user_id);


--
-- Name: patient_form_submissions fk_submission_form; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_form_submissions
    ADD CONSTRAINT fk_submission_form FOREIGN KEY (form_id) REFERENCES public.diagnostic_forms(form_id);


--
-- Name: patient_form_submissions fk_submission_patient; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_form_submissions
    ADD CONSTRAINT fk_submission_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: care_plan_action fkai73wmj6r054s0gcibs70qlgb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.care_plan_action
    ADD CONSTRAINT fkai73wmj6r054s0gcibs70qlgb FOREIGN KEY (care_plan_id) REFERENCES public.care_plan(id);


--
-- Name: patients fkaugk1udr1y5r34txvo0q49wkg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT fkaugk1udr1y5r34txvo0q49wkg FOREIGN KEY (doctor_id) REFERENCES public.users(user_id);


--
-- Name: assessment_answers fkayiesc1kuy389jg9l756v13fe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_answers
    ADD CONSTRAINT fkayiesc1kuy389jg9l756v13fe FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(session_id);


--
-- Name: prescription_item fkeykn9e2g6nbmvwhqbrdm3jb2p; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription_item
    ADD CONSTRAINT fkeykn9e2g6nbmvwhqbrdm3jb2p FOREIGN KEY (prescription_id) REFERENCES public.prescription(id);


--
-- Name: prescription fkf9t13mj1x8eo2u98ku9w9wgti; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT fkf9t13mj1x8eo2u98ku9w9wgti FOREIGN KEY (diagnosis_id) REFERENCES public.patient_diagnosis(id);


--
-- Name: prescription fkh52eitcdgeocsfdky93edn4br; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT fkh52eitcdgeocsfdky93edn4br FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: assessment_sessions fkhjd0git1t0o6nvu1h15c5an7d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_sessions
    ADD CONSTRAINT fkhjd0git1t0o6nvu1h15c5an7d FOREIGN KEY (form_id) REFERENCES public.diagnostic_forms(form_id);


--
-- Name: patient_form_submissions fkhxqut46pwjweua6riwjf9kbr7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_form_submissions
    ADD CONSTRAINT fkhxqut46pwjweua6riwjf9kbr7 FOREIGN KEY (doctor_id) REFERENCES public.users(user_id);


--
-- Name: assessment_sessions fkjlcekm7ra3x0tk5u2wwblea5f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_sessions
    ADD CONSTRAINT fkjlcekm7ra3x0tk5u2wwblea5f FOREIGN KEY (doctor_id) REFERENCES public.users(user_id);


--
-- Name: form_questions fkkqvcwlw7cggeary2045d9bpvl; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_questions
    ADD CONSTRAINT fkkqvcwlw7cggeary2045d9bpvl FOREIGN KEY (section_id) REFERENCES public.form_sections(section_id);


--
-- Name: care_plan fkkvxfj0p72y6j7crff1l30lkv1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.care_plan
    ADD CONSTRAINT fkkvxfj0p72y6j7crff1l30lkv1 FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: prescription fko1moqkh07buffgpxohfibphyx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT fko1moqkh07buffgpxohfibphyx FOREIGN KEY (care_plan_id) REFERENCES public.care_plan(id);


--
-- Name: patient_diagnosis fko36m8dqfr93qogaumvap3pclx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_diagnosis
    ADD CONSTRAINT fko36m8dqfr93qogaumvap3pclx FOREIGN KEY (assessment_session_id) REFERENCES public.assessment_sessions(session_id);


--
-- Name: logic_conditions fkobs1w6ykc6oal67q7mfbforu8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logic_conditions
    ADD CONSTRAINT fkobs1w6ykc6oal67q7mfbforu8 FOREIGN KEY (formula_id) REFERENCES public.logic_formulas(formula_id);


--
-- Name: appointment fkoeud5klvg4aha1lsll9s8irii; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT fkoeud5klvg4aha1lsll9s8irii FOREIGN KEY (practitioner_id) REFERENCES public.users(user_id);


--
-- Name: users fkp56c1712k691lhsyewcssf40f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fkp56c1712k691lhsyewcssf40f FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: form_question_options fkrmrcqr5eg23k28aaroka77x6e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_question_options
    ADD CONSTRAINT fkrmrcqr5eg23k28aaroka77x6e FOREIGN KEY (question_id) REFERENCES public.form_questions(question_id);


--
-- Name: assessment_sessions fks7o09i7l1syr4y1on3pqf6dsf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_sessions
    ADD CONSTRAINT fks7o09i7l1syr4y1on3pqf6dsf FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: patient_diagnosis fkstiwqao8ejn237h1y4870djgq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_diagnosis
    ADD CONSTRAINT fkstiwqao8ejn237h1y4870djgq FOREIGN KEY (icd10_code) REFERENCES public.icd10_code(code);


--
-- Name: form_sections fkswmb1ep6h44bbsuyst6h16evp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_sections
    ADD CONSTRAINT fkswmb1ep6h44bbsuyst6h16evp FOREIGN KEY (form_id) REFERENCES public.diagnostic_forms(form_id);


--
-- Name: care_plan_goal fksyjte2lqvnerddr8215oqa4u0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.care_plan_goal
    ADD CONSTRAINT fksyjte2lqvnerddr8215oqa4u0 FOREIGN KEY (care_plan_id) REFERENCES public.care_plan(id);


--
-- Name: patient_visits patient_visits_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_visits
    ADD CONSTRAINT patient_visits_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointment(id);


--
-- Name: patient_visits patient_visits_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_visits
    ADD CONSTRAINT patient_visits_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(user_id);


--
-- Name: patient_visits patient_visits_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_visits
    ADD CONSTRAINT patient_visits_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

