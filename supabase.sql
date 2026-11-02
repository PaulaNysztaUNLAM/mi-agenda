-- Mi agenda: pegá todo esto en Supabase > SQL Editor y tocá Run.

-- La tabla donde se guarda la agenda de cada persona.
create table if not exists public.mi_agenda (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- El candado: cada persona solo puede ver y cambiar SU agenda.
alter table public.mi_agenda enable row level security;

drop policy if exists "ver mi agenda" on public.mi_agenda;
drop policy if exists "crear mi agenda" on public.mi_agenda;
drop policy if exists "cambiar mi agenda" on public.mi_agenda;

create policy "ver mi agenda" on public.mi_agenda
  for select to authenticated using (auth.uid() = user_id);
create policy "crear mi agenda" on public.mi_agenda
  for insert to authenticated with check (auth.uid() = user_id);
create policy "cambiar mi agenda" on public.mi_agenda
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.mi_agenda to authenticated;
