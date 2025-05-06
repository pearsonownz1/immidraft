import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  text: string;
  timestamp: string;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment?: (text: string) => void;
}

const CommentSection = ({
  comments = [],
  onAddComment = () => {},
}: CommentSectionProps) => {
  const [newComment, setNewComment] = React.useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  return (
    <div className="w-80 border-l bg-background overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium">Comments & Suggestions</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="shadow-none">
              <CardHeader className="p-3 pb-1">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm">
                      {comment.user.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {comment.timestamp}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <p className="text-sm">{comment.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 border-t">
        <Input
          placeholder="Add a comment..."
          className="mb-2"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <Button size="sm" className="w-full" onClick={handleAddComment}>
          Post Comment
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
