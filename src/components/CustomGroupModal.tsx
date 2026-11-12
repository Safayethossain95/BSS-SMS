import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Users,
  Check,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import type { ClassInfo, Student, CustomGroup, CustomGroupTarget } from '../types';

interface CustomGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassInfo[];
  students: Student[];
  customGroups: CustomGroup[];
  onCreateCustomGroup: (group: CustomGroup) => void;
  onUpdateCustomGroup: (group: CustomGroup) => void;
  onDeleteCustomGroup: (id: string) => void;
  initialSelectedClassId?: string;
  initialSelectedSectionId?: string;
}

export const CustomGroupModal: React.FC<CustomGroupModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  customGroups,
  onCreateCustomGroup,
  onUpdateCustomGroup,
  onDeleteCustomGroup,
  initialSelectedClassId,
  initialSelectedSectionId,
}) => {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [stagedTargets, setStagedTargets] = useState<CustomGroupTarget[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const [quickAppendGroupId, setQuickAppendGroupId] = useState('');
  const [quickAppendSuccess, setQuickAppendSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const clsId = initialSelectedClassId || (classes[0]?.id ?? '');
      setSelectedClassId(clsId);

      const cls = classes.find((c) => c.id === clsId);
      if (initialSelectedSectionId) {
        setSelectedSectionId(initialSelectedSectionId);
      } else if (cls && cls.sections.length > 0) {
        setSelectedSectionId(cls.sections[0].id);
      } else {
        setSelectedSectionId('');
      }

      setEditingGroupId(null);
      setGroupName('');
      setStagedTargets([]);
      setErrorMessage('');
      setQuickAppendGroupId(customGroups[0]?.id || '');
      setQuickAppendSuccess(false);
    }
  }, [isOpen, initialSelectedClassId, initialSelectedSectionId, classes, customGroups]);

  if (!isOpen) return null;

  const currentClass = classes.find((c) => c.id === selectedClassId);
  const sections = currentClass?.sections || [];

  const handleClassChange = (clsId: string) => {
    setSelectedClassId(clsId);
    const cls = classes.find((c) => c.id === clsId);
    if (cls && cls.sections.length > 0) {
      setSelectedSectionId(cls.sections[0].id);
    } else {
      setSelectedSectionId('');
    }
  };

  const calculateTargetStudentCount = (target: CustomGroupTarget) => {
    return students.filter((s) => {
      const clsMatch = s.className.toLowerCase() === target.className.toLowerCase();
      if (!clsMatch) return false;
      if (target.sectionName === 'All Sections') return true;
      return s.section.toLowerCase() === target.sectionName.toLowerCase();
    }).length;
  };

  const calculateGroupStudentCount = (targets: CustomGroupTarget[]) => {
    const matchedStudentIds = new Set<string>();
    targets.forEach((t) => {
      students.forEach((s) => {
        const clsMatch = s.className.toLowerCase() === t.className.toLowerCase();
        if (clsMatch) {
          if (t.sectionName === 'All Sections' || s.section.toLowerCase() === t.sectionName.toLowerCase()) {
            matchedStudentIds.add(s.id);
          }
        }
      });
    });
    return matchedStudentIds.size;
  };

  const handleAddTargetToStage = () => {
    if (!selectedClassId) {
      setErrorMessage('Please select a class first.');
      return;
    }

    const cls = classes.find((c) => c.id === selectedClassId);
    if (!cls) return;

    let secName = 'All Sections';
    let secId = 'all';

    if (selectedSectionId && selectedSectionId !== 'all') {
      const sec = cls.sections.find((s) => s.id === selectedSectionId);
      if (sec) {
        secName = sec.name;
        secId = sec.id;
      }
    }

    const alreadyExists = stagedTargets.some(
      (t) => t.classId === cls.id && t.sectionId === secId
    );

    if (alreadyExists) {
      setErrorMessage(`"${cls.name} (${secName})" is already added.`);
      return;
    }

    const newTarget: CustomGroupTarget = {
      classId: cls.id,
      className: cls.name,
      sectionId: secId,
      sectionName: secName,
    };

    setStagedTargets((prev) => [...prev, newTarget]);
    setErrorMessage('');
  };

  const handleRemoveTarget = (index: number) => {
    setStagedTargets((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setErrorMessage('Please provide a name for the custom group.');
      return;
    }

    if (stagedTargets.length === 0) {
      setErrorMessage('Please add at least one Class & Section to the group.');
      return;
    }

    if (editingGroupId) {
      const updated: CustomGroup = {
        id: editingGroupId,
        name: groupName.trim(),
        targets: stagedTargets,
        createdAt: new Date().toLocaleDateString(),
      };
      onUpdateCustomGroup(updated);
      setEditingGroupId(null);
    } else {
      const newGroup: CustomGroup = {
        id: `cg-${Date.now()}`,
        name: groupName.trim(),
        targets: stagedTargets,
        createdAt: new Date().toLocaleDateString(),
      };
      onCreateCustomGroup(newGroup);
    }

    setGroupName('');
    setStagedTargets([]);
    setErrorMessage('');
  };

  const handleStartEdit = (group: CustomGroup) => {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setStagedTargets([...group.targets]);
    setErrorMessage('');
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setGroupName('');
    setStagedTargets([]);
    setErrorMessage('');
  };

  const handleQuickAppend = () => {
    if (!quickAppendGroupId) return;
    const targetGroup = customGroups.find((g) => g.id === quickAppendGroupId);
    if (!targetGroup) return;

    const cls = classes.find((c) => c.id === selectedClassId);
    if (!cls) return;

    let secName = 'All Sections';
    let secId = 'all';
    if (selectedSectionId && selectedSectionId !== 'all') {
      const sec = cls.sections.find((s) => s.id === selectedSectionId);
      if (sec) {
        secName = sec.name;
        secId = sec.id;
      }
    }

    const alreadyExists = targetGroup.targets.some(
      (t) => t.classId === cls.id && t.sectionId === secId
    );

    if (alreadyExists) {
      setErrorMessage(`This section is already in "${targetGroup.name}".`);
      return;
    }

    const updated: CustomGroup = {
      ...targetGroup,
      targets: [
        ...targetGroup.targets,
        {
          classId: cls.id,
          className: cls.name,
          sectionId: secId,
          sectionName: secName,
        },
      ],
    };

    onUpdateCustomGroup(updated);
    setQuickAppendSuccess(true);
    setErrorMessage('');
    setTimeout(() => setQuickAppendSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-surface border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
              <FolderPlus className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                Custom Groups Manager
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-ink border border-gray-200 dark:border-zinc-800">
                  {customGroups.length} Groups
                </span>
              </h3>
              <p className="text-[11px] text-ink-muted">
                Combine multiple classes and sections into reusable target groups.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">

          {/* Quick Append Box */}
          {customGroups.length > 0 && !editingGroupId && (
            <div className="p-3 bg-surface-2 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1b1e42] dark:text-accent" />
                  Quick Add Active Selection:
                </span>
                {quickAppendSuccess && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Added!
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-surface text-ink font-medium rounded-full border border-gray-200 dark:border-zinc-800 shadow-2xs">
                  {currentClass?.name || 'Class'} &bull; {sections.find(s => s.id === selectedSectionId)?.name || 'All Sections'}
                </span>

                <ChevronRight className="w-3.5 h-3.5 text-ink-faint" />

                <select
                  value={quickAppendGroupId}
                  onChange={(e) => setQuickAppendGroupId(e.target.value)}
                  className="bg-surface border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-[#1b1e42] shadow-2xs font-medium cursor-pointer"
                >
                  {customGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      Add to &quot;{g.name}&quot;
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleQuickAppend}
                  className="px-4 py-1.5 bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs rounded-full shadow-2xs transition cursor-pointer"
                >
                  + Add to Group
                </button>
              </div>
            </div>
          )}

          {/* Form: Create or Edit Custom Group */}
          <form
            onSubmit={handleSaveGroup}
            className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-surface-2/40 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                {editingGroupId ? (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                    Editing: <span className="text-ink normal-case font-bold">{groupName}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-[#1b1e42] dark:text-accent" />
                    Create Custom Group
                  </>
                )}
              </span>

              {editingGroupId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-ink-muted hover:text-ink underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Group Name */}
            <div>
              <label htmlFor="group-name-input" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Group Name: <span className="text-brand-red">*</span>
              </label>
              <input
                id="group-name-input"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Primary Wing, Junior Play+Nur, Morning Shift..."
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors"
              />
            </div>

            {/* Class & Section Picker */}
            <div className="p-3 bg-surface rounded-xl border border-gray-200 dark:border-zinc-800">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none">
                Add Classes &amp; Sections to this Group:
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="bg-surface-2 border border-transparent focus:border-[#1b1e42] text-ink rounded-xl px-3 py-2 text-xs font-medium outline-none cursor-pointer"
                >
                  <option value="" disabled>Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="bg-surface-2 border border-transparent focus:border-[#1b1e42] text-ink rounded-xl px-3 py-2 text-xs font-medium outline-none cursor-pointer"
                >
                  <option value="all">All Sections</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddTargetToStage}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-surface-2 hover:bg-surface-3 text-ink font-semibold text-xs rounded-full border border-gray-200 dark:border-zinc-800 transition shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Group</span>
                </button>
              </div>

              {/* Staged Badges */}
              <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-zinc-800">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-faint block mb-1.5">
                  Included Targets ({stagedTargets.length} sections &bull; {calculateGroupStudentCount(stagedTargets)} students):
                </span>

                {stagedTargets.length === 0 ? (
                  <div className="text-xs text-ink-faint italic py-1">
                    No classes or sections added yet. Select from dropdowns and click &quot;Add to Group&quot;.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {stagedTargets.map((target, idx) => {
                      const count = calculateTargetStudentCount(target);
                      return (
                        <span
                          key={`${target.classId}-${target.sectionId}-${idx}`}
                          className="inline-flex items-center gap-1.5 bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink text-xs px-3 py-1 rounded-full shadow-2xs"
                        >
                          <span className="font-semibold">{target.className}</span>
                          <span className="text-ink-faint">&bull;</span>
                          <span className="text-ink-muted">{target.sectionName}</span>
                          <span className="text-[10px] bg-surface text-ink px-1.5 py-0.2 rounded-full border border-gray-200 dark:border-zinc-800 font-mono">
                            {count} std
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTarget(idx)}
                            className="p-0.5 text-ink-faint hover:text-brand-red transition cursor-pointer"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              {editingGroupId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-xs font-semibold rounded-full bg-surface-2 hover:bg-surface-3 text-ink transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingGroupId ? 'Update Group' : 'Save Custom Group'}</span>
              </button>
            </div>
          </form>

          {/* List of Existing Custom Groups */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Existing Custom Groups ({customGroups.length})
              </span>
            </div>

            {customGroups.length === 0 ? (
              <div className="p-6 bg-surface-2/40 border border-gray-200 dark:border-zinc-800 rounded-2xl text-center text-xs text-ink-muted shadow-2xs">
                No custom groups created yet. Combine multiple classes above to target them together.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customGroups.map((group) => {
                  const studentCount = calculateGroupStudentCount(group.targets);
                  const isCurrentEditing = editingGroupId === group.id;

                  return (
                    <div
                      key={group.id}
                      className={`p-3.5 rounded-2xl border transition shadow-2xs flex flex-col justify-between ${
                        isCurrentEditing
                          ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300'
                          : 'bg-surface border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        {/* Top info */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="text-xs font-bold text-ink">
                              {group.name}
                            </h4>
                            <span className="text-[10px] text-ink-faint">
                              Created: {group.createdAt}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(group)}
                              className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-2 rounded-full transition cursor-pointer"
                              title="Edit group"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete custom group "${group.name}"?`)) {
                                  onDeleteCustomGroup(group.id);
                                }
                              }}
                              className="p-1.5 text-ink-faint hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full transition cursor-pointer"
                              title="Delete group"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Badges of targets */}
                        <div className="flex flex-wrap gap-1 my-2">
                          {group.targets.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10.5px] px-2 py-0.5 rounded-full bg-surface-2 text-ink border border-gray-200 dark:border-zinc-800 font-medium"
                            >
                              {t.className} &bull; {t.sectionName}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs text-ink-muted">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Users className="w-3 h-3 text-ink-faint" />
                          <strong className="text-ink">{studentCount}</strong> students matching
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          In Available
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-surface border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-surface-2 hover:bg-surface-3 text-ink transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
