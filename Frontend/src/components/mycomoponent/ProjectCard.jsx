import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pin, PinOff, Plus, MoreVertical } from "lucide-react";

export const ProjectCard = ({ project, isPinned, onPinToggle, onAddMember, onViewDetails }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full bg-white border border-gray-300 rounded-lg p-4 transition-shadow hover:shadow-md">
      {/* Project Info */}
      <div
        className="flex-1 cursor-pointer"
        onClick={() => navigate(`/chat/${project._id}`)}
      >
        <div className="flex items-center gap-2">
           {isPinned && <Pin className="w-4 h-4 text-gray-700" />}
          <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Collaborators: {project.users.length}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 self-end sm:self-auto">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onPinToggle(project._id)}
          aria-label={isPinned ? "Unpin project" : "Pin project"}
        >
          {isPinned ? (
            <PinOff className="w-4 h-4 text-blue-600" />
          ) : (
            <Pin className="w-4 h-4 text-gray-500 hover:text-black" />
          )}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => onAddMember(project)}
          aria-label="Add member"
        >
          <Plus className="w-4 h-4 text-gray-500 hover:text-black" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => onViewDetails(project)}
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4 text-gray-500 hover:text-black" />
        </Button>
      </div>
    </div>
  );
};