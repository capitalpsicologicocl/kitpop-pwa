-- KitPOP Fase 9 extensión: tipos Likert 5/7/10 y encuesta de satisfacción
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- (Después de surveys_v1.sql)

alter table public.surveys
  add column if not exists survey_type text default 'custom'
    check (survey_type in ('satisfaction', 'custom'));

alter table public.surveys
  add column if not exists likert_scale integer
    check (likert_scale is null or likert_scale in (5, 7, 10));

update public.survey_questions
set question_type = 'likert_5'
where question_type = 'scale';

update public.survey_questions
set question_type = 'text'
where question_type = 'single_choice';

alter table public.survey_questions
  drop constraint if exists survey_questions_question_type_check;

alter table public.survey_questions
  add constraint survey_questions_question_type_check
  check (question_type in ('text', 'yes_no', 'likert_5', 'likert_7', 'likert_10'));
