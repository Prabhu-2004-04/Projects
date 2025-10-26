-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question papers table
CREATE TABLE public.question_papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  date TEXT,
  pages INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video links table
CREATE TABLE public.video_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  duration TEXT,
  instructor TEXT,
  views TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user progress tracking table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES public.question_papers(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, paper_id)
);

-- Create video watch history table
CREATE TABLE public.video_watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.video_links(id) ON DELETE CASCADE,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for subjects (public read)
CREATE POLICY "Anyone can view subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for question papers (public read for authenticated users)
CREATE POLICY "Authenticated users can view question papers"
  ON public.question_papers FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for video links (public read for authenticated users)
CREATE POLICY "Authenticated users can view video links"
  ON public.video_links FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user progress (users can only see their own progress)
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for video watch history
CREATE POLICY "Users can view their own watch history"
  ON public.video_watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history"
  ON public.video_watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample subjects
INSERT INTO public.subjects (name, description, icon, color) VALUES
  ('Mathematics', 'Algebra, Calculus, Statistics', '📐', 'from-blue-500 to-cyan-500'),
  ('Physics', 'Mechanics, Thermodynamics, Optics', '⚛️', 'from-purple-500 to-pink-500'),
  ('Chemistry', 'Organic, Inorganic, Physical', '🧪', 'from-green-500 to-emerald-500'),
  ('Biology', 'Botany, Zoology, Genetics', '🧬', 'from-red-500 to-orange-500'),
  ('Computer Science', 'Programming, Data Structures, Algorithms', '💻', 'from-indigo-500 to-blue-500'),
  ('English', 'Literature, Grammar, Writing', '📚', 'from-yellow-500 to-amber-500');

-- Insert sample question papers for Mathematics (2024)
INSERT INTO public.question_papers (title, subject_id, year, date, pages, difficulty)
SELECT 
  'Mid-Term Examination',
  id,
  2024,
  'March 2024',
  8,
  'Medium'
FROM public.subjects WHERE name = 'Mathematics';

INSERT INTO public.question_papers (title, subject_id, year, date, pages, difficulty)
SELECT 
  'Final Examination',
  id,
  2024,
  'June 2024',
  12,
  'Hard'
FROM public.subjects WHERE name = 'Mathematics';

-- Insert sample video links for Mathematics (2024)
INSERT INTO public.video_links (title, subject_id, year, duration, instructor, views)
SELECT 
  'Complete Course Overview',
  id,
  2024,
  '2h 15m',
  'Dr. Sarah Johnson',
  '125K'
FROM public.subjects WHERE name = 'Mathematics';

INSERT INTO public.video_links (title, subject_id, year, duration, instructor, views)
SELECT 
  'Important Concepts Revision',
  id,
  2024,
  '1h 45m',
  'Prof. Michael Chen',
  '89K'
FROM public.subjects WHERE name = 'Mathematics';