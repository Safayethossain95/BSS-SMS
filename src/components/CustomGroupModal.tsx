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
  // Form State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [stagedTargets, setStagedTargets] = useState<CustomGroupTarget[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Quick Append to Existing Group mode
  const [quickAppendGroupId, setQuickAppendGroupId] = useState('');
  const [quickAppendSuccess, setQuickAppendSuccess] = useState(false);

  // Sync initial class & section when modal opens
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
  }, [isOpen, initialSelectedClassId, initialSelectedSectionId, classes]);

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

  // Add selected class & section to staged targets
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

    // Check duplicate
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

  // Save new or updated group
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setGroupName('');
    setStagedTargets([]);
    setErrorMessage('');
  };

  // Quick append current selected class/sec to an existing group
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
        className="relative bg-[#fafafa] border border-gray-300 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1b1e42] flex items-center justify-center text-white shadow-2xs">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                Custom Groups Manager
                <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                  {customGroups.length} Groups
                </span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Group multiple classes and sections together. Once created, they appear in Available Groups.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">

          {/* Quick Append Box if groups exist */}
          {customGroups.length > 0 && !editingGroupId && (
            <div className="p-3 bg-white rounded-xl border border-gray-300 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1b1e42]" />
                  Quick Add Currently Selected Class &amp; Section:
                </span>
                {quickAppendSuccess && (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Added successfully!
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-800 font-medium rounded-lg border border-gray-200">
                  {currentClass?.name || 'Class'} &bull; {sections.find(s => s.id === selectedSectionId)?.name || 'All Sections'}
                </span>

                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

                <select
                  value={quickAppendGroupId}
                  onChange={(e) => setQuickAppendGroupId(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:border-[#1b1e42] shadow-2xs"
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
                  className="px-3 py-1 bg-white hover:bg-gray-100 text-[#1b1e42] font-semibold text-xs rounded-lg border border-gray-300 shadow-2xs transition cursor-pointer"
                >
                  + Add to this Group
                </button>
              </div>
            </div>
          )}

          {/* Form: Create or Edit Custom Group */}
          <form
            onSubmit={handleSaveGroup}
            className={`p-4 rounded-xl border shadow-2xs transition-colors ${
              editingGroupId ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                {editingGroupId ? (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                    Editing Custom Group: <span className="underline">{groupName}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-[#1b1e42]" />
                    Create New Custom Group
                  </>
                )}
              </span>

              {editingGroupId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-gray-600 hover:text-gray-900 underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-3 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Group Name */}
            <div className="mb-3">
              <label htmlFor="group-name-input" className="block text-[11px] font-semibold text-gray-700 mb-1">
                Group Name: <span className="text-red-500">*</span>
              </label>
              <input
                id="group-name-input"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Morning Shift Primary, Junior Classes (Play+Nur), Bus Route A..."
                className="w-full bg-white border border-gray-300 focus:border-[#1b1e42] rounded-lg px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none shadow-2xs"
              />
            </div>

            {/* Section Picker for this Group */}
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                Add Classes &amp; Sections to this Group:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* Class selector */}
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:border-[#1b1e42] shadow-2xs"
                >
                  <option value="" disabled>Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Section selector */}
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:border-[#1b1e42] shadow-2xs"
                >
                  <option value="all">All Sections</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* Add button */}
                <button
                  type="button"
                  onClick={handleAddTargetToStage}
                  className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-100 text-[#1b1e42] font-semibold text-xs rounded-lg border border-gray-300 shadow-2xs cursor-pointer transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Group</span>
                </button>
              </div>

              {/* Staged items badge list */}
              <div className="mt-2.5 pt-2 border-t border-gray-200">
                <span className="text-[10px] text-gray-500 block mb-1">
                  Included in this group ({stagedTargets.length} sections &bull;{' '}
                  {calculateGroupStudentCount(stagedTargets)} students):
                </span>

                {stagedTargets.length === 0 ? (
                  <div className="text-xs text-gray-400 italic py-1">
                    No classes or sections added to this group yet. Use dropdowns above and click &quot;Add to Group&quot;.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {stagedTargets.map((target, idx) => {
                      const count = calculateTargetStudentCount(target);
                      return (
                        <span
                          key={`${target.classId}-${target.sectionId}-${idx}`}
                          className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1 rounded-md shadow-2xs"
                        >
                          <span className="font-medium">{target.className}</span>
                          <span className="text-gray-400">&bull;</span>
                          <span className="text-slate-600">{target.sectionName}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded">
                            {count} std
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTarget(idx)}
                            className="p-0.5 text-gray-400 hover:text-red-600 rounded transition cursor-pointer"
                            title="Remove from group"
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
            <div className="flex items-center justify-end gap-2">
              {editingGroupId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1b1e42] hover:bg-[#d91920] text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-xs active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingGroupId ? 'Update Custom Group' : 'Save Custom Group'}</span>
              </button>
            </div>
          </form>

          {/* List of Existing Custom Groups */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-600" />
                Existing Custom Groups ({customGroups.length})
              </span>
              <span className="text-[11px] text-gray-500">
                These are automatically available in Available Group
              </span>
            </div>

            {customGroups.length === 0 ? (
              <div className="p-6 bg-white border border-gray-300 rounded-xl text-center text-xs text-gray-500 shadow-2xs">
                No custom groups created yet. Combine multiple classes above to target them together.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {customGroups.map((group) => {
                  const studentCount = calculateGroupStudentCount(group.targets);
                  const isCurrentEditing = editingGroupId === group.id;

                  return (
                    <div
                      key={group.id}
                      className={`p-3 rounded-xl border transition shadow-2xs flex flex-col justify-between ${
                        isCurrentEditing
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              {group.name}
                            </h4>
                            <span className="text-[10px] text-gray-500">
                              Created: {group.createdAt}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(group)}
                              className="p-1 text-gray-500 hover:text-[#1b1e42] hover:bg-gray-100 rounded transition cursor-pointer"
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
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
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
                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200"
                            >
                              {t.className} &bull; {t.sectionName}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-500" />
                          <strong>{studentCount}</strong> students matching
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Active in Available
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
        <div className="p-3 bg-white border-t border-gray-300 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

