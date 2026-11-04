import React, { useState } from 'react';
import { ChevronRight, ChevronsRight, ChevronLeft, ChevronsLeft } from 'lucide-react';

interface GroupShifterProps {
  availableGroups: string[];
  destinationGroups: string[];
  onTransferToDestination: (group: string) => void;
  onTransferToAvailable: (group: string) => void;
  onTransferAllToDestination: () => void;
  onTransferAllToAvailable: () => void;
}

export const GroupShifter: React.FC<GroupShifterProps> = ({
  availableGroups,
  destinationGroups,
  onTransferToDestination,
  onTransferToAvailable,
  onTransferAllToDestination,
  onTransferAllToAvailable,
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
    <div className="bg-[#fafafa] border border-gray-200 rounded-xl p-3.5 shadow-2xs h-full flex flex-col justify-center">
      <div className="grid grid-cols-11 gap-2 items-center">
        
        {/* Available Group */}
        <div className="col-span-5 flex flex-col">
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">
            Available Group
          </label>
          <div className="h-[135px] bg-white border border-slate-200 rounded-lg p-1.5 overflow-y-auto space-y-0.5">
            {availableGroups.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-12 italic">
                Empty
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
                  className={`px-2.5 py-1 rounded text-xs transition cursor-pointer select-none truncate ${
                    selectedAvailable === group
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  title={`${group} (Double-click to move)`}
                >
                  {group}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle buttons: >, >>, <, << */}
        <div className="col-span-1 flex flex-col items-center justify-center gap-1 pt-5">
          {/* > Move one */}
          <button
            type="button"
            onClick={handleShiftOneRight}
            disabled={availableGroups.length === 0}
            className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition"
            title="Move selected (>)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* >> Move all */}
          <button
            type="button"
            onClick={onTransferAllToDestination}
            disabled={availableGroups.length === 0}
            className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition"
            title="Move all (>>)"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>

          {/* < Remove one */}
          <button
            type="button"
            onClick={handleShiftOneLeft}
            disabled={destinationGroups.length === 0}
            className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition"
            title="Remove selected (<)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* << Remove all */}
          <button
            type="button"
            onClick={onTransferAllToAvailable}
            disabled={destinationGroups.length === 0}
            className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition"
            title="Remove all (<<)"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Group */}
        <div className="col-span-5 flex flex-col">
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">
            Destination Group
          </label>
          <div className="h-[135px] bg-white border border-slate-200 rounded-lg p-1.5 overflow-y-auto space-y-0.5">
            {destinationGroups.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-12 italic">
                Empty
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
                  className={`px-2.5 py-1 rounded text-xs transition cursor-pointer select-none truncate ${
                    selectedDestination === group
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  title={`${group} (Double-click to remove)`}
                >
                  {group}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
