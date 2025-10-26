import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const Subjects = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (error) {
        toast({
          title: "Error loading subjects",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSubjects(data || []);
      }
      setLoadingSubjects(false);
    };

    if (user) {
      fetchSubjects();
    }
  }, [user, toast]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const selectSubject = (subjectName: string) => {
    const subjectSlug = subjectName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/materials/${year}/${subjectSlug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EXAMPREP
            </h1>
          </div>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4 animate-fade-in">
            <Button variant="outline" onClick={() => navigate("/home")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Years
            </Button>
          </div>

          <div className="text-center space-y-3 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground">Choose Your Subject</h2>
            <p className="text-muted-foreground text-lg">
              Academic Year: <span className="font-semibold text-primary">{year}</span>
            </p>
          </div>

          {loadingSubjects ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading subjects...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {subjects.map((subject, index) => (
                <Card
                  key={subject.id}
                  className="hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => selectSubject(subject.name)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 text-3xl`}>
                      {subject.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold">{subject.name}</CardTitle>
                    <CardDescription className="text-base">{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2">
                      <BookOpen className="w-4 h-4" />
                      View Materials
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Subjects;
