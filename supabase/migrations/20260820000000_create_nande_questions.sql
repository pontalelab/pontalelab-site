-- 「今日のなんで」の元データを保管するテーブル。
--
-- 現時点では質問投稿フォームは実装せず、Supabase Dashboard の
-- Table Editor から手動で行を追加する運用を前提にしている。
-- フロントエンド（TOPページ）は、is_public = true の行だけを
-- 匿名クライアントとして読み取り、日付から決定的に1件選んで表示する。
--
-- 適用方法（Supabase CLIでプロジェクトにリンク済みの状態で）：
--   supabase db push
-- または、Supabase DashboardのSQL Editorに本ファイルの内容を貼り付けて実行してもよい。

create table if not exists public.nande_questions (
  id            uuid primary key default gen_random_uuid(),
  emoji         text,                 -- 表示用の絵文字（例: 🐞）。省略時はフロント側で既定の絵文字を使う
  question      text not null,        -- 質問文（例: なんでカブトムシには角があるの？）
  options       text[] not null default '{}',  -- 選択肢（例: ['なかまと戦うため','エサを食べるため','飛ぶため','かざり']）。空でもよい
  answer_short  text not null,        -- 🔬 ポンターレラボの答え
  lab_comment   text,                 -- 🧪 ポンターレラボからのひとこと（空欄可）
  is_public     boolean not null default true,   -- falseにすると一般公開されない（下書き用）
  display_order integer,              -- 表示順の目安（省略時は created_at 順）
  created_at    timestamptz not null default now()
);

comment on table public.nande_questions is
  '「今日のなんで」の元データ。Table Editorで手動管理し、is_public=trueの行のみTOPページに表示される。';

-- RLSを有効化。ここで定義するのはSELECTポリシーのみで、
-- INSERT/UPDATE/DELETEのポリシーは意図的に定義しない
-- （＝匿名・authenticatedいずれのロールからの書き込みもRLSにより拒否される。
-- 　管理者による追加・編集は、RLSを経由しないSupabase DashboardのTable Editorから行う）。
alter table public.nande_questions enable row level security;

drop policy if exists "public can read published nande questions" on public.nande_questions;
create policy "public can read published nande questions"
  on public.nande_questions
  for select
  to anon
  using (is_public = true);

-- テーブル権限（GRANT）を明示しておく。Supabaseプロジェクトでは通常
-- public スキーマのテーブルに対して anon ロールへ既定でSELECT等の権限が
-- 付与されるが、環境差異に依存しないよう、ここでも明示的にSELECTのみ許可する。
-- INSERT/UPDATE/DELETEは付与しない（＝GRANTとRLSの二重で書き込みを防ぐ）。
grant select on public.nande_questions to anon;

-- 動作確認用のサンプル行（そのままでも、内容を書き換えても、削除してもよい）。
-- 本番投入前に、実際に使いたい質問に差し替えることを推奨する。
-- テーブルが空のときだけ挿入するようにしているため、このファイルを
-- 再実行してもサンプル行が重複することはない。
insert into public.nande_questions (emoji, question, options, answer_short, lab_comment, display_order)
select * from (values
  (
    '🐞',
    'なんでカブトムシには角があるの？',
    array['なかまと戦うため', 'エサを食べるため', '飛ぶため', 'かざり'],
    'オスのカブトムシは、エサ場や気に入った相手をめぐって、他のオスと角を使って押し合いをすることがあります。角は「たたかうための道具」として発達したと考えられています。',
    '「角って、かっこいいだけじゃなかったんだね！」',
    1
  ),
  (
    '🦋',
    'なんでチョウはお花のまわりを飛ぶの？',
    array['お花のみつを飲むため', 'お花のにおいが好きだから', '休むため', 'かくれるため'],
    'チョウは花の蜜（みつ）をエネルギー源にして生きています。ストローのような口（口吻）を花にさしこんで、甘い蜜を吸っているのです。',
    'じゃあ、ミツバチもおなじことをしているのかな？',
    2
  )
) as v(emoji, question, options, answer_short, lab_comment, display_order)
where not exists (select 1 from public.nande_questions);
