-- ============================================================
-- SuperrBook — Community Posts Seed Data
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Strategy: Insert fake users directly into auth.users so the
-- handle_new_user trigger auto-creates their profile rows.
-- Then insert community posts referencing those profile IDs.
-- ============================================================

DO $$
DECLARE
  u1 uuid := '11111111-1111-1111-1111-111111111001';
  u2 uuid := '11111111-1111-1111-1111-111111111002';
  u3 uuid := '11111111-1111-1111-1111-111111111003';
  u4 uuid := '11111111-1111-1111-1111-111111111004';
  u5 uuid := '11111111-1111-1111-1111-111111111005';
  u6 uuid := '11111111-1111-1111-1111-111111111006';
  u7 uuid := '11111111-1111-1111-1111-111111111007';
  u8 uuid := '11111111-1111-1111-1111-111111111008';
BEGIN

  -- --------------------------------------------------------
  -- Step 1: Insert fake users into auth.users (seed identities)
  -- --------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES
    (u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'arjun.sharma@seed.superrbook.app', crypt('seed-password', gen_salt('bf')),
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"full_name":"Arjun Sharma"}'::jsonb,
     false, '', '', '', ''),

    (u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'priya.mehta@seed.superrbook.app', crypt('seed-password', gen_salt('bf')),
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"full_name":"Priya Mehta"}'::jsonb,
     false, '', '', '', ''),

    (u3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'riya.kapoor@seed.superrbook.app', crypt('seed-password', gen_salt('bf')),
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"full_name":"Riya Kapoor"}'::jsonb,
     false, '', '', '', ''),

    (u4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'dev.iyer@seed.superrbook.app', crypt('seed-password', gen_salt('bf')),
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"full_name":"Dev Iyer"}'::jsonb,
     false, '', '', '', ''),

    (u5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ananya.rao@seed.superrbook.app', crypt('seed-password', gen_salt('bf')),
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"full_name":"Ananya Rao"}'::jsonb,
     false, '', '', '', ''),

    (u6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'kabir.singh@seed.superrbook.app', crypt('seed-password', gen_salt('bf')),
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"full_name":"Kabir Singh"}'::jsonb,
     false, '', '', '', ''),

    (u7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'zara.khan@seed.superrbook.app', crypt('seed-password', gen_salt('bf')),
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"full_name":"Zara Khan"}'::jsonb,
     false, '', '', '', ''),

    (u8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'rohan.verma@seed.superrbook.app', crypt('seed-password', gen_salt('bf')),
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"full_name":"Rohan Verma"}'::jsonb,
     false, '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- Step 2: Ensure profiles exist (trigger may have already created them)
  -- --------------------------------------------------------
  INSERT INTO public.profiles (id, email, full_name)
  VALUES
    (u1, 'arjun.sharma@seed.superrbook.app',  'Arjun Sharma'),
    (u2, 'priya.mehta@seed.superrbook.app',   'Priya Mehta'),
    (u3, 'riya.kapoor@seed.superrbook.app',   'Riya Kapoor'),
    (u4, 'dev.iyer@seed.superrbook.app',      'Dev Iyer'),
    (u5, 'ananya.rao@seed.superrbook.app',    'Ananya Rao'),
    (u6, 'kabir.singh@seed.superrbook.app',   'Kabir Singh'),
    (u7, 'zara.khan@seed.superrbook.app',     'Zara Khan'),
    (u8, 'rohan.verma@seed.superrbook.app',   'Rohan Verma')
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- Step 3: Insert community posts (skip duplicates on re-run)
  -- --------------------------------------------------------
  INSERT INTO public.community_posts
    (user_id, name, handle, avatar, text, board_label, time, likes, replies, rotation, tape_rotate, paper_color, created_at)
  VALUES

    -- ── ENGINEERING ──────────────────────────────────────────
    (u1, 'Arjun Sharma', '@arjun_builds', 'A',
     'Finally cracked Kirchhoff''s Voltage Law after 3 days of confusion 😅 The key is treating every closed loop like an equation — voltage drops always sum to zero. Drew out 12 circuits by hand and it clicked. Anyone else studying Circuit Analysis this week?',
     'Engineering — Circuit Analysis', '45m', 231, 19,
     'rotate-1', '-rotate-1', 'bg-[#e8f4fd]',
     now() - interval '45 minutes'),

    (u2, 'Priya Mehta', '@priya_codes', 'P',
     'Big realisation today: Thermodynamics isn''t about memorising formulas, it''s about understanding energy flow 🔥 Made a massive canvas linking all four laws together. Entropy finally makes sense! Drop your toughest thermo question and let''s solve it together.',
     'Engineering — Thermodynamics', '2h', 187, 23,
     '-rotate-2', 'rotate-2', 'bg-[#fff8e8]',
     now() - interval '2 hours'),

    (u4, 'Dev Iyer', '@dev_the_engineer', 'D',
     'Mapped out the entire Signals & Systems syllabus today. Fourier Transforms → Laplace → Z-Transform. They''re all the same idea in different disguises 🤯 Spent 4 hours, but worth it. Attaching my canvas below — hope it helps someone!',
     'Engineering — Signals & Systems', '5h', 312, 41,
     'rotate-2', '-rotate-2', 'bg-[#f0faf0]',
     now() - interval '5 hours'),

    -- ── MATHEMATICS ──────────────────────────────────────────
    (u3, 'Riya Kapoor', '@riya_maths', 'R',
     'Real Analysis is breaking my brain in the best way possible 🧠 Epsilon–delta proofs felt like black magic for two weeks. Then I started drawing number lines for every single limit. Visual intuition before symbolic manipulation — game changer. Who else is in this boat?',
     'Mathematics — Real Analysis', '1h', 156, 27,
     '-rotate-1', 'rotate-1', 'bg-[#fdf0ff]',
     now() - interval '1 hour'),

    (u6, 'Kabir Singh', '@kabir_numbertheory', 'K',
     'Group Theory clicked for me today. Abstract Algebra was terrifying until I realised every group is just a set with a rule for combining things. Symmetries of a square = dihedral group D4. Blew my mind 🎯 Building a visual from scratch — post it when done.',
     'Mathematics — Abstract Algebra', '3h', 204, 33,
     'rotate-3', '-rotate-1', 'bg-[#fffce8]',
     now() - interval '3 hours'),

    (u8, 'Rohan Verma', '@rohan_stats', 'R',
     'Probability Theory study hack: stop thinking in fractions, think in frequencies 📊 Instead of "probability of 0.33", imagine "33 out of 100 trials". Conditional probability suddenly becomes intuitive. Using this for my Stats exam tomorrow — wish me luck!',
     'Mathematics — Probability Theory', '6h', 278, 38,
     '-rotate-2', 'rotate-2', 'bg-[#e8fdf5]',
     now() - interval '6 hours'),

    -- ── ALGEBRA ──────────────────────────────────────────────
    (u5, 'Ananya Rao', '@ananya_algebra', 'A',
     'Linear Algebra visual breakthrough today 🗺️ A matrix is just a machine that transforms space. Rotation, stretching, flipping — all encoded in numbers. Once I visualised eigenvectors as the "spine" of a transformation, everything made sense. 3Blue1Brown + hand-drawn notes = unstoppable.',
     'Algebra — Linear Algebra', '2h', 349, 52,
     'rotate-2', '-rotate-2', 'bg-[#fff8f0]',
     now() - interval '2 hours'),

    (u7, 'Zara Khan', '@zara_learns', 'Z',
     'Polynomial long division is SO much easier once you treat it exactly like integer long division step by step. I wrote out six examples side-by-side comparing numbers vs polynomials and the pattern is identical 🔢 Sharing my note canvas — dropping it in the Library today!',
     'Algebra — Polynomials & Division', '4h', 143, 18,
     '-rotate-1', 'rotate-1', 'bg-[#f5f0fd]',
     now() - interval '4 hours'),

    (u1, 'Arjun Sharma', '@arjun_builds', 'A',
     'Quadratic formula isn''t just a formula — it''s geometry! The discriminant tells you how many times the parabola crosses the x-axis. Positive = two roots, zero = one root (tangent), negative = no real roots 📐 Drew this out for my little brother and both of us finally got it.',
     'Algebra — Quadratic Equations', '8h', 167, 21,
     'rotate-1', '-rotate-1', 'bg-[#e8f4fd]',
     now() - interval '8 hours'),

    -- ── SCIENCE (Physics, Chemistry, Biology) ────────────────
    (u2, 'Priya Mehta', '@priya_codes', 'P',
     'Quantum Mechanics study tip: don''t fight the weirdness, embrace it 🌊 Schrodinger''s equation is just the quantum version of F=ma. Both describe how things evolve over time. Spent today mapping classical → quantum analogies on a canvas. It''s honestly beautiful.',
     'Science — Quantum Mechanics', '3h', 417, 63,
     '-rotate-2', 'rotate-2', 'bg-[#fff8e8]',
     now() - interval '3 hours'),

    (u4, 'Dev Iyer', '@dev_the_engineer', 'D',
     'Organic Chemistry nomenclature cracked 🧪 The trick is building the name systematically: parent chain → substituents → functional group priority. It''s like learning grammar for a language of molecules. IUPAC rules are annoying until they''re not. Posting my flowchart today!',
     'Science — Organic Chemistry', '7h', 195, 29,
     'rotate-2', '-rotate-2', 'bg-[#f0faf0]',
     now() - interval '7 hours'),

    (u3, 'Riya Kapoor', '@riya_maths', 'R',
     'Cell biology is stunning when you think of cells as tiny cities 🏙️ The nucleus = city hall (makes decisions), mitochondria = power plant, ribosomes = factories. Using this metaphor for every organelle. My exam is in 48hrs and I feel genuinely prepared for once!',
     'Science — Cell Biology', '9h', 223, 34,
     '-rotate-1', 'rotate-1', 'bg-[#fdf0ff]',
     now() - interval '9 hours'),

    -- ── PSYCHOLOGY ───────────────────────────────────────────
    (u6, 'Kabir Singh', '@kabir_numbertheory', 'K',
     'Cognitive Biases are everywhere once you know what to look for 🧠 Spent the afternoon mapping 20 biases onto a single canvas — Confirmation Bias, Dunning-Kruger, Anchoring, Availability Heuristic. Connecting them to real exam examples makes them stick 100x better.',
     'Psychology — Cognitive Biases', '1h', 388, 57,
     'rotate-3', '-rotate-1', 'bg-[#fffce8]',
     now() - interval '1 hour'),

    (u8, 'Rohan Verma', '@rohan_stats', 'R',
     'Freud vs Jung: I finally understand the split 🔍 Freud = unconscious driven by biological drives (id, ego, superego). Jung = unconscious is a reservoir of shared human archetypes. Made a comparison canvas — it''s the clearest thing I''ve ever made. Examiners love this kind of contrast!',
     'Psychology — Psychoanalytic Theory', '4h', 261, 44,
     '-rotate-2', 'rotate-2', 'bg-[#e8fdf5]',
     now() - interval '4 hours'),

    (u5, 'Ananya Rao', '@ananya_algebra', 'A',
     'Classical vs Operant Conditioning differences just clicked for me 🐕 Classical = reflexive, involuntary (Pavlov''s dog salivates). Operant = voluntary, behavior shaped by consequence (Skinner''s box). Drew both experiments side by side with reinforcement schedules. Psychology is honestly so applicable to real life!',
     'Psychology — Behaviorism', '6h', 302, 48,
     'rotate-2', '-rotate-2', 'bg-[#fff8f0]',
     now() - interval '6 hours'),

    (u7, 'Zara Khan', '@zara_learns', 'Z',
     'Memory models are fascinating 🗂️ Atkinson-Shiffrin''s multi-store model (sensory → short-term → long-term) vs Baddeley''s Working Memory Model (central executive + phonological loop + visuospatial sketchpad). Both describe how we learn — which is wild because I''m using my memory to study my memory 😂',
     'Psychology — Memory & Cognition', '11h', 219, 36,
     '-rotate-1', 'rotate-1', 'bg-[#f5f0fd]',
     now() - interval '11 hours')

  ON CONFLICT DO NOTHING;

END $$;
