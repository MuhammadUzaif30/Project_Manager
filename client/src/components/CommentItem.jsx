import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CommentItem = ({ comment, onUpdate, onDelete, currentMembershipRole }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);

  const isAuthor = comment.author._id === user.id;
  const isPrivileged = currentMembershipRole === 'Owner' || currentMembershipRole === 'Admin';
  const canModify = isAuthor || isPrivileged;

  const handleSave = () => {
    if (!content.trim()) return;
    onUpdate({ commentId: comment._id, content });
    setIsEditing(false);
  };

  return (
  <div className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
    <div className="text-xs text-slate-500 mb-1">
      <span className="font-medium text-slate-700">{comment.author.name}</span>
      {' · '}
      {new Date(comment.createdAt).toLocaleString()}
    </div>
    {isEditing ? (
      <div className="flex gap-2 mt-1">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 px-2 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button onClick={handleSave} className="text-indigo-600 text-sm font-medium hover:underline">
          Save
        </button>
        <button onClick={() => setIsEditing(false)} className="text-slate-500 text-sm hover:underline">
          Cancel
        </button>
      </div>
    ) : (
      <p className="text-sm text-slate-700">{comment.content}</p>
    )}
    {canModify && !isEditing && (
      <div className="flex gap-3 mt-1">
        <button onClick={() => setIsEditing(true)} className="text-xs text-slate-400 hover:text-indigo-600">
          Edit
        </button>
        <button onClick={() => onDelete(comment._id)} className="text-xs text-slate-400 hover:text-red-600">
          Delete
        </button>
      </div>
    )}
  </div>
);
};

export default CommentItem;