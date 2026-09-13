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
    <div style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
      <div style={{ fontSize: 13, color: '#666' }}>
        <strong>{comment.author.name}</strong> · {new Date(comment.createdAt).toLocaleString()}
      </div>

      {isEditing ? (
        <div>
          <input value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <p style={{ margin: '4px 0' }}>{comment.content}</p>
      )}

      {canModify && !isEditing && (
        <div>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onDelete(comment._id)}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default CommentItem;