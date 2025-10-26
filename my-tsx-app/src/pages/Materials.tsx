import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, ArrowLeft, LogOut, FileText, Video, ExternalLink, Download, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuestionPaper {
  id: string;
  title: string;
  date: string | null;
  pages: number | null;
  difficulty: string | null;
  file_url: string | null;
}

interface VideoLink {
  id: string;
  title: string;
  duration: string | null;
  instructor: string | null;
  views: string | null;
  video_url: string | null;
}

interface Subject {
  id: string;
  name: string;
}

const Materials = () => {
  const { year, subject } = useParams();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [subjectData, setSubjectData] = useState<Subject | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [completedPapers, setCompletedPapers] = useState<Set<string>>(new Set());
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !subject || !year) return;

      // Convert subject slug back to name
      const subjectName = subject.split("-").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" ");

      // Fetch subject
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("*")
        .ilike("name", subjectName)
        .single();

      if (subjectError) {
        toast({
          title: "Error loading subject",
          description: subjectError.message,
          variant: "destructive",
        });
        setLoadingData(false);
        return;
      }

      setSubjectData(subjectData);

      // Fetch question papers
      const { data: papers, error: papersError } = await supabase
        .from("question_papers")
        .select("*")
        .eq("subject_id", subjectData.id)
        .eq("year", parseInt(year))
        .order("date");

      if (papersError) {
        toast({
          title: "Error loading papers",
          description: papersError.message,
          variant: "destructive",
        });
      } else {
        setQuestionPapers(papers || []);
      }

      // Fetch video links
      const { data: videos, error: videosError } = await supabase
        .from("video_links")
        .select("*")
        .eq("subject_id", subjectData.id)
        .eq("year", parseInt(year))
        .order("title");

      if (videosError) {
        toast({
          title: "Error loading videos",
          description: videosError.message,
          variant: "destructive",
        });
      } else {
        setVideoLinks(videos || []);
      }

      // Fetch user progress
      const { data: progress } = await supabase
        .from("user_progress")
        .select("paper_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (progress) {
        setCompletedPapers(new Set(progress.map(p => p.paper_id)));
      }

      // Fetch watch history
      const { data: history } = await supabase
        .from("video_watch_history")
        .select("video_id")
        .eq("user_id", user.id);

      if (history) {
        setWatchedVideos(new Set(history.map(h => h.video_id)));
      }

      setLoadingData(false);
    };

    if (user) {
      fetchData();
    }
  }, [user, subject, year, toast, navigate]);

  const markPaperComplete = async (paperId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: user.id,
        paper_id: paperId,
        completed: true,
        completed_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark as complete",
        variant: "destructive",
      });
    } else {
      setCompletedPapers(prev => new Set([...prev, paperId]));
      toast({
        title: "Success",
        description: "Marked as completed!",
      });
    }
  };

  const markVideoWatched = async (videoId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("video_watch_history")
      .upsert({
        user_id: user.id,
        video_id: videoId,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark as watched",
        variant: "destructive",
      });
    } else {
      setWatchedVideos(prev => new Set([...prev, videoId]));
      toast({
        title: "Video opened",
        description: "Marked as watched!",
      });
    }
  };

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
            <Button variant="outline" onClick={() => navigate(`/subjects/${year}`)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Subjects
            </Button>
          </div>

          <div className="text-center space-y-3 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground">{subjectData?.name || "Loading..."}</h2>
            <p className="text-muted-foreground text-lg">
              Academic Year: <span className="font-semibold text-primary">{year}</span>
            </p>
          </div>

          {loadingData ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading materials...</p>
            </div>
          ) : (
            <Tabs defaultValue="papers" className="animate-fade-in-up">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
                <TabsTrigger value="papers" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Question Papers
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-2">
                  <Video className="w-4 h-4" />
                  Video Links
                </TabsTrigger>
              </TabsList>

              <TabsContent value="papers" className="mt-8">
                {questionPapers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No question papers available for this subject yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {questionPapers.map((paper, index) => (
                      <Card
                        key={paper.id}
                        className="hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-1"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary-foreground" />
                            </div>
                            {completedPapers.has(paper.id) && (
                              <CheckCircle className="w-6 h-6 text-success" />
                            )}
                            {paper.difficulty && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                paper.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                                paper.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {paper.difficulty}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-xl">{paper.title}</CardTitle>
                          <CardDescription>
                            {paper.date} {paper.pages && `• ${paper.pages} pages`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button 
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2"
                            onClick={() => {
                              if (paper.file_url) {
                                window.open(paper.file_url, '_blank');
                                markPaperComplete(paper.id);
                              } else {
                                toast({
                                  title: "No file available",
                                  description: "This paper doesn't have a file URL yet.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Paper
                          </Button>
                          {!completedPapers.has(paper.id) && (
                            <Button 
                              variant="outline" 
                              className="w-full gap-2"
                              onClick={() => markPaperComplete(paper.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark as Complete
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="mt-8">
                {videoLinks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No video links available for this subject yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videoLinks.map((video, index) => (
                      <Card
                        key={video.id}
                        className="hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                        onClick={() => markVideoWatched(video.id)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                              <Video className="w-6 h-6 text-primary-foreground" />
                            </div>
                            {watchedVideos.has(video.id) && (
                              <CheckCircle className="w-6 h-6 text-success" />
                            )}
                          </div>
                          <CardTitle className="text-xl">{video.title}</CardTitle>
                          <CardDescription>
                            {video.instructor} {video.duration && `• ${video.duration}`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <span>{video.views} views</span>
                          </div>
                          <Button 
                            className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90 gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (video.video_url) {
                                window.open(video.video_url, '_blank');
                                markVideoWatched(video.id);
                              } else {
                                toast({
                                  title: "No video available",
                                  description: "This video doesn't have a URL yet.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Video className="w-4 h-4" />
                            Watch Video
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Materials;
