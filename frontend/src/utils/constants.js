// Complaint Categories
export const CATEGORIES = [
  { value: 'road_issue', label: 'Road Issue', icon: '🛣️' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'water', label: 'Water', icon: '💧' },
  { value: 'streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'drainage', label: 'Drainage', icon: '🌊' },
  { value: 'noise_pollution', label: 'Noise Pollution', icon: '🔊' },
  { value: 'illegal_construction', label: 'Illegal Construction', icon: '🏗️' },
  { value: 'other', label: 'Other', icon: '📋' }
];

// Complaint Status
export const STATUS = {
  pending: { label: 'Pending', color: '#f59e0b', icon: '⏳' },
  assigned: { label: 'Assigned', color: '#3b82f6', icon: '👤' },
  in_progress: { label: 'In Progress', color: '#8b5cf6', icon: '🔧' },
  resolved: { label: 'Resolved', color: '#10b981', icon: '✅' },
  rejected: { label: 'Rejected', color: '#ef4444', icon: '❌' }
};

// Priority Levels
export const PRIORITY = {
  low: { label: 'Low', color: '#22c55e' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
  urgent: { label: 'Urgent', color: '#dc2626' }
};

// User Roles
export const ROLES = {
  citizen: { label: 'Citizen', color: '#3b82f6' },
  police: { label: 'Police', color: '#1e40af' },
  municipal: { label: 'Municipal', color: '#059669' },
  admin: { label: 'Admin', color: '#7c3aed' }
};

// Get category label
export const getCategoryLabel = (value) => {
  const category = CATEGORIES.find(c => c.value === value);
  return category ? category.label : value;
};

// Get category icon
export const getCategoryIcon = (value) => {
  const category = CATEGORIES.find(c => c.value === value);
  return category ? category.icon : '📋';
};

// Get status details
export const getStatusDetails = (status) => {
  return STATUS[status] || { label: status, color: '#6b7280', icon: '❓' };
};

// Get priority details
export const getPriorityDetails = (priority) => {
  return PRIORITY[priority] || { label: priority, color: '#6b7280' };
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};
