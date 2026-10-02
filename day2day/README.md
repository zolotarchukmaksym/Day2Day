# Daily Planner — React Native (Expo) + Supabase

A minimal, fast, bold-and-playful daily planner. Calendar + Tasks on one
screen, Notes on another, Profile on a third. Bottom sheets handle all
"quick add" flows so nobody ever leaves the main screen to jot something down.

## Folder structure

```
daily-planner/
├── app/                        # Expo Router — file-based routing
│   ├── _layout.tsx             # Root layout: loads fonts, wires auth guard
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/
│       ├── _layout.tsx         # Bottom tab bar (Calendar, Notes, Profile)
│       ├── index.tsx           # Calendar + Tasks for selected day
│       ├── notes.tsx           # Notes list
│       └── profile.tsx         # Profile / sign out
│
├── components/
│   ├── TaskItem.tsx            # Single task row w/ checkbox
│   ├── NoteCard.tsx            # Single note "sticker" card
│   ├── AddTaskSheet.tsx        # Bottom sheet: create/edit task
│   ├── AddNoteSheet.tsx        # Bottom sheet: create/edit note
│   ├── FAB.tsx                 # Floating action button
│   └── EmptyState.tsx          # Reusable empty-state illustption+copy
│
├── store/
│   ├── authStore.ts            # Zustand: session, sign in/up/out
│   ├── taskStore.ts            # Zustand: tasks, markers, CRUD, selected date
│   └── noteStore.ts            # Zustand: notes, CRUD
│
├── lib/
│   └── supabase.ts             # Supabase client (AsyncStorage session persistence)
│
├── theme/
│   └── theme.ts                # Colors, type scale, spacing, shadows ("tokens")
│
├── types/
│   └── index.ts                # Task, Note, shared TS types
│
├── supabase/
│   └── schema.sql              # DB schema + RLS policies (run once in Supabase)
│
├── app.json
└── package.json
```

## Setup

```bash
npx create-expo-app daily-planner -t expo-template-blank-typescript
cd daily-planner

npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install react-native-url-polyfill
npm install zustand
npx expo install react-native-calendars
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
npm install @gorhom/bottom-sheet react-native-gesture-handler react-native-reanimated
npx expo install @expo/vector-icons
npx expo install expo-font
npm install date-fns
```

1. Create a Supabase project → open **SQL Editor** → paste `supabase/schema.sql` → Run.
2. In Supabase → Settings → API, copy the **Project URL** and **anon public key**
   into `.env` (see `lib/supabase.ts`).
3. `npx expo start`

## Design direction

Bold, chunky, "game UI" energy (think Brawl Stars menus) but restrained to a
single screen's worth of content at a time — thick dark-ink outlines, flat
offset shadows instead of blur, a warm sunburst-yellow + electric-violet
palette, and a rounded display font (Fredoka) reserved for headings and
buttons only. See `theme/theme.ts` for the full token set.
