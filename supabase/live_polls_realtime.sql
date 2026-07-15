-- Sprint 4: habilitar Supabase Realtime para sesiones en vivo.
-- Ejecutar en Supabase SQL Editor después de live_polls_v1.sql.

alter publication supabase_realtime add table public.live_polls;
alter publication supabase_realtime add table public.live_poll_votes;
alter publication supabase_realtime add table public.live_sessions;

-- Si alguna tabla ya está en la publicación, ignorar el error "already member of publication".
