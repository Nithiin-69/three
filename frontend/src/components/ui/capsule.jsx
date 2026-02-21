import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PrimeHire Capsule UI Components Library
 * Reusable capsule-based components for consistent UI
 */

// 1. Pill-based Filter Component
export const CapsuleFilter = ({ 
  children, 
  active = false, 
  onClick, 
  className,
  icon 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'capsule-filter',
        active && 'active',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// 2. Status Chip Component
export const StatusChip = ({ 
  status, 
  children, 
  className 
}) => {
  const statusMap = {
    active: 'active',
    pending: 'pending',
    rejected: 'rejected',
    hired: 'hired',
    shortlisted: 'active',
    screening: 'pending',
  };

  return (
    <span
      className={cn(
        'status-chip',
        statusMap[status?.toLowerCase()] || 'pending',
        className
      )}
    >
      {children || status}
    </span>
  );
};

// 3. Score Badge Component
export const ScoreBadge = ({ 
  score, 
  className,
  size = 'default' 
}) => {
  const getScoreClass = (score) => {
    if (score >= 85) return 'score-high';
    if (score >= 70) return 'score-medium';
    return 'score-low';
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm rounded-xl',
    default: 'w-12 h-12 text-lg rounded-2xl',
    lg: 'w-16 h-16 text-2xl rounded-3xl',
  };

  return (
    <div
      className={cn(
        'score-badge',
        getScoreClass(score),
        sizeClasses[size],
        className
      )}
    >
      {score}
    </div>
  );
};

// 4. Navigation Capsule Component
export const NavCapsule = ({ 
  children, 
  active = false, 
  onClick, 
  icon,
  className 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'nav-capsule',
        active && 'active',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// 5. Tag Capsule Component
export const TagCapsule = ({ 
  children, 
  selected = false, 
  onClick, 
  onRemove,
  className 
}) => {
  return (
    <span
      onClick={onClick}
      className={cn(
        'tag-capsule',
        selected && 'selected',
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-red-500 transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
};

// 6. Filter Capsule Group Component
export const CapsuleFilterGroup = ({ 
  filters, 
  activeFilters = [], 
  onChange,
  className 
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {filters.map((filter) => (
        <CapsuleFilter
          key={filter.value}
          active={activeFilters.includes(filter.value)}
          onClick={() => onChange(filter.value)}
          icon={filter.icon}
        >
          {filter.label}
          {filter.count !== undefined && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
              {filter.count}
            </span>
          )}
        </CapsuleFilter>
      ))}
    </div>
  );
};

// 7. Multi-Select Capsule Filter with AND/OR logic
export const AdvancedCapsuleFilter = ({ 
  filters, 
  selectedFilters = [], 
  onChange,
  logic = 'OR', // 'AND' or 'OR'
  onLogicChange,
  className 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground-secondary">Filter Logic:</span>
        <div className="inline-flex rounded-full bg-surface border border-border p-1">
          <button
            onClick={() => onLogicChange('OR')}
            className={cn(
              'px-4 py-1 rounded-full text-sm font-medium transition-all',
              logic === 'OR' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground-secondary hover:text-foreground'
            )}
          >
            OR
          </button>
          <button
            onClick={() => onLogicChange('AND')}
            className={cn(
              'px-4 py-1 rounded-full text-sm font-medium transition-all',
              logic === 'AND' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground-secondary hover:text-foreground'
            )}
          >
            AND
          </button>
        </div>
      </div>
      
      <CapsuleFilterGroup
        filters={filters}
        activeFilters={selectedFilters}
        onChange={onChange}
      />
    </div>
  );
};

// 8. Score Badge with Confidence Indicator
export const ScoreBadgeWithConfidence = ({ 
  score, 
  confidence, 
  className 
}) => {
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ScoreBadge score={score} />
      <div className="group relative">
        <div className={cn('w-2 h-2 rounded-full', getConfidenceColor(confidence))} />
        <div className="absolute left-0 top-full mt-2 px-3 py-2 bg-elevated border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          <p className="text-xs font-medium">{getConfidenceLabel(confidence)}</p>
          <p className="text-xs text-foreground-tertiary">{(confidence * 100).toFixed(0)}% confidence</p>
        </div>
      </div>
    </div>
  );
};

// 9. Draggable Capsule Filter (for reordering)
export const DraggableCapsuleFilter = ({ 
  children, 
  active = false, 
  onDragStart,
  onDragEnd,
  className 
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'capsule-filter cursor-move',
        active && 'active',
        className
      )}
    >
      <span className="mr-2">⋮⋮</span>
      {children}
    </div>
  );
};

// 10. Capsule with Icon and Action Button
export const ActionCapsule = ({ 
  children, 
  icon, 
  onAction, 
  actionIcon,
  actionLabel,
  className 
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-surface border border-border hover:border-border-strong',
        'transition-all duration-200',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-sm font-medium">{children}</span>
      {onAction && (
        <button
          onClick={onAction}
          className="ml-2 p-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          title={actionLabel}
        >
          {actionIcon || '→'}
        </button>
      )}
    </div>
  );
};

export default {
  CapsuleFilter,
  StatusChip,
  ScoreBadge,
  NavCapsule,
  TagCapsule,
  CapsuleFilterGroup,
  AdvancedCapsuleFilter,
  ScoreBadgeWithConfidence,
  DraggableCapsuleFilter,
  ActionCapsule,
};
