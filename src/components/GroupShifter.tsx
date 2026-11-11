import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronsRight,
  ChevronLeft,
  ChevronsLeft,
  Users,
  FolderPlus
} from 'lucide-react';

interface GroupShifterProps {
  availableGroups: string[];
  destinationGroups: string[];
  onTransferToDestination: (group: string) => void;
  onTransferToAvailable: (group: string) => void;
  onTransferAllToDestination: () => void;
  onTransferAllToAvailable: () => void;
  onOpenCustomGroupModal?: () => void;
}

export const GroupShifter: React.FC<GroupShifterProps> = ({
  availableGroups,
  destinationGroups,
  onTransferToDestination,
  onTransferToAvailable,
  onTransferAllToDestination,
  onTransferAllToAvailable,
  onOpenCustomGroupModal,
}) => {
  const [selectedAvailable, setSelectedAvailable] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  const handleShiftOneRight = () => {
    if (selectedAvailable) {
      onTransferToDestination(selectedAvailable);
      setSelectedAvailable('');
    } else if (availableGroups.length > 0) {
      onTransferToDestination(availableGroups[0]);
    }
  };

  const handleShiftOneLeft = () => {
    if (selectedDestination) {
      onTransferToAvailable(selectedDestination);
      setSelectedDestination('');
    } else if (destinationGroups.length > 0) {
      onTransferToAvailable(destinationGroups[0]);
    }
  };

  return (
    <div className="card !p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card h-full flex flex-col justify-between">

      {/* Card Header */}
      <div className="card-head !mb-3">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
          <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
            <Users className="w-4 h-4" />
          </span>
          Target Groups / Shifter
        </h3>
        {onOpenCustomGroupModal && (
          <button
            type="button"
            onClick={onOpenCustomGroupModal}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-surface-2 hover:bg-surface text-[#1b1e42] dark:text-accent border border-gray-200 dark:border-zinc-800 transition shadow-2xs cursor-pointer"
            title="Create or manage custom groups"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Custom Group</span>
          </button>
        )}
      </div>

      {/* Lists & Shift Controls */}
      <div className="grid grid-cols-11 gap-2 items-center flex-1 my-1">

        {/* Available Group */}
        <div className="col-span-5 flex flex-col h-full">
          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
            Available Group
          </label>
          <div className="h-[140px] bg-surface-2 border border-gray-200 dark:border-zinc-800 rounded-sm p-1.5 overflow-y-auto space-y-1">
            {availableGroups.length === 0 ? (
              <div className="text-xs text-ink-faint text-center py-12 italic">
                All shifted
              </div>
            ) : (
              availableGroups.map((group) => (
                <div
                  key={group}
                  onClick={() => setSelectedAvailable(group)}
                  onDoubleClick={() => {
                    onTransferToDestination(group);
                    setSelectedAvailable('');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition select-none truncate ${selectedAvailable === group
                    ? 'bg-[#1b1e42] dark:bg-accent text-white font-semibold shadow-xs'
                    : 'text-ink hover:bg-surface'
                    }`}
                  title={`${group} (Double-click to shift)`}
                >
                  {group}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center buttons: >, >>, <, << */}
        <div className="col-span-1 flex flex-col items-center justify-center gap-1.5 pt-5">
          {/* > Move one */}
          <button
            type="button"
            onClick={handleShiftOneRight}
            disabled={availableGroups.length === 0}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-800 bg-surface hover:bg-surface-2 flex items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition"
            title="Shift selected (>)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* >> Move all */}
          <button
            type="button"
            onClick={onTransferAllToDestination}
            disabled={availableGroups.length === 0}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-800 bg-surface hover:bg-surface-2 flex items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition"
            title="Shift all (>>)"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>

          {/* < Return one */}
          <button
            type="button"
            onClick={handleShiftOneLeft}
            disabled={destinationGroups.length === 0}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-800 bg-surface hover:bg-surface-2 flex items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition"
            title="Return selected (<)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* << Return all */}
          <button
            type="button"
            onClick={onTransferAllToAvailable}
            disabled={destinationGroups.length === 0}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-800 bg-surface hover:bg-surface-2 flex items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition"
            title="Return all (<<)"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Group */}
        <div className="col-span-5 flex flex-col h-full">
          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
            Destination Group
          </label>
          <div className="h-[140px] bg-surface-2 border border-gray-200 dark:border-zinc-800 rounded-sm p-1.5 overflow-y-auto space-y-1">
            {destinationGroups.length === 0 ? (
              <div className="text-xs text-ink-faint text-center py-12 italic">
                None selected
              </div>
            ) : (
              destinationGroups.map((group) => (
                <div
                  key={group}
                  onClick={() => setSelectedDestination(group)}
                  onDoubleClick={() => {
                    onTransferToAvailable(group);
                    setSelectedDestination('');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition select-none truncate ${selectedDestination === group
                    ? 'bg-[#1b1e42] dark:bg-accent text-white font-semibold shadow-xs'
                    : 'text-ink hover:bg-surface'
                    }`}
                  title={`${group} (Double-click to remove)`}
                >
                  &bull; {group}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Footer hint */}
      <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 mt-2 flex items-center justify-between text-[11px] text-ink-muted">
        <span>Double-click item to shift instantly</span>
        <span className="font-semibold text-ink">{destinationGroups.length} active target{destinationGroups.length === 1 ? '' : 's'}</span>
      </div>

    </div>
  );
};
