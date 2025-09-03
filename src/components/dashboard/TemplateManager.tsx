import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Search, FileText, Copy, Trash2, Plus } from 'lucide-react';
import { CreatePostDialog } from './CreatePostDialog';

interface Template {
  id: string;
  name: string;
  content: string;
  hashtags: string[] | null;
  category: string | null;
  tone: string | null;
  created_at: string;
}

export const TemplateManager = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error fetching templates",
        description: "Failed to load your templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      toast({
        title: "Template deleted",
        description: "Template has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error deleting template",
        description: "Failed to delete the template",
        variant: "destructive",
      });
    }
  };

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Content copied",
        description: "Template content copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying content:', error);
      toast({
        title: "Error copying content",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsCreatePostOpen(true);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Templates</h2>
          <p className="text-muted-foreground">
            Manage and reuse your saved content templates
          </p>
        </div>
        <Button onClick={() => setIsCreatePostOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No templates found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery 
                ? "No templates match your search criteria"
                : "Start creating AI-generated content to save templates"
              }
            </p>
            <Button onClick={() => setIsCreatePostOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold line-clamp-1">
                    {template.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Use Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyContent(template.content)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Content
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {template.category && (
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  )}
                  {template.tone && (
                    <Badge variant="outline" className="text-xs">
                      {template.tone}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {template.content}
                </p>
                {template.hashtags && template.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.hashtags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs text-primary">
                        #{tag}
                      </span>
                    ))}
                    {template.hashtags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{template.hashtags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                  <Button size="sm" onClick={() => handleUseTemplate(template)}>
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        defaultContent={selectedTemplate?.content}
        defaultHashtags={selectedTemplate?.hashtags || undefined}
        onPostCreated={() => {
          setSelectedTemplate(null);
        }}
      />
    </div>
  );
};